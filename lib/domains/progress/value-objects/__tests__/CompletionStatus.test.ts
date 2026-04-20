import { describe, it, expect } from 'vitest';
import { CompletionStatus } from '../CompletionStatus';

describe('CompletionStatus', () => {
  it('should create NOT_STARTED status', () => {
    const status = CompletionStatus.create('NOT_STARTED');
    expect(status.value).toBe('NOT_STARTED');
  });

  it('should create all 3 statuses', () => {
    const statuses = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];
    statuses.forEach(s => {
      expect(CompletionStatus.create(s).value).toBe(s);
    });
  });

  it('should throw InvariantError for invalid status', () => {
    expect(() => CompletionStatus.create('INVALID')).toThrow();
  });

  it('should have isCompleted helper', () => {
    const status = CompletionStatus.create('COMPLETED');
    expect(status.isCompleted()).toBe(true);
  });

  it('isCompleted should return false for non-completed', () => {
    const status = CompletionStatus.create('IN_PROGRESS');
    expect(status.isCompleted()).toBe(false);
  });
});
