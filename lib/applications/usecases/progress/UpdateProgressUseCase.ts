import { ApplicationUseCase, InvariantError } from '@kopiketuk/framework';
import { CompletionStatus } from '@/lib/domains/progress/value-objects/CompletionStatus';
import type { LearnDmdsUseCaseDependencies } from '../base/dependencies';

export interface UpdateProgressInput {
  userId: string;
  stepId: string;
  status: string;
}

export interface UpdateProgressOutput {
  id: string;
  stepId: string;
  lessonId: string;
  status: string;
  attempts: number;
  completedAt: Date | null;
}

export class UpdateProgressUseCase extends ApplicationUseCase<UpdateProgressInput, UpdateProgressOutput> {
  private readonly progressRepository = this.deps.progressRepository;

  constructor(private deps: LearnDmdsUseCaseDependencies) {
    super(deps);
  }

  protected async run(payload: UpdateProgressInput): Promise<UpdateProgressOutput> {
    if (!payload.userId || payload.userId.trim().length === 0) {
      throw new InvariantError('UPDATE_PROGRESS.EMPTY_USER_ID');
    }
    if (!payload.stepId || payload.stepId.trim().length === 0) {
      throw new InvariantError('UPDATE_PROGRESS.EMPTY_STEP_ID');
    }
    // Validate status
    CompletionStatus.create(payload.status);

    const progress = await this.progressRepository.upsertProgress(
      payload.userId,
      payload.stepId,
      payload.status,
    );

    return {
      id: progress.id,
      stepId: progress.props.stepId,
      lessonId: progress.props.lessonId,
      status: progress.props.status,
      attempts: progress.props.attempts,
      completedAt: progress.props.completedAt,
    };
  }
}
