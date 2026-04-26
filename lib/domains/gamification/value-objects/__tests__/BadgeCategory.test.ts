import { describe, it, expect } from 'vitest';
import { BadgeCategory } from '../BadgeCategory';

describe('BadgeCategory', () => {
  it('should create valid badge category', () => {
    const category = BadgeCategory.create('learning');
    expect(category.value).toBe('learning');
  });

  it('should create all 4 categories', () => {
    const categories = ['learning', 'streak', 'mastery', 'social'];
    categories.forEach(c => {
      expect(BadgeCategory.create(c).value).toBe(c);
    });
  });

  it('should throw InvariantError for invalid category', () => {
    expect(() => BadgeCategory.create('invalid')).toThrow('BADGE_CATEGORY.INVALID_CATEGORY');
  });

  it('should throw for empty string', () => {
    expect(() => BadgeCategory.create('')).toThrow();
  });
});
