import { describe, it, expect } from 'vitest';
import { Badge } from '../Badge';

describe('Badge', () => {
  const validProps = {
    name: 'First Step',
    description: 'Complete your first step',
    icon: '🏆',
    type: 'completion',
    category: 'learning',
    criteria: { type: 'steps_completed', count: 1 },
    xpReward: 50,
  };

  it('should create badge with valid props', () => {
    const badge = Badge.create(validProps);
    expect(badge.id).toBeDefined();
    expect(badge.props.name).toBe('First Step');
    expect(badge.props.description).toBe('Complete your first step');
    expect(badge.props.icon).toBe('🏆');
    expect(badge.props.type).toBe('completion');
    expect(badge.props.category).toBe('learning');
    expect(badge.props.xpReward).toBe(50);
    expect(badge.props.createdAt).toBeInstanceOf(Date);
    expect(badge.props.updatedAt).toBeInstanceOf(Date);
  });

  it('should create badge with custom id', () => {
    const badge = Badge.create(validProps, 'badge-1');
    expect(badge.id).toBe('badge-1');
  });

  it('should throw if name is empty', () => {
    expect(() => Badge.create({ ...validProps, name: '' })).toThrow('BADGE.EMPTY_NAME');
  });

  it('should throw if description is empty', () => {
    expect(() => Badge.create({ ...validProps, description: '' })).toThrow('BADGE.EMPTY_DESCRIPTION');
  });

  it('should throw if type is invalid', () => {
    expect(() => Badge.create({ ...validProps, type: 'invalid' as any })).toThrow();
  });

  it('should throw if category is invalid', () => {
    expect(() => Badge.create({ ...validProps, category: 'invalid' as any })).toThrow();
  });

  it('should throw if xpReward is negative', () => {
    expect(() => Badge.create({ ...validProps, xpReward: -1 })).toThrow('BADGE.INVALID_XP');
  });

  it('should reconstitute badge with id and props', () => {
    const badge = Badge.reconstitute('badge-1', {
      ...validProps,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });
    expect(badge.id).toBe('badge-1');
    expect(badge.props.name).toBe('First Step');
  });
});
