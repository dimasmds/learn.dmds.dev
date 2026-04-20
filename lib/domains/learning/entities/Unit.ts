import { Entity, InvariantError } from '@kopiketuk/framework';

export interface UnitProps {
  title: string;
  description: string;
  slug: string;
  order: number;
  lessonIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class Unit extends Entity<string> {
  private _props: UnitProps;

  private constructor(props: UnitProps, id?: string) {
    super(id ?? crypto.randomUUID());
    this._props = props;
  }

  get props(): UnitProps {
    return this._props;
  }

  static create(
    props: Omit<UnitProps, 'lessonIds' | 'createdAt' | 'updatedAt'>,
    id?: string,
  ): Unit {
    if (!props.title || props.title.trim().length === 0) {
      throw new InvariantError('UNIT.EMPTY_TITLE');
    }
    if (!props.slug || props.slug.trim().length === 0) {
      throw new InvariantError('UNIT.EMPTY_SLUG');
    }
    if (props.order < 0) {
      throw new InvariantError('UNIT.INVALID_ORDER');
    }
    return new Unit(
      {
        ...props,
        lessonIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id,
    );
  }

  static reconstitute(id: string, props: UnitProps): Unit {
    return new Unit(props, id);
  }
}
