import { describe, it, expect } from 'vitest';
import { UserProgress } from '../UserProgress';

describe('UserProgress', () => {
  const validProps = {
    userId: 'user-1',
    stepId: 'step-1',
    status: 'NOT_STARTED' as const,
  };

  it('should create with valid props', () => {
    const progress = UserProgress.create(validProps);
    expect(progress.id).toBeDefined();
    expect(progress.props.userId).toBe('user-1');
    expect(progress.props.stepId).toBe('step-1');
    expect(progress.props.status).toBe('NOT_STARTED');
    expect(progress.props.completedAt).toBeNull();
  });

  it('should create with id', () => {
    const progress = UserProgress.create(validProps, 'progress-1');
    expect(progress.id).toBe('progress-1');
  });

  it('should throw if userId empty', () => {
    expect(() => UserProgress.create({ ...validProps, userId: '' })).toThrow();
  });

  it('should throw if stepId empty', () => {
    expect(() => UserProgress.create({ ...validProps, stepId: '' })).toThrow();
  });

  it('should throw if status invalid', () => {
    expect(() => UserProgress.create({ ...validProps, status: 'INVALID' as any })).toThrow();
  });

  it('should set completedAt when status is COMPLETED', () => {
    const progress = UserProgress.create({ ...validProps, status: 'COMPLETED' });
    expect(progress.props.completedAt).toBeInstanceOf(Date);
  });

  it('should mark as completed', () => {
    const progress = UserProgress.create(validProps);
    progress.markCompleted();
    expect(progress.props.status).toBe('COMPLETED');
    expect(progress.props.completedAt).toBeInstanceOf(Date);
  });

  it('should set timestamps', () => {
    const progress = UserProgress.create(validProps);
    expect(progress.props.createdAt).toBeInstanceOf(Date);
    expect(progress.props.updatedAt).toBeInstanceOf(Date);
  });
});
