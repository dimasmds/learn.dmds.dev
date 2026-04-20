import { Entity, InvariantError } from '@kopiketuk/framework';
import { StepType } from '../value-objects/StepType';

export interface StepProps {
  lessonId: string;
  type: string;
  title: string;
  order: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Step extends Entity<string> {
  private _props: StepProps;

  private constructor(props: StepProps, id?: string) {
    super(id ?? crypto.randomUUID());
    this._props = props;
  }

  get props(): StepProps {
    return this._props;
  }

  static create(
    props: Omit<StepProps, 'createdAt' | 'updatedAt'>,
    id?: string,
  ): Step {
    if (!props.lessonId || props.lessonId.trim().length === 0) {
      throw new InvariantError('STEP.EMPTY_LESSON_ID');
    }
    if (!props.title || props.title.trim().length === 0) {
      throw new InvariantError('STEP.EMPTY_TITLE');
    }
    if (props.order < 0) {
      throw new InvariantError('STEP.INVALID_ORDER');
    }
    // Validate step type
    StepType.create(props.type);
    return new Step(
      {
        ...props,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id,
    );
  }
}
