import { ApplicationUseCase } from '@kopiketuk/framework';
import { Streak } from '../../../domains/gamification/entities/Streak';
import { XPTransaction } from '../../../domains/gamification/entities/XPTransaction';
import type { LearnDmdsUseCaseDependencies } from '../base/dependencies';

export interface GetUserStatsInput {
  userId: string;
}

export interface GetUserStatsOutput {
  totalXP: number;
  streak: Streak | null;
  badgeCount: number;
  recentTransactions: XPTransaction[];
}

export class GetUserStatsUseCase extends ApplicationUseCase<GetUserStatsInput, GetUserStatsOutput> {
  private readonly gamificationRepo = this.deps.gamificationRepository;

  constructor(private deps: LearnDmdsUseCaseDependencies) {
    super(deps);
  }

  protected async run(payload: GetUserStatsInput): Promise<GetUserStatsOutput> {
    const [totalXP, streak, userBadges, recentTransactions] = await Promise.all([
      this.gamificationRepo.getTotalXP(payload.userId),
      this.gamificationRepo.getStreak(payload.userId),
      this.gamificationRepo.getUserBadges(payload.userId),
      this.gamificationRepo.getXPTransactions(payload.userId, 10),
    ]);

    return {
      totalXP,
      streak,
      badgeCount: userBadges.length,
      recentTransactions,
    };
  }
}
