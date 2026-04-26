import { ApplicationUseCase } from '@kopiketuk/framework';
import { Badge } from '../../../domains/gamification/entities/Badge';
import { UserBadge } from '../../../domains/gamification/entities/UserBadge';
import type { LearnDmdsUseCaseDependencies } from '../base/dependencies';

export interface GetBadgesInput {
  userId?: string;
}

export interface GetBadgesOutput {
  allBadges: Badge[];
  userBadges: UserBadge[];
}

export class GetBadgesUseCase extends ApplicationUseCase<GetBadgesInput, GetBadgesOutput> {
  private readonly gamificationRepo = this.deps.gamificationRepository;

  constructor(private deps: LearnDmdsUseCaseDependencies) {
    super(deps);
  }

  protected async run(payload: GetBadgesInput): Promise<GetBadgesOutput> {
    const allBadges = await this.gamificationRepo.getAllBadges();

    let userBadges: UserBadge[] = [];
    if (payload.userId) {
      userBadges = await this.gamificationRepo.getUserBadges(payload.userId);
    }

    return { allBadges, userBadges };
  }
}
