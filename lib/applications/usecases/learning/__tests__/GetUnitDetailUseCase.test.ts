import { describe, it, expect, vi } from 'vitest';
import { GetUnitDetailUseCase } from '../GetUnitDetailUseCase';
import { Unit } from '@/lib/domains/learning/entities/Unit';
import { Lesson } from '@/lib/domains/learning/entities/Lesson';
import { createMockUseCaseDependencies } from '@/lib/tests/helpers/factories';
import { InvariantError } from '@kopiketuk/framework';

describe('GetUnitDetailUseCase', () => {
  function createDeps(overrides: Record<string, any> = {}) {
    return createMockUseCaseDependencies({
      learningRepository: overrides.learningRepository,
    });
  }

  const mockUnit = Unit.create(
    { title: 'HTML Dasar', description: 'Belajar HTML', slug: 'html-dasar', order: 1 },
    'unit-1',
  );

  const mockLessons = [
    Lesson.create({ unitId: 'unit-1', title: 'Pengenalan HTML', slug: 'pengenalan-html', description: 'desc', order: 1 }, 'lesson-1'),
    Lesson.create({ unitId: 'unit-1', title: 'Tag HTML', slug: 'tag-html', description: 'desc', order: 2 }, 'lesson-2'),
  ];

  it('should return unit with lessons', async () => {
    const deps = createDeps({
      learningRepository: {
        getUnitById: vi.fn().mockResolvedValue(mockUnit),
        getLessonsByUnitId: vi.fn().mockResolvedValue(mockLessons),
      },
    });
    const useCase = new GetUnitDetailUseCase(deps);
    const result = await useCase.execute({ unitId: 'unit-1' });
    expect(result.unit.title).toBe('HTML Dasar');
    expect(result.lessons).toHaveLength(2);
    expect(result.lessons[0].title).toBe('Pengenalan HTML');
  });

  it('should throw when unit not found', async () => {
    const deps = createDeps({
      learningRepository: {
        getUnitById: vi.fn().mockResolvedValue(null),
      },
    });
    const useCase = new GetUnitDetailUseCase(deps);
    await expect(useCase.execute({ unitId: 'not-found' })).rejects.toThrow(InvariantError);
  });
});
