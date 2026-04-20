import { describe, it, expect, vi } from 'vitest';
import { GetLessonDetailUseCase } from '../GetLessonDetailUseCase';
import { Lesson } from '@/lib/domains/learning/entities/Lesson';
import { Step } from '@/lib/domains/learning/entities/Step';
import { createMockUseCaseDependencies } from '@/lib/tests/helpers/factories';
import { InvariantError } from '@kopiketuk/framework';

describe('GetLessonDetailUseCase', () => {
  function createDeps(overrides: Record<string, any> = {}) {
    return createMockUseCaseDependencies({
      learningRepository: overrides.learningRepository,
      progressRepository: overrides.progressRepository,
    });
  }

  const mockLesson = Lesson.create(
    { unitId: 'unit-1', title: 'Pengenalan HTML', slug: 'pengenalan-html', description: 'desc', order: 1 },
    'lesson-1',
  );

  const mockSteps = [
    Step.create({ lessonId: 'lesson-1', type: 'theory', order: 1, instruction: 'Apa itu HTML?', content: { body: 'konten' }, solution: {}, hints: [], xpReward: 5 }, 'step-1'),
    Step.create({ lessonId: 'lesson-1', type: 'fill-blank', order: 2, instruction: 'Isi titik-titik', content: { template: '<___>' }, solution: { answer: 'html' }, hints: ['tag utama'], xpReward: 10 }, 'step-2'),
  ];

  it('should return lesson with steps', async () => {
    const deps = createDeps({
      learningRepository: {
        getLessonById: vi.fn().mockResolvedValue(mockLesson),
        getStepsByLessonId: vi.fn().mockResolvedValue(mockSteps),
      },
    });
    const useCase = new GetLessonDetailUseCase(deps);
    const result = await useCase.execute({ lessonId: 'lesson-1' });
    expect(result.lesson.title).toBe('Pengenalan HTML');
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].type).toBe('theory');
    expect(result.steps[1].xpReward).toBe(10);
  });

  it('should throw when lesson not found', async () => {
    const deps = createDeps({
      learningRepository: { getLessonById: vi.fn().mockResolvedValue(null) },
    });
    const useCase = new GetLessonDetailUseCase(deps);
    await expect(useCase.execute({ lessonId: 'not-found' })).rejects.toThrow(InvariantError);
  });
});
