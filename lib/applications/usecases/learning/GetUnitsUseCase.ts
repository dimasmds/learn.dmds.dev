import { ApplicationUseCase } from '@kopiketuk/framework';
import type { LearnDmdsUseCaseDependencies } from '../base/dependencies';

export interface GetUnitsInput {}

export interface GetUnitsOutput {
  units: {
    id: string;
    title: string;
    description: string;
    slug: string;
    order: number;
    lessonIds: string[];
  }[];
}

export class GetUnitsUseCase extends ApplicationUseCase<GetUnitsInput, GetUnitsOutput> {
  private readonly learningRepository = this.deps.learningRepository;

  constructor(private deps: LearnDmdsUseCaseDependencies) {
    super(deps);
  }

  protected async run(): Promise<GetUnitsOutput> {
    const units = await this.learningRepository.getUnits();
    return {
      units: units.map((u) => ({
        id: u.id,
        title: u.props.title,
        description: u.props.description,
        slug: u.props.slug,
        order: u.props.order,
        lessonIds: u.props.lessonIds,
      })),
    };
  }
}
