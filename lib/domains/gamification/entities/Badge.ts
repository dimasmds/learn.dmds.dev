import { Entity, InvariantError } from '@kopiketuk/framework';
import { BadgeType } from '../value-objects/BadgeType';
import { BadgeCategory } from '../value-objects/BadgeCategory';

export interface BadgeProps {
  name: string;
  description: string;
  icon: string;
  type: string;
  category: string;
  criteria: Record<string, unknown>;
  xpReward: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Badge extends Entity<string> {
  private _props: BadgeProps;

  private constructor(props: BadgeProps, id?: string) {
    super(id ?? crypto.randomUUID());
    this._props = props;
  }

  get props(): BadgeProps {
    return this._props;
  }

  static create(
    props: Omit<BadgeProps, 'createdAt' | 'updatedAt'>,
    id?: string,
  ): Badge {
    if (!props.name || props.name.trim().length === 0) {
      throw new InvariantError('BADGE.EMPTY_NAME');
    }
    if (!props.description || props.description.trim().length === 0) {
      throw new InvariantError('BADGE.EMPTY_DESCRIPTION');
    }
    BadgeType.create(props.type);
    BadgeCategory.create(props.category);
    if (props.xpReward < 0) {
      throw new InvariantError('BADGE.INVALID_XP');
    }
    return new Badge(
      {
        ...props,
        criteria: props.criteria ?? {},
        xpReward: props.xpReward ?? 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id,
    );
  }

  static reconstitute(id: string, props: BadgeProps): Badge {
    return new Badge(props, id);
  }
}
