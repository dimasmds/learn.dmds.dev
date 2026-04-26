import { ApplicationUseCase, InvariantError } from '@kopiketuk/framework';
import type { LearnDmdsUseCaseDependencies } from '../base/dependencies';

export interface GetLessonDetailInput {
  lessonId: string;
}

export interface GetLessonDetailOutput {
  lesson: {
    id: string;
    unitId: string;
    title: string;
    slug: string;
    description: string;
    order: number;
  };
  steps: {
    id: string;
    type: string;
    order: number;
    instruction: string;
    content: Record<string, unknown>;
    xpReward: number;
  }[];
}

export class GetLessonDetailUseCase extends ApplicationUseCase<GetLessonDetailInput, GetLessonDetailOutput> {
  private readonly learningRepository = this.deps.learningRepository;

  constructor(private deps: LearnDmdsUseCaseDependencies) {
    super(deps);
  }

  protected async run(payload: GetLessonDetailInput): Promise<GetLessonDetailOutput> {
    const lesson = await this.learningRepository.getLessonById(payload.lessonId);
    if (!lesson) {
      throw new InvariantError('GET_LESSON_DETAIL.LESSON_NOT_FOUND');
    }

    const steps = await this.learningRepository.getStepsByLessonId(payload.lessonId);

    return {
      lesson: {
        id: lesson.id,
        unitId: lesson.props.unitId,
        title: lesson.props.title,
        slug: lesson.props.slug,
        description: lesson.props.description,
        order: lesson.props.order,
      },
      steps: steps.map((s) => ({
        id: s.id,
        type: s.props.type,
        order: s.props.order,
        instruction: s.props.instruction,
        content: s.props.content,
        xpReward: s.props.xpReward,
      })),
    };
  }
}
