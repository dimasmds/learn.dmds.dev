import { ApplicationUseCase } from '@kopiketuk/framework';
import { Streak } from '../../../domains/gamification/entities/Streak';
import type { LearnDmdsUseCaseDependencies } from '../base/dependencies';

export interface UpdateStreakInput {
  userId: string;
}

export class UpdateStreakUseCase extends ApplicationUseCase<UpdateStreakInput, Streak> {
  private readonly gamificationRepo = this.deps.gamificationRepository;

  constructor(private deps: LearnDmdsUseCaseDependencies) {
    super(deps);
  }

  protected async run(payload: UpdateStreakInput): Promise<Streak> {
    // Get today's date in WIB timezone (UTC+7)
    const now = new Date();
    const wibOffset = 7 * 60 * 60 * 1000; // 7 hours in ms
    const wibDate = new Date(now.getTime() + wibOffset);
    const todayDate = wibDate.toISOString().split('T')[0]; // YYYY-MM-DD

    let streak = await this.gamificationRepo.getStreak(payload.userId);

    if (!streak) {
      // Create new streak
      streak = Streak.create({
        userId: payload.userId,
        currentCount: 1,
        longestCount: 1,
        lastActivityDate: todayDate,
        freezeCount: 0,
      });
    } else if (streak.props.lastActivityDate === todayDate) {
      // Already updated today — no-op
      return streak;
    } else if (streak.isBroken(todayDate)) {
      // Streak is broken, reset then set to 1 with today's date
      streak.reset();
      streak = Streak.reconstitute(streak.id, {
        ...streak.props,
        currentCount: 1,
        lastActivityDate: todayDate,
        updatedAt: new Date(),
      });
    } else {
      // Consecutive day, increment
      streak.increment(todayDate);
    }

    // Upsert via repository
    const saved = await this.gamificationRepo.upsertStreak(streak);
    return saved;
  }
}
