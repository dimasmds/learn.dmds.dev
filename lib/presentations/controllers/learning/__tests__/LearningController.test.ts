import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

import type { GetUnitsUseCase } from '@/lib/applications/usecases/learning/GetUnitsUseCase';
import type { GetUnitDetailUseCase } from '@/lib/applications/usecases/learning/GetUnitDetailUseCase';
import type { GetLessonDetailUseCase } from '@/lib/applications/usecases/learning/GetLessonDetailUseCase';
import { container } from '@/lib/infrastructures/container';

// Mock container.getInstance to return mock use cases
const mockGetUnitsUseCase = { execute: vi.fn() };
const mockGetUnitDetailUseCase = { execute: vi.fn() };
const mockGetLessonDetailUseCase = { execute: vi.fn() };

vi.spyOn(container, 'getInstance').mockImplementation((key: string) => {
  switch (key) {
    case 'GetUnitsUseCase': return mockGetUnitsUseCase as any;
    case 'GetUnitDetailUseCase': return mockGetUnitDetailUseCase as any;
    case 'GetLessonDetailUseCase': return mockGetLessonDetailUseCase as any;
    default: throw new Error(`Unknown key: ${key}`);
  }
});

// Import controller AFTER mock setup
import { LearningController } from '../LearningController';

describe('LearningController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUnits', () => {
    it('should return units successfully', async () => {
      const { NextRequest } = await import('next/server');
      mockGetUnitsUseCase.execute.mockResolvedValue({
        units: [
          {
            id: 'unit-1',
            title: 'Unit 1',
            description: 'First unit',
            slug: 'unit-1',
            order: 1,
            lessonIds: ['lesson-1', 'lesson-2'],
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/learning/units', {
        method: 'GET',
      });

      const response = await LearningController.getUnits(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe('success');
      expect(body.data.units).toHaveLength(1);
      expect(body.data.units[0].id).toBe('unit-1');
      expect(body.data.units[0].title).toBe('Unit 1');
      expect(container.getInstance).toHaveBeenCalledWith('GetUnitsUseCase');
      expect(mockGetUnitsUseCase.execute).toHaveBeenCalledWith({});
    });

    it('should return empty units array', async () => {
      const { NextRequest } = await import('next/server');
      mockGetUnitsUseCase.execute.mockResolvedValue({
        units: [],
      });

      const request = new NextRequest('http://localhost:3000/api/learning/units', {
        method: 'GET',
      });

      const response = await LearningController.getUnits(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe('success');
      expect(body.data.units).toHaveLength(0);
    });

    it('should return 500 when use case throws a generic error', async () => {
      const { NextRequest } = await import('next/server');
      mockGetUnitsUseCase.execute.mockRejectedValue(new Error('Something went wrong'));

      const request = new NextRequest('http://localhost:3000/api/learning/units', {
        method: 'GET',
      });

      const response = await LearningController.getUnits(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.status).toBe('error');
      expect(body.message).toBe('Internal server error');
    });
  });

  describe('getUnitDetail', () => {
    it('should return unit detail with lessons', async () => {
      const { NextRequest } = await import('next/server');
      mockGetUnitDetailUseCase.execute.mockResolvedValue({
        unit: {
          id: 'unit-1',
          title: 'Unit 1',
          description: 'First unit',
          slug: 'unit-1',
          order: 1,
        },
        lessons: [
          {
            id: 'lesson-1',
            title: 'Lesson 1',
            slug: 'lesson-1',
            description: 'First lesson',
            order: 1,
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/learning/unit-detail?unitId=unit-1', {
        method: 'GET',
      });

      const response = await LearningController.getUnitDetail(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe('success');
      expect(body.data.unit.id).toBe('unit-1');
      expect(body.data.lessons).toHaveLength(1);
      expect(body.data.lessons[0].id).toBe('lesson-1');
      expect(container.getInstance).toHaveBeenCalledWith('GetUnitDetailUseCase');
      expect(mockGetUnitDetailUseCase.execute).toHaveBeenCalledWith({ unitId: 'unit-1' });
    });

    it('should return 400 when unitId is missing', async () => {
      const { NextRequest } = await import('next/server');

      const request = new NextRequest('http://localhost:3000/api/learning/unit-detail', {
        method: 'GET',
      });

      const response = await LearningController.getUnitDetail(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('Unit ID is required');
    });

    it('should return 400 when unit is not found', async () => {
      const { NextRequest } = await import('next/server');
      const { InvariantError } = await import('@kopiketuk/framework');
      mockGetUnitDetailUseCase.execute.mockRejectedValue(
        new InvariantError('GET_UNIT_DETAIL.UNIT_NOT_FOUND'),
      );

      const request = new NextRequest('http://localhost:3000/api/learning/unit-detail?unitId=nonexistent', {
        method: 'GET',
      });

      const response = await LearningController.getUnitDetail(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('GET_UNIT_DETAIL.UNIT_NOT_FOUND');
    });
  });

  describe('getLessonDetail', () => {
    it('should return lesson detail with steps', async () => {
      const { NextRequest } = await import('next/server');
      mockGetLessonDetailUseCase.execute.mockResolvedValue({
        lesson: {
          id: 'lesson-1',
          unitId: 'unit-1',
          title: 'Lesson 1',
          slug: 'lesson-1',
          description: 'First lesson',
          order: 1,
        },
        steps: [
          {
            id: 'step-1',
            type: 'reading',
            order: 1,
            instruction: 'Read the content',
            content: { text: 'Hello world' },
            xpReward: 10,
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/learning/lesson-detail?lessonId=lesson-1', {
        method: 'GET',
      });

      const response = await LearningController.getLessonDetail(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe('success');
      expect(body.data.lesson.id).toBe('lesson-1');
      expect(body.data.lesson.unitId).toBe('unit-1');
      expect(body.data.steps).toHaveLength(1);
      expect(body.data.steps[0].type).toBe('reading');
      expect(container.getInstance).toHaveBeenCalledWith('GetLessonDetailUseCase');
      expect(mockGetLessonDetailUseCase.execute).toHaveBeenCalledWith({ lessonId: 'lesson-1' });
    });

    it('should return 400 when lessonId is missing', async () => {
      const { NextRequest } = await import('next/server');

      const request = new NextRequest('http://localhost:3000/api/learning/lesson-detail', {
        method: 'GET',
      });

      const response = await LearningController.getLessonDetail(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('Lesson ID is required');
    });

    it('should return 400 when lesson is not found', async () => {
      const { NextRequest } = await import('next/server');
      const { InvariantError } = await import('@kopiketuk/framework');
      mockGetLessonDetailUseCase.execute.mockRejectedValue(
        new InvariantError('GET_LESSON_DETAIL.LESSON_NOT_FOUND'),
      );

      const request = new NextRequest('http://localhost:3000/api/learning/lesson-detail?lessonId=nonexistent', {
        method: 'GET',
      });

      const response = await LearningController.getLessonDetail(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('GET_LESSON_DETAIL.LESSON_NOT_FOUND');
    });
  });
});
