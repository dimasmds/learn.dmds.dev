import { describe, it, expect, vi } from 'vitest';
import { UpdateProgressUseCase } from '../UpdateProgressUseCase';
import { UserProgress } from '@/lib/domains/progress/entities/UserProgress';
import { createMockUseCaseDependencies } from '@/lib/tests/helpers/factories';
import { InvariantError } from '@kopiketuk/framework';

describe('UpdateProgressUseCase', () => {
  function createDeps(overrides: Record<string, any> = {}) {
    return createMockUseCaseDependencies({
      progressRepository: overrides.progressRepository,
      learningRepository: overrides.learningRepository,
    });
  }

  it('should update progress and return result', async () => {
    const updatedProgress = UserProgress.create(
      { userId: 'user-1', stepId: 'step-1', lessonId: 'lesson-1', status: 'COMPLETED' },
      'progress-1',
    );
    updatedProgress.markCompleted();
    const deps = createDeps({
      progressRepository: { upsertProgress: vi.fn().mockResolvedValue(updatedProgress) },
    });
    const useCase = new UpdateProgressUseCase(deps);
    const result = await useCase.execute({ userId: 'user-1', stepId: 'step-1', status: 'COMPLETED' });
    expect(result.status).toBe('COMPLETED');
    expect(result.completedAt).toBeInstanceOf(Date);
  });

  it('should throw for invalid status', async () => {
    const deps = createDeps();
    const useCase = new UpdateProgressUseCase(deps);
    await expect(useCase.execute({ userId: 'user-1', stepId: 'step-1', status: 'INVALID' }))
      .rejects.toThrow(InvariantError);
  });

  it('should throw for empty userId', async () => {
    const deps = createDeps();
    const useCase = new UpdateProgressUseCase(deps);
    await expect(useCase.execute({ userId: '', stepId: 'step-1', status: 'COMPLETED' }))
      .rejects.toThrow(InvariantError);
  });

  it('should throw for empty stepId', async () => {
    const deps = createDeps();
    const useCase = new UpdateProgressUseCase(deps);
    await expect(useCase.execute({ userId: 'user-1', stepId: '', status: 'COMPLETED' }))
      .rejects.toThrow(InvariantError);
  });
});
