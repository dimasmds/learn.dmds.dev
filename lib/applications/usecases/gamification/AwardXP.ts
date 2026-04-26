import { ApplicationUseCase, InvariantError } from '@kopiketuk/framework';
import { XPAmount } from '../../../domains/gamification/value-objects/XPAmount';
import { XPTransaction } from '../../../domains/gamification/entities/XPTransaction';
import type { LearnDmdsUseCaseDependencies } from '../base/dependencies';

export interface AwardXPInput {
  userId: string;
  amount: number;
  source: string;
  sourceId: string | null;
  description: string;
}

export class AwardXPUseCase extends ApplicationUseCase<AwardXPInput, XPTransaction> {
  private readonly gamificationRepo = this.deps.gamificationRepository;

  constructor(private deps: LearnDmdsUseCaseDependencies) {
    super(deps);
  }

  protected async run(payload: AwardXPInput): Promise<XPTransaction> {
    // Validate amount via XPAmount (allows 0+)
    const xpAmount = XPAmount.create(payload.amount);

    // Create XP transaction entity
    const transaction = XPTransaction.create({
      userId: payload.userId,
      amount: xpAmount.value,
      source: payload.source,
      sourceId: payload.sourceId,
      description: payload.description,
    });

    // Save via repository
    await this.gamificationRepo.addXPTransaction(transaction);

    return transaction;
  }
}
