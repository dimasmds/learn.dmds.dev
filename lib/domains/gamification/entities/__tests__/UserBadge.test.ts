import { describe, it, expect } from 'vitest';
import { UserBadge } from '../UserBadge';

describe('UserBadge', () => {
  const validProps = {
    userId: 'user-1',
    badgeId: 'badge-1',
  };

  it('should create user badge with valid props', () => {
    const userBadge = UserBadge.create(validProps);
    expect(userBadge.id).toBeDefined();
    expect(userBadge.props.userId).toBe('user-1');
    expect(userBadge.props.badgeId).toBe('badge-1');
    expect(userBadge.props.earnedAt).toBeInstanceOf(Date);
  });

  it('should create user badge with custom id', () => {
    const userBadge = UserBadge.create(validProps, 'ub-1');
    expect(userBadge.id).toBe('ub-1');
  });

  it('should throw if userId is empty', () => {
    expect(() => UserBadge.create({ ...validProps, userId: '' })).toThrow('USER_BADGE.EMPTY_USER_ID');
  });

  it('should throw if badgeId is empty', () => {
    expect(() => UserBadge.create({ ...validProps, badgeId: '' })).toThrow('USER_BADGE.EMPTY_BADGE_ID');
  });

  it('should reconstitute user badge', () => {
    const userBadge = UserBadge.reconstitute('ub-1', {
      userId: 'user-1',
      badgeId: 'badge-1',
      earnedAt: new Date('2024-01-01'),
    });
    expect(userBadge.id).toBe('ub-1');
    expect(userBadge.props.earnedAt).toEqual(new Date('2024-01-01'));
  });
});
