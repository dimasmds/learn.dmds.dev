import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateStreakUseCase } from '../UpdateStreak';
import { Streak } from '@/lib/domains/gamification/entities/Streak';
import { createMockUseCaseDependencies } from '@/lib/tests/helpers/factories';

describe('UpdateStreakUseCase', () => {
  const mockDeps = createMockUseCaseDependencies();
  let useCase: UpdateStreakUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    // Make upsertStreak return whatever was passed to it
    (mockDeps.gamificationRepository.upsertStreak as ReturnType<typeof vi.fn>).mockImplementation(
      async (streak: Streak) => streak,
    );
    useCase = new UpdateStreakUseCase(mockDeps);
  });

  it('should create a new streak when none exists', async () => {
    (mockDeps.gamificationRepository.getStreak as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.props.userId).toBe('user-1');
    expect(result.props.currentCount).toBe(1);
    expect(mockDeps.gamificationRepository.upsertStreak).toHaveBeenCalledTimes(1);
  });

  it('should increment streak when last activity was yesterday', async () => {
    const today = new Date();
    const wibOffset = 7 * 60 * 60 * 1000;
    const wibToday = new Date(today.getTime() + wibOffset);
    const todayStr = wibToday.toISOString().split('T')[0];

    // yesterday
    const yesterdayDate = new Date(wibToday);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    const existingStreak = Streak.reconstitute('streak-1', {
      userId: 'user-1',
      currentCount: 3,
      longestCount: 5,
      lastActivityDate: yesterdayStr,
      freezeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (mockDeps.gamificationRepository.getStreak as ReturnType<typeof vi.fn>).mockResolvedValue(existingStreak);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.props.currentCount).toBe(4);
    expect(result.props.longestCount).toBe(5);
    expect(result.props.lastActivityDate).toBe(todayStr);
  });

  it('should reset streak when it is broken (gap > 1 day)', async () => {
    const today = new Date();
    const wibOffset = 7 * 60 * 60 * 1000;
    const wibToday = new Date(today.getTime() + wibOffset);
    const todayStr = wibToday.toISOString().split('T')[0];

    // 5 days ago
    const oldDate = new Date(wibToday);
    oldDate.setDate(oldDate.getDate() - 5);
    const oldDateStr = oldDate.toISOString().split('T')[0];

    const existingStreak = Streak.reconstitute('streak-1', {
      userId: 'user-1',
      currentCount: 10,
      longestCount: 15,
      lastActivityDate: oldDateStr,
      freezeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (mockDeps.gamificationRepository.getStreak as ReturnType<typeof vi.fn>).mockResolvedValue(existingStreak);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.props.currentCount).toBe(1);
    expect(result.props.longestCount).toBe(15); // longest is preserved
    expect(result.props.lastActivityDate).toBe(todayStr);
  });

  it('should return existing streak unchanged when already updated today', async () => {
    const today = new Date();
    const wibOffset = 7 * 60 * 60 * 1000;
    const wibToday = new Date(today.getTime() + wibOffset);
    const todayStr = wibToday.toISOString().split('T')[0];

    const existingStreak = Streak.reconstitute('streak-1', {
      userId: 'user-1',
      currentCount: 5,
      longestCount: 5,
      lastActivityDate: todayStr,
      freezeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (mockDeps.gamificationRepository.getStreak as ReturnType<typeof vi.fn>).mockResolvedValue(existingStreak);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.props.currentCount).toBe(5);
    // upsert should NOT be called since it's a no-op
    expect(mockDeps.gamificationRepository.upsertStreak).not.toHaveBeenCalled();
  });
});
