import { Entity, InvariantError } from '@kopiketuk/framework';
import { Step } from './Step';

export interface LessonProps {
  unitId: string;
  title: string;
  slug: string;
  description: string;
  order: number;
  steps: Step[];
  createdAt: Date;
  updatedAt: Date;
}

export class Lesson extends Entity<string> {
  private _props: LessonProps;

  private constructor(props: LessonProps, id?: string) {
    super(id ?? crypto.randomUUID());
    this._props = props;
  }

  get props(): LessonProps {
    return this._props;
  }

  static create(
    props: Omit<LessonProps, 'steps' | 'createdAt' | 'updatedAt'>,
    id?: string,
  ): Lesson {
    if (!props.unitId || props.unitId.trim().length === 0) {
      throw new InvariantError('LESSON.EMPTY_UNIT_ID');
    }
    if (!props.title || props.title.trim().length === 0) {
      throw new InvariantError('LESSON.EMPTY_TITLE');
    }
    if (!props.slug || props.slug.trim().length === 0) {
      throw new InvariantError('LESSON.EMPTY_SLUG');
    }
    if (props.order < 0) {
      throw new InvariantError('LESSON.INVALID_ORDER');
    }
    return new Lesson(
      {
        ...props,
        steps: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id,
    );
  }

  static reconstitute(id: string, props: LessonProps): Lesson {
    return new Lesson(props, id);
  }
}
