import { ApplicationUseCase } from '@kopiketuk/framework';
import { UserBadge } from '../../../domains/gamification/entities/UserBadge';
import type { LearnDmdsUseCaseDependencies } from '../base/dependencies';

export interface CheckBadgeCriteriaInput {
  userId: string;
}

export interface UserStatsForBadge {
  lessonsCompleted: number;
  currentStreak: number;
  totalXP: number;
  stepTypesCompleted: number;
  perfectSteps: number;
}

function checkCriteria(criteria: Record<string, unknown>, userStats: UserStatsForBadge): boolean {
  const { type, count } = criteria as { type: string; count: number };
  switch (type) {
    case 'lessons_completed': return userStats.lessonsCompleted >= count;
    case 'streak_days': return userStats.currentStreak >= count;
    case 'total_xp': return userStats.totalXP >= count;
    case 'step_types_completed': return userStats.stepTypesCompleted >= count;
    case 'perfect_steps': return userStats.perfectSteps >= count;
    default: return false;
  }
}

export class CheckBadgeCriteriaUseCase extends ApplicationUseCase<CheckBadgeCriteriaInput, UserBadge[]> {
  private readonly gamificationRepo = this.deps.gamificationRepository;
  private readonly progressRepo = this.deps.progressRepository;

  constructor(private deps: LearnDmdsUseCaseDependencies) {
    super(deps);
  }

  protected async run(payload: CheckBadgeCriteriaInput): Promise<UserBadge[]> {
    const { userId } = payload;

    // Get all badges and user's earned badges
    const [allBadges, userBadges] = await Promise.all([
      this.gamificationRepo.getAllBadges(),
      this.gamificationRepo.getUserBadges(userId),
    ]);

    const earnedBadgeIds = new Set(userBadges.map((ub) => ub.props.badgeId));

    // Build user stats for badge checking
    const totalXP = await this.gamificationRepo.getTotalXP(userId);
    const streak = await this.gamificationRepo.getStreak(userId);
    const completedSteps = await this.progressRepo.getUserProgress(userId);

    const userStats: UserStatsForBadge = {
      lessonsCompleted: new Set(completedSteps.map((s) => s.props.lessonId)).size,
      currentStreak: streak?.props.currentCount ?? 0,
      totalXP,
      stepTypesCompleted: completedSteps.length,
      perfectSteps: completedSteps.filter((s) => s.props.status === 'COMPLETED').length,
    };

    // Check each unearned badge
    const newlyEarned: UserBadge[] = [];
    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge.id)) continue;

      if (checkCriteria(badge.props.criteria, userStats)) {
        const userBadge = await this.gamificationRepo.awardBadge(userId, badge.id);
        newlyEarned.push(userBadge);
      }
    }

    return newlyEarned;
  }
}
