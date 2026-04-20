import { Entity, InvariantError } from '@kopiketuk/framework';
import { StepType } from '../value-objects/StepType';

export interface StepProps {
  lessonId: string;
  type: string;
  order: number;
  instruction: string;
  content: Record<string, unknown>;
  solution: Record<string, unknown>;
  hints: string[];
  xpReward: number;
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
    if (!props.instruction || props.instruction.trim().length === 0) {
      throw new InvariantError('STEP.EMPTY_INSTRUCTION');
    }
    if (props.order < 0) {
      throw new InvariantError('STEP.INVALID_ORDER');
    }
    if (props.xpReward < 0) {
      throw new InvariantError('STEP.INVALID_XP');
    }
    // Validate step type
    StepType.create(props.type);
    return new Step(
      {
        ...props,
        content: props.content ?? {},
        solution: props.solution ?? {},
        hints: props.hints ?? [],
        xpReward: props.xpReward ?? 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id,
    );
  }

  static reconstitute(id: string, props: StepProps): Step {
    return new Step(props, id);
  }
}
