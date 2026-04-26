import { ApplicationUseCase, InvariantError } from '@kopiketuk/framework';
import type { LearnDmdsUseCaseDependencies } from '../base/dependencies';

export interface GetUnitDetailInput {
  unitId: string;
}

export interface GetUnitDetailOutput {
  unit: {
    id: string;
    title: string;
    description: string;
    slug: string;
    order: number;
  };
  lessons: {
    id: string;
    title: string;
    slug: string;
    description: string;
    order: number;
  }[];
}

export class GetUnitDetailUseCase extends ApplicationUseCase<GetUnitDetailInput, GetUnitDetailOutput> {
  private readonly learningRepository = this.deps.learningRepository;

  constructor(private deps: LearnDmdsUseCaseDependencies) {
    super(deps);
  }

  protected async run(payload: GetUnitDetailInput): Promise<GetUnitDetailOutput> {
    const unit = await this.learningRepository.getUnitById(payload.unitId);
    if (!unit) {
      throw new InvariantError('GET_UNIT_DETAIL.UNIT_NOT_FOUND');
    }

    const lessons = await this.learningRepository.getLessonsByUnitId(payload.unitId);

    return {
      unit: {
        id: unit.id,
        title: unit.props.title,
        description: unit.props.description,
        slug: unit.props.slug,
        order: unit.props.order,
      },
      lessons: lessons.map((l) => ({
        id: l.id,
        title: l.props.title,
        slug: l.props.slug,
        description: l.props.description,
        order: l.props.order,
      })),
    };
  }
}
