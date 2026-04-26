import { describe, it, expect, vi } from 'vitest';
import { GetUserProgressUseCase } from '../GetUserProgressUseCase';
import { UserProgress } from '@/lib/domains/progress/entities/UserProgress';
import { createMockUseCaseDependencies } from '@/lib/tests/helpers/factories';

describe('GetUserProgressUseCase', () => {
  function createDeps(overrides: Record<string, any> = {}) {
    return createMockUseCaseDependencies({
      progressRepository: overrides.progressRepository,
    });
  }

  it('should return user progress', async () => {
    const progress = UserProgress.create(
      { userId: 'user-1', stepId: 'step-1', lessonId: 'lesson-1', status: 'COMPLETED' },
      'progress-1',
    );
    const deps = createDeps({
      progressRepository: { getUserProgress: vi.fn().mockResolvedValue([progress]) },
    });
    const useCase = new GetUserProgressUseCase(deps);
    const result = await useCase.execute({ userId: 'user-1' });
    expect(result.progress).toHaveLength(1);
    expect(result.progress[0].status).toBe('COMPLETED');
  });

  it('should return empty when no progress', async () => {
    const deps = createDeps({
      progressRepository: { getUserProgress: vi.fn().mockResolvedValue([]) },
    });
    const useCase = new GetUserProgressUseCase(deps);
    const result = await useCase.execute({ userId: 'user-1' });
    expect(result.progress).toHaveLength(0);
  });
});
