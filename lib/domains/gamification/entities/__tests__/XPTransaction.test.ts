import { describe, it, expect } from 'vitest';
import { XPTransaction } from '../XPTransaction';

describe('XPTransaction', () => {
  const validProps = {
    userId: 'user-1',
    amount: 50,
    source: 'step_complete',
    sourceId: 'step-1' as string | null,
    description: 'Completed step 1',
  };

  it('should create transaction with valid props', () => {
    const tx = XPTransaction.create(validProps);
    expect(tx.id).toBeDefined();
    expect(tx.props.userId).toBe('user-1');
    expect(tx.props.amount).toBe(50);
    expect(tx.props.source).toBe('step_complete');
    expect(tx.props.sourceId).toBe('step-1');
    expect(tx.props.description).toBe('Completed step 1');
    expect(tx.props.createdAt).toBeInstanceOf(Date);
  });

  it('should create transaction with custom id', () => {
    const tx = XPTransaction.create(validProps, 'tx-1');
    expect(tx.id).toBe('tx-1');
  });

  it('should throw if userId is empty', () => {
    expect(() => XPTransaction.create({ ...validProps, userId: '' })).toThrow('XP_TRANSACTION.EMPTY_USER_ID');
  });

  it('should throw if source is invalid', () => {
    expect(() => XPTransaction.create({ ...validProps, source: 'invalid' as any })).toThrow('XP_TRANSACTION.INVALID_SOURCE');
  });

  it('should throw if description is empty', () => {
    expect(() => XPTransaction.create({ ...validProps, description: '' })).toThrow('XP_TRANSACTION.EMPTY_DESCRIPTION');
  });

  it('should throw if amount is negative', () => {
    expect(() => XPTransaction.create({ ...validProps, amount: -10 })).toThrow();
  });

  it('should accept all valid sources', () => {
    const sources = ['step_complete', 'badge_earn', 'streak_bonus', 'lesson_complete'];
    sources.forEach(source => {
      const tx = XPTransaction.create({ ...validProps, source });
      expect(tx.props.source).toBe(source);
    });
  });

  it('should default sourceId to null when undefined', () => {
    const tx = XPTransaction.create({ ...validProps, sourceId: undefined as any });
    expect(tx.props.sourceId).toBeNull();
  });

  it('should reconstitute transaction', () => {
    const tx = XPTransaction.reconstitute('tx-1', {
      userId: 'user-1',
      amount: 50,
      source: 'step_complete',
      sourceId: 'step-1',
      description: 'Completed step 1',
      createdAt: new Date('2024-01-01'),
    });
    expect(tx.id).toBe('tx-1');
    expect(tx.props.amount).toBe(50);
  });
});
