import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

import type { GetUserProgressUseCase } from '@/lib/applications/usecases/progress/GetUserProgressUseCase';
import type { UpdateProgressUseCase } from '@/lib/applications/usecases/progress/UpdateProgressUseCase';
import { container } from '@/lib/infrastructures/container';

// Mock container.getInstance to return mock use cases
const mockGetUserProgressUseCase = { execute: vi.fn() };
const mockUpdateProgressUseCase = { execute: vi.fn() };

vi.spyOn(container, 'getInstance').mockImplementation((key: string) => {
  switch (key) {
    case 'GetUserProgressUseCase': return mockGetUserProgressUseCase as any;
    case 'UpdateProgressUseCase': return mockUpdateProgressUseCase as any;
    default: throw new Error(`Unknown key: ${key}`);
  }
});

// Import controller AFTER mock setup
import { ProgressController } from '../ProgressController';

describe('ProgressController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserProgress', () => {
    it('should return 200 with progress data', async () => {
      const { NextRequest } = await import('next/server');
      const completedDate = new Date('2025-01-15T10:30:00.000Z');
      mockGetUserProgressUseCase.execute.mockResolvedValue({
        progress: [
          {
            id: 'progress-1',
            stepId: 'step-1',
            lessonId: 'lesson-1',
            status: 'completed',
            attempts: 2,
            completedAt: completedDate,
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/progress?userId=user-1');
      const response = await ProgressController.getUserProgress(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe('success');
      expect(body.data.progress).toHaveLength(1);
      expect(body.data.progress[0].id).toBe('progress-1');
      expect(body.data.progress[0].stepId).toBe('step-1');
      expect(body.data.progress[0].lessonId).toBe('lesson-1');
      expect(body.data.progress[0].status).toBe('completed');
      expect(body.data.progress[0].attempts).toBe(2);
      expect(body.data.progress[0].completedAt).toBe('2025-01-15T10:30:00.000Z');
      expect(container.getInstance).toHaveBeenCalledWith('GetUserProgressUseCase');
      expect(mockGetUserProgressUseCase.execute).toHaveBeenCalledWith({ userId: 'user-1' });
    });

    it('should return 200 with empty progress array', async () => {
      const { NextRequest } = await import('next/server');
      mockGetUserProgressUseCase.execute.mockResolvedValue({
        progress: [],
      });

      const request = new NextRequest('http://localhost:3000/api/progress?userId=user-1');
      const response = await ProgressController.getUserProgress(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe('success');
      expect(body.data.progress).toEqual([]);
    });

    it('should return 400 when userId is missing', async () => {
      const { NextRequest } = await import('next/server');
      const request = new NextRequest('http://localhost:3000/api/progress');

      const response = await ProgressController.getUserProgress(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('User ID is required');
    });

    it('should serialize null completedAt as null', async () => {
      const { NextRequest } = await import('next/server');
      mockGetUserProgressUseCase.execute.mockResolvedValue({
        progress: [
          {
            id: 'progress-2',
            stepId: 'step-2',
            lessonId: 'lesson-1',
            status: 'in_progress',
            attempts: 0,
            completedAt: null,
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/progress?userId=user-1');
      const response = await ProgressController.getUserProgress(request);
      const body = await response.json();

      expect(body.data.progress[0].completedAt).toBeNull();
    });

    it('should return 500 on unexpected error', async () => {
      const { NextRequest } = await import('next/server');
      mockGetUserProgressUseCase.execute.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/progress?userId=user-1');
      const response = await ProgressController.getUserProgress(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.status).toBe('error');
      expect(body.message).toBe('Internal server error');
    });
  });

  describe('getProgressByLesson', () => {
    it('should return 200 with filtered progress data for a lesson', async () => {
      const { NextRequest } = await import('next/server');
      mockGetUserProgressUseCase.execute.mockResolvedValue({
        progress: [
          {
            id: 'progress-1',
            stepId: 'step-1',
            lessonId: 'lesson-1',
            status: 'completed',
            attempts: 2,
            completedAt: new Date('2025-01-15T10:30:00.000Z'),
          },
          {
            id: 'progress-2',
            stepId: 'step-2',
            lessonId: 'lesson-2',
            status: 'in_progress',
            attempts: 0,
            completedAt: null,
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/progress/lesson?userId=user-1&lessonId=lesson-1');
      const response = await ProgressController.getProgressByLesson(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe('success');
      expect(body.data.progress).toHaveLength(1);
      expect(body.data.progress[0].lessonId).toBe('lesson-1');
    });

    it('should return 400 when userId is missing', async () => {
      const { NextRequest } = await import('next/server');
      const request = new NextRequest('http://localhost:3000/api/progress/lesson?lessonId=lesson-1');

      const response = await ProgressController.getProgressByLesson(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('User ID and Lesson ID are required');
    });

    it('should return 400 when lessonId is missing', async () => {
      const { NextRequest } = await import('next/server');
      const request = new NextRequest('http://localhost:3000/api/progress/lesson?userId=user-1');

      const response = await ProgressController.getProgressByLesson(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('User ID and Lesson ID are required');
    });

    it('should return empty array when no progress for lesson', async () => {
      const { NextRequest } = await import('next/server');
      mockGetUserProgressUseCase.execute.mockResolvedValue({
        progress: [
          {
            id: 'progress-1',
            stepId: 'step-1',
            lessonId: 'lesson-2',
            status: 'completed',
            attempts: 1,
            completedAt: null,
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/progress/lesson?userId=user-1&lessonId=lesson-99');
      const response = await ProgressController.getProgressByLesson(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.progress).toEqual([]);
    });
  });

  describe('updateProgress', () => {
    it('should update progress and return 200', async () => {
      const { NextRequest } = await import('next/server');
      const completedDate = new Date('2025-02-20T14:00:00.000Z');
      mockUpdateProgressUseCase.execute.mockResolvedValue({
        id: 'progress-1',
        stepId: 'step-1',
        lessonId: 'lesson-1',
        status: 'completed',
        attempts: 3,
        completedAt: completedDate,
      });

      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
          stepId: 'step-1',
          status: 'completed',
        }),
      });

      const response = await ProgressController.updateProgress(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe('success');
      expect(body.data.id).toBe('progress-1');
      expect(body.data.stepId).toBe('step-1');
      expect(body.data.lessonId).toBe('lesson-1');
      expect(body.data.status).toBe('completed');
      expect(body.data.attempts).toBe(3);
      expect(body.data.completedAt).toBe('2025-02-20T14:00:00.000Z');
      expect(container.getInstance).toHaveBeenCalledWith('UpdateProgressUseCase');
      expect(mockUpdateProgressUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-1',
        stepId: 'step-1',
        status: 'completed',
      });
    });

    it('should return 400 when InvariantError is thrown (empty userId)', async () => {
      const { NextRequest } = await import('next/server');
      const { InvariantError } = await import('@kopiketuk/framework');
      mockUpdateProgressUseCase.execute.mockRejectedValue(
        new InvariantError('UPDATE_PROGRESS.EMPTY_USER_ID'),
      );

      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: '',
          stepId: 'step-1',
          status: 'completed',
        }),
      });

      const response = await ProgressController.updateProgress(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('UPDATE_PROGRESS.EMPTY_USER_ID');
    });

    it('should return 400 when InvariantError is thrown (empty stepId)', async () => {
      const { NextRequest } = await import('next/server');
      const { InvariantError } = await import('@kopiketuk/framework');
      mockUpdateProgressUseCase.execute.mockRejectedValue(
        new InvariantError('UPDATE_PROGRESS.EMPTY_STEP_ID'),
      );

      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
          stepId: '',
          status: 'completed',
        }),
      });

      const response = await ProgressController.updateProgress(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('UPDATE_PROGRESS.EMPTY_STEP_ID');
    });

    it('should return 500 on unexpected error', async () => {
      const { NextRequest } = await import('next/server');
      mockUpdateProgressUseCase.execute.mockRejectedValue(new Error('Something went wrong'));

      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
          stepId: 'step-1',
          status: 'completed',
        }),
      });

      const response = await ProgressController.updateProgress(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.status).toBe('error');
      expect(body.message).toBe('Internal server error');
    });

    it('should serialize null completedAt as null', async () => {
      const { NextRequest } = await import('next/server');
      mockUpdateProgressUseCase.execute.mockResolvedValue({
        id: 'progress-2',
        stepId: 'step-2',
        lessonId: 'lesson-1',
        status: 'in_progress',
        attempts: 1,
        completedAt: null,
      });

      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
          stepId: 'step-2',
          status: 'in_progress',
        }),
      });

      const response = await ProgressController.updateProgress(request);
      const body = await response.json();

      expect(body.data.completedAt).toBeNull();
    });
  });
});
