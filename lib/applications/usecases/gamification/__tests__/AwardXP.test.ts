import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvariantError } from '@kopiketuk/framework';
import { AwardXPUseCase } from '../AwardXP';
import { createMockUseCaseDependencies } from '@/lib/tests/helpers/factories';

describe('AwardXPUseCase', () => {
  const mockDeps = createMockUseCaseDependencies();
  let useCase: AwardXPUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new AwardXPUseCase(mockDeps);
  });

  describe('happy path', () => {
    it('should create an XP transaction and save it', async () => {
      const result = await useCase.execute({
        userId: 'user-1',
        amount: 50,
        source: 'lesson_complete',
        sourceId: 'lesson-1',
        description: 'Completed lesson 1',
      });

      expect(result).toHaveProperty('id');
      expect(result.props.userId).toBe('user-1');
      expect(result.props.amount).toBe(50);
      expect(result.props.source).toBe('lesson_complete');
      expect(result.props.sourceId).toBe('lesson-1');
      expect(result.props.description).toBe('Completed lesson 1');
      expect(result.props.createdAt).toBeInstanceOf(Date);
    });

    it('should call addXPTransaction on the repository', async () => {
      await useCase.execute({
        userId: 'user-1',
        amount: 25,
        source: 'badge_earn',
        sourceId: null,
        description: 'Quiz bonus',
      });

      expect(mockDeps.gamificationRepository.addXPTransaction).toHaveBeenCalledTimes(1);
    });

    it('should pass the correct transaction entity to the repository', async () => {
      await useCase.execute({
        userId: 'user-1',
        amount: 100,
        source: 'streak_bonus',
        sourceId: 'streak-1',
        description: '7-day streak bonus',
      });

      const savedTransaction = (mockDeps.gamificationRepository.addXPTransaction as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(savedTransaction.props.userId).toBe('user-1');
      expect(savedTransaction.props.amount).toBe(100);
      expect(savedTransaction.props.source).toBe('streak_bonus');
    });
  });

  describe('validation', () => {
    it('should throw InvariantError when amount is negative', async () => {
      await expect(
        useCase.execute({
          userId: 'user-1',
          amount: -10,
          source: 'lesson_complete',
          sourceId: null,
          description: 'Test',
        }),
      ).rejects.toThrow(InvariantError);
    });

    it('should throw InvariantError when amount is not an integer', async () => {
      await expect(
        useCase.execute({
          userId: 'user-1',
          amount: 5.5,
          source: 'lesson_complete',
          sourceId: null,
          description: 'Test',
        }),
      ).rejects.toThrow(InvariantError);
    });
  });
});
