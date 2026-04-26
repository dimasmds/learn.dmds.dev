import { describe, it, expect } from 'vitest';
import { Streak } from '../Streak';

describe('Streak', () => {
  const validProps = {
    userId: 'user-1',
    currentCount: 0,
    longestCount: 0,
    lastActivityDate: null as string | null,
    freezeCount: 3,
  };

  it('should create streak with valid props', () => {
    const streak = Streak.create(validProps);
    expect(streak.id).toBeDefined();
    expect(streak.props.userId).toBe('user-1');
    expect(streak.props.currentCount).toBe(0);
    expect(streak.props.longestCount).toBe(0);
    expect(streak.props.lastActivityDate).toBeNull();
    expect(streak.props.freezeCount).toBe(3);
  });

  it('should create streak with custom id', () => {
    const streak = Streak.create(validProps, 'streak-1');
    expect(streak.id).toBe('streak-1');
  });

  it('should throw if userId is empty', () => {
    expect(() => Streak.create({ ...validProps, userId: '' })).toThrow('STREAK.EMPTY_USER_ID');
  });

  it('should throw if currentCount is negative', () => {
    expect(() => Streak.create({ ...validProps, currentCount: -1 })).toThrow('STREAK.NEGATIVE_COUNT');
  });

  it('should throw if longestCount is negative', () => {
    expect(() => Streak.create({ ...validProps, longestCount: -1 })).toThrow('STREAK.NEGATIVE_COUNT');
  });

  it('should throw if freezeCount is negative', () => {
    expect(() => Streak.create({ ...validProps, freezeCount: -1 })).toThrow('STREAK.NEGATIVE_COUNT');
  });

  // --- increment tests ---

  it('should increment from null lastActivityDate (first activity)', () => {
    const streak = Streak.create(validProps);
    streak.increment('2024-01-01');
    expect(streak.props.currentCount).toBe(1);
    expect(streak.props.longestCount).toBe(1);
    expect(streak.props.lastActivityDate).toBe('2024-01-01');
  });

  it('should increment on consecutive day', () => {
    const streak = Streak.create({
      ...validProps,
      currentCount: 3,
      longestCount: 5,
      lastActivityDate: '2024-01-01',
    });
    streak.increment('2024-01-02');
    expect(streak.props.currentCount).toBe(4);
    expect(streak.props.longestCount).toBe(5);
    expect(streak.props.lastActivityDate).toBe('2024-01-02');
  });

  it('should update longestCount when currentCount exceeds it', () => {
    const streak = Streak.create({
      ...validProps,
      currentCount: 5,
      longestCount: 5,
      lastActivityDate: '2024-01-01',
    });
    streak.increment('2024-01-02');
    expect(streak.props.currentCount).toBe(6);
    expect(streak.props.longestCount).toBe(6);
  });

  it('should not increment if same day', () => {
    const streak = Streak.create({
      ...validProps,
      currentCount: 3,
      longestCount: 5,
      lastActivityDate: '2024-01-01',
    });
    streak.increment('2024-01-01');
    expect(streak.props.currentCount).toBe(3);
  });

  it('should not increment if day is not consecutive', () => {
    const streak = Streak.create({
      ...validProps,
      currentCount: 3,
      longestCount: 5,
      lastActivityDate: '2024-01-01',
    });
    streak.increment('2024-01-05');
    expect(streak.props.currentCount).toBe(3);
    expect(streak.props.lastActivityDate).toBe('2024-01-01');
  });

  // --- reset tests ---

  it('should reset currentCount to 0', () => {
    const streak = Streak.create({
      ...validProps,
      currentCount: 5,
      longestCount: 5,
      lastActivityDate: '2024-01-01',
    });
    streak.reset();
    expect(streak.props.currentCount).toBe(0);
    expect(streak.props.longestCount).toBe(5);
  });

  // --- isBroken tests ---

  it('should not be broken if lastActivityDate is null', () => {
    const streak = Streak.create(validProps);
    expect(streak.isBroken('2024-01-01')).toBe(false);
  });

  it('should not be broken if activity is today', () => {
    const streak = Streak.create({
      ...validProps,
      currentCount: 3,
      longestCount: 5,
      lastActivityDate: '2024-01-01',
    });
    expect(streak.isBroken('2024-01-01')).toBe(false);
  });

  it('should not be broken if today is the next day', () => {
    const streak = Streak.create({
      ...validProps,
      currentCount: 3,
      longestCount: 5,
      lastActivityDate: '2024-01-01',
    });
    expect(streak.isBroken('2024-01-02')).toBe(false);
  });

  it('should be broken if more than 1 day gap', () => {
    const streak = Streak.create({
      ...validProps,
      currentCount: 3,
      longestCount: 5,
      lastActivityDate: '2024-01-01',
    });
    expect(streak.isBroken('2024-01-03')).toBe(true);
  });

  it('should be broken with a large gap', () => {
    const streak = Streak.create({
      ...validProps,
      currentCount: 10,
      longestCount: 10,
      lastActivityDate: '2024-01-01',
    });
    expect(streak.isBroken('2024-01-10')).toBe(true);
  });

  it('should not be broken if today is before lastActivityDate', () => {
    const streak = Streak.create({
      ...validProps,
      currentCount: 3,
      longestCount: 5,
      lastActivityDate: '2024-01-05',
    });
    expect(streak.isBroken('2024-01-03')).toBe(false);
  });

  // --- useFreeze tests ---

  it('should use a freeze and return true', () => {
    const streak = Streak.create({
      ...validProps,
      freezeCount: 2,
    });
    const result = streak.useFreeze();
    expect(result).toBe(true);
    expect(streak.props.freezeCount).toBe(1);
  });

  it('should return false when no freezes available', () => {
    const streak = Streak.create({
      ...validProps,
      freezeCount: 0,
    });
    const result = streak.useFreeze();
    expect(result).toBe(false);
    expect(streak.props.freezeCount).toBe(0);
  });

  // --- reconstitute ---

  it('should reconstitute streak', () => {
    const streak = Streak.reconstitute('streak-1', {
      userId: 'user-1',
      currentCount: 5,
      longestCount: 10,
      lastActivityDate: '2024-01-01',
      freezeCount: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });
    expect(streak.id).toBe('streak-1');
    expect(streak.props.currentCount).toBe(5);
    expect(streak.props.longestCount).toBe(10);
  });
});
