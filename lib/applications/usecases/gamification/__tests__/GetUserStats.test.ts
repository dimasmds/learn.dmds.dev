import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetUserStatsUseCase } from '../GetUserStats';
import { Streak } from '@/lib/domains/gamification/entities/Streak';
import { createMockUseCaseDependencies } from '@/lib/tests/helpers/factories';

describe('GetUserStatsUseCase', () => {
  const mockDeps = createMockUseCaseDependencies();
  let useCase: GetUserStatsUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetUserStatsUseCase(mockDeps);
  });

  it('should return total XP, streak, badge count, and recent transactions', async () => {
    const streak = Streak.create({
      userId: 'user-1',
      currentCount: 5,
      longestCount: 10,
      lastActivityDate: '2026-01-15',
      freezeCount: 2,
    });

    (mockDeps.gamificationRepository.getTotalXP as ReturnType<typeof vi.fn>).mockResolvedValue(500);
    (mockDeps.gamificationRepository.getStreak as ReturnType<typeof vi.fn>).mockResolvedValue(streak);
    (mockDeps.gamificationRepository.getUserBadges as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'ub-1', props: { badgeId: 'badge-1' } },
      { id: 'ub-2', props: { badgeId: 'badge-2' } },
    ]);
    (mockDeps.gamificationRepository.getXPTransactions as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.totalXP).toBe(500);
    expect(result.streak).toBe(streak);
    expect(result.badgeCount).toBe(2);
    expect(result.recentTransactions).toHaveLength(0);
  });

  it('should return zero values and null streak when user has no activity', async () => {
    (mockDeps.gamificationRepository.getTotalXP as ReturnType<typeof vi.fn>).mockResolvedValue(0);
    (mockDeps.gamificationRepository.getStreak as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (mockDeps.gamificationRepository.getUserBadges as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (mockDeps.gamificationRepository.getXPTransactions as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const result = await useCase.execute({ userId: 'user-2' });

    expect(result.totalXP).toBe(0);
    expect(result.streak).toBeNull();
    expect(result.badgeCount).toBe(0);
    expect(result.recentTransactions).toHaveLength(0);
  });

  it('should pass limit=10 to getXPTransactions', async () => {
    (mockDeps.gamificationRepository.getTotalXP as ReturnType<typeof vi.fn>).mockResolvedValue(0);
    (mockDeps.gamificationRepository.getStreak as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (mockDeps.gamificationRepository.getUserBadges as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (mockDeps.gamificationRepository.getXPTransactions as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    await useCase.execute({ userId: 'user-1' });

    expect(mockDeps.gamificationRepository.getXPTransactions).toHaveBeenCalledWith('user-1', 10);
  });
});
