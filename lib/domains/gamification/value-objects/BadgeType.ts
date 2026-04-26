import { InvariantError } from '@kopiketuk/framework';

const VALID_BADGE_TYPES = [
  'streak',
  'completion',
  'xp',
  'speed',
  'perfect',
  'first_lesson',
  'streak_master',
  'explorer',
  'code_warrior',
] as const;

export type BadgeTypeValue = typeof VALID_BADGE_TYPES[number];

export class BadgeType {
  private constructor(private readonly _value: BadgeTypeValue) {}

  static create(value: string): BadgeType {
    if (!VALID_BADGE_TYPES.includes(value as BadgeTypeValue)) {
      throw new InvariantError('BADGE_TYPE.INVALID_TYPE');
    }
    return new BadgeType(value as BadgeTypeValue);
  }

  get value(): BadgeTypeValue {
    return this._value;
  }
}
