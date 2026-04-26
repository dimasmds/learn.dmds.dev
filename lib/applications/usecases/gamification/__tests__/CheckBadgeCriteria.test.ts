import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CheckBadgeCriteriaUseCase } from '../CheckBadgeCriteria';
import { Badge } from '@/lib/domains/gamification/entities/Badge';
import { UserBadge } from '@/lib/domains/gamification/entities/UserBadge';
import { createMockUseCaseDependencies } from '@/lib/tests/helpers/factories';
import { UserProgress } from '@/lib/domains/progress/entities/UserProgress';

describe('CheckBadgeCriteriaUseCase', () => {
  const mockDeps = createMockUseCaseDependencies();
  let useCase: CheckBadgeCriteriaUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    (mockDeps.gamificationRepository.awardBadge as ReturnType<typeof vi.fn>).mockImplementation(
      async (userId: string, badgeId: string) => UserBadge.create({ userId, badgeId }),
    );
    useCase = new CheckBadgeCriteriaUseCase(mockDeps);
  });

  it('should award badge when lessons_completed criteria is met', async () => {
    const badge = Badge.create({
      name: 'Lesson Master',
      description: 'Complete 3 lessons',
      icon: '🏅',
      type: 'completion',
      category: 'learning',
      criteria: { type: 'lessons_completed', count: 3 },
      xpReward: 50,
    });

    (mockDeps.gamificationRepository.getAllBadges as ReturnType<typeof vi.fn>).mockResolvedValue([badge]);
    (mockDeps.gamificationRepository.getUserBadges as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (mockDeps.gamificationRepository.getTotalXP as ReturnType<typeof vi.fn>).mockResolvedValue(100);
    (mockDeps.gamificationRepository.getStreak as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    // 3 completed steps across 3 different lessons
    const steps = [
      UserProgress.create({ userId: 'user-1', stepId: 's1', lessonId: 'l1', status: 'COMPLETED' }),
      UserProgress.create({ userId: 'user-1', stepId: 's2', lessonId: 'l2', status: 'COMPLETED' }),
      UserProgress.create({ userId: 'user-1', stepId: 's3', lessonId: 'l3', status: 'COMPLETED' }),
    ];
    (mockDeps.progressRepository.getUserProgress as ReturnType<typeof vi.fn>).mockResolvedValue(steps);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result).toHaveLength(1);
    expect(result[0].props.badgeId).toBe(badge.id);
    expect(mockDeps.gamificationRepository.awardBadge).toHaveBeenCalledTimes(1);
  });

  it('should award badge when total_xp criteria is met', async () => {
    const badge = Badge.create({
      name: 'XP Hunter',
      description: 'Earn 100 XP',
      icon: '⚡',
      type: 'xp',
      category: 'mastery',
      criteria: { type: 'total_xp', count: 100 },
      xpReward: 0,
    });

    (mockDeps.gamificationRepository.getAllBadges as ReturnType<typeof vi.fn>).mockResolvedValue([badge]);
    (mockDeps.gamificationRepository.getUserBadges as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (mockDeps.gamificationRepository.getTotalXP as ReturnType<typeof vi.fn>).mockResolvedValue(150);
    (mockDeps.gamificationRepository.getStreak as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (mockDeps.progressRepository.getUserProgress as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result).toHaveLength(1);
    expect(mockDeps.gamificationRepository.awardBadge).toHaveBeenCalledTimes(1);
  });

  it('should NOT award badge when criteria is NOT met', async () => {
    const badge = Badge.create({
      name: 'Streaker',
      description: '7 day streak',
      icon: '🔥',
      type: 'streak',
      category: 'streak',
      criteria: { type: 'streak_days', count: 7 },
      xpReward: 100,
    });

    const streak = { props: { currentCount: 3 } } as any;
    (mockDeps.gamificationRepository.getAllBadges as ReturnType<typeof vi.fn>).mockResolvedValue([badge]);
    (mockDeps.gamificationRepository.getUserBadges as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (mockDeps.gamificationRepository.getTotalXP as ReturnType<typeof vi.fn>).mockResolvedValue(50);
    (mockDeps.gamificationRepository.getStreak as ReturnType<typeof vi.fn>).mockResolvedValue(streak);
    (mockDeps.progressRepository.getUserProgress as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result).toHaveLength(0);
    expect(mockDeps.gamificationRepository.awardBadge).not.toHaveBeenCalled();
  });

  it('should NOT award badge that user already has', async () => {
    const badge = Badge.create({
      name: 'First Step',
      description: 'Complete 1 step',
      icon: '👟',
      type: 'completion',
      category: 'learning',
      criteria: { type: 'step_types_completed', count: 1 },
      xpReward: 10,
    });

    const existingUserBadge = UserBadge.create({ userId: 'user-1', badgeId: badge.id });
    (mockDeps.gamificationRepository.getAllBadges as ReturnType<typeof vi.fn>).mockResolvedValue([badge]);
    (mockDeps.gamificationRepository.getUserBadges as ReturnType<typeof vi.fn>).mockResolvedValue([existingUserBadge]);
    (mockDeps.gamificationRepository.getTotalXP as ReturnType<typeof vi.fn>).mockResolvedValue(0);
    (mockDeps.gamificationRepository.getStreak as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (mockDeps.progressRepository.getUserProgress as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result).toHaveLength(0);
    expect(mockDeps.gamificationRepository.awardBadge).not.toHaveBeenCalled();
  });

  it('should award multiple badges when multiple criteria are met', async () => {
    const badge1 = Badge.create({
      name: 'Starter',
      description: 'Earn 10 XP',
      icon: '⭐',
      type: 'xp',
      category: 'learning',
      criteria: { type: 'total_xp', count: 10 },
      xpReward: 0,
    });
    const badge2 = Badge.create({
      name: 'Perfectionist',
      description: '5 perfect steps',
      icon: '💯',
      type: 'perfect',
      category: 'mastery',
      criteria: { type: 'perfect_steps', count: 5 },
      xpReward: 50,
    });

    (mockDeps.gamificationRepository.getAllBadges as ReturnType<typeof vi.fn>).mockResolvedValue([badge1, badge2]);
    (mockDeps.gamificationRepository.getUserBadges as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (mockDeps.gamificationRepository.getTotalXP as ReturnType<typeof vi.fn>).mockResolvedValue(50);
    (mockDeps.gamificationRepository.getStreak as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const steps = Array.from({ length: 5 }, (_, i) =>
      UserProgress.create({ userId: 'user-1', stepId: `s${i}`, lessonId: `l${i}`, status: 'COMPLETED' }),
    );
    (mockDeps.progressRepository.getUserProgress as ReturnType<typeof vi.fn>).mockResolvedValue(steps);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result).toHaveLength(2);
    expect(mockDeps.gamificationRepository.awardBadge).toHaveBeenCalledTimes(2);
  });
});
