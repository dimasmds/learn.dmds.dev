import { describe, it, expect, vi } from 'vitest';
import { GetUnitsUseCase } from '../GetUnitsUseCase';
import { Unit } from '@/lib/domains/learning/entities/Unit';
import { createMockUseCaseDependencies } from '@/lib/tests/helpers/factories';

describe('GetUnitsUseCase', () => {
  function createDeps(overrides: Record<string, any> = {}) {
    return createMockUseCaseDependencies({
      learningRepository: overrides.learningRepository,
    });
  }

  it('should return list of units', async () => {
    const unit1 = Unit.create({ title: 'HTML Dasar', description: 'Belajar HTML', slug: 'html-dasar', order: 1 });
    const unit2 = Unit.create({ title: 'CSS Dasar', description: 'Belajar CSS', slug: 'css-dasar', order: 2 });
    const deps = createDeps({
      learningRepository: { getUnits: vi.fn().mockResolvedValue([unit1, unit2]) },
    });
    const useCase = new GetUnitsUseCase(deps);
    const result = await useCase.execute({});
    expect(result.units).toHaveLength(2);
    expect(result.units[0].title).toBe('HTML Dasar');
    expect(result.units[1].title).toBe('CSS Dasar');
  });

  it('should return empty array when no units', async () => {
    const deps = createDeps({
      learningRepository: { getUnits: vi.fn().mockResolvedValue([]) },
    });
    const useCase = new GetUnitsUseCase(deps);
    const result = await useCase.execute({});
    expect(result.units).toHaveLength(0);
  });
});
