import { ApplicationUseCase } from '@kopiketuk/framework';
import type { LearnDmdsUseCaseDependencies } from '../base/dependencies';

export interface GetUserProgressInput {
  userId: string;
}

export interface GetUserProgressOutput {
  progress: {
    id: string;
    stepId: string;
    lessonId: string;
    status: string;
    attempts: number;
    completedAt: Date | null;
  }[];
}

export class GetUserProgressUseCase extends ApplicationUseCase<GetUserProgressInput, GetUserProgressOutput> {
  private readonly progressRepository = this.deps.progressRepository;

  constructor(private deps: LearnDmdsUseCaseDependencies) {
    super(deps);
  }

  protected async run(payload: GetUserProgressInput): Promise<GetUserProgressOutput> {
    const progress = await this.progressRepository.getUserProgress(payload.userId);
    return {
      progress: progress.map((p) => ({
        id: p.id,
        stepId: p.props.stepId,
        lessonId: p.props.lessonId,
        status: p.props.status,
        attempts: p.props.attempts,
        completedAt: p.props.completedAt,
      })),
    };
  }
}
