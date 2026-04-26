import { Entity, InvariantError } from '@kopiketuk/framework';

export interface UserBadgeProps {
  userId: string;
  badgeId: string;
  earnedAt: Date;
}

export class UserBadge extends Entity<string> {
  private _props: UserBadgeProps;

  private constructor(props: UserBadgeProps, id?: string) {
    super(id ?? crypto.randomUUID());
    this._props = props;
  }

  get props(): UserBadgeProps {
    return this._props;
  }

  static create(
    props: Omit<UserBadgeProps, 'earnedAt'>,
    id?: string,
  ): UserBadge {
    if (!props.userId || props.userId.trim().length === 0) {
      throw new InvariantError('USER_BADGE.EMPTY_USER_ID');
    }
    if (!props.badgeId || props.badgeId.trim().length === 0) {
      throw new InvariantError('USER_BADGE.EMPTY_BADGE_ID');
    }
    return new UserBadge(
      {
        ...props,
        earnedAt: new Date(),
      },
      id,
    );
  }

  static reconstitute(id: string, props: UserBadgeProps): UserBadge {
    return new UserBadge(props, id);
  }
}
