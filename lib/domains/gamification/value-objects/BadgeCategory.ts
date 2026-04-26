import { InvariantError } from '@kopiketuk/framework';

const VALID_BADGE_CATEGORIES = [
  'learning',
  'streak',
  'mastery',
  'social',
] as const;

export type BadgeCategoryValue = typeof VALID_BADGE_CATEGORIES[number];

export class BadgeCategory {
  private constructor(private readonly _value: BadgeCategoryValue) {}

  static create(value: string): BadgeCategory {
    if (!VALID_BADGE_CATEGORIES.includes(value as BadgeCategoryValue)) {
      throw new InvariantError('BADGE_CATEGORY.INVALID_CATEGORY');
    }
    return new BadgeCategory(value as BadgeCategoryValue);
  }

  get value(): BadgeCategoryValue {
    return this._value;
  }
}
