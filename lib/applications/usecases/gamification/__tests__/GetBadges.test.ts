import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetBadgesUseCase } from '../GetBadges';
import { Badge } from '@/lib/domains/gamification/entities/Badge';
import { UserBadge } from '@/lib/domains/gamification/entities/UserBadge';
import { createMockUseCaseDependencies } from '@/lib/tests/helpers/factories';

describe('GetBadgesUseCase', () => {
  const mockDeps = createMockUseCaseDependencies();
  let useCase: GetBadgesUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetBadgesUseCase(mockDeps);
  });

  it('should return all badges and empty userBadges when no userId provided', async () => {
    const badge1 = Badge.create({
      name: 'First Lesson',
      description: 'Complete your first lesson',
      icon: '🏅',
      type: 'first_lesson',
      category: 'learning',
      criteria: { type: 'lessons_completed', count: 1 },
      xpReward: 50,
    });

    (mockDeps.gamificationRepository.getAllBadges as ReturnType<typeof vi.fn>).mockResolvedValue([badge1]);

    const result = await useCase.execute({});

    expect(result.allBadges).toHaveLength(1);
    expect(result.userBadges).toHaveLength(0);
    expect(mockDeps.gamificationRepository.getUserBadges).not.toHaveBeenCalled();
  });

  it('should return all badges and user badges when userId is provided', async () => {
    const badge1 = Badge.create({
      name: 'First Lesson',
      description: 'Complete your first lesson',
      icon: '🏅',
      type: 'first_lesson',
      category: 'learning',
      criteria: { type: 'lessons_completed', count: 1 },
      xpReward: 50,
    });
    const userBadge = UserBadge.create({ userId: 'user-1', badgeId: badge1.id });

    (mockDeps.gamificationRepository.getAllBadges as ReturnType<typeof vi.fn>).mockResolvedValue([badge1]);
    (mockDeps.gamificationRepository.getUserBadges as ReturnType<typeof vi.fn>).mockResolvedValue([userBadge]);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.allBadges).toHaveLength(1);
    expect(result.userBadges).toHaveLength(1);
    expect(result.userBadges[0].props.badgeId).toBe(badge1.id);
    expect(mockDeps.gamificationRepository.getUserBadges).toHaveBeenCalledWith('user-1');
  });

  it('should return empty arrays when no badges exist', async () => {
    (mockDeps.gamificationRepository.getAllBadges as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (mockDeps.gamificationRepository.getUserBadges as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.allBadges).toHaveLength(0);
    expect(result.userBadges).toHaveLength(0);
  });

  it('should call getUserBadges with the correct userId', async () => {
    (mockDeps.gamificationRepository.getAllBadges as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    await useCase.execute({ userId: 'specific-user-id' });

    expect(mockDeps.gamificationRepository.getUserBadges).toHaveBeenCalledWith('specific-user-id');
  });
});
