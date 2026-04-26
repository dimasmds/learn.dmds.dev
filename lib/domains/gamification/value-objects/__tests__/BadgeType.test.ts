import { describe, it, expect } from 'vitest';
import { BadgeType } from '../BadgeType';

describe('BadgeType', () => {
  it('should create valid badge type', () => {
    const type = BadgeType.create('streak');
    expect(type.value).toBe('streak');
  });

  it('should create all 9 types', () => {
    const types = [
      'streak', 'completion', 'xp', 'speed', 'perfect',
      'first_lesson', 'streak_master', 'explorer', 'code_warrior',
    ];
    types.forEach(t => {
      expect(BadgeType.create(t).value).toBe(t);
    });
  });

  it('should throw InvariantError for invalid type', () => {
    expect(() => BadgeType.create('invalid')).toThrow('BADGE_TYPE.INVALID_TYPE');
  });

  it('should throw for empty string', () => {
    expect(() => BadgeType.create('')).toThrow();
  });
});
