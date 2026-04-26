import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { InvariantError } from '@kopiketuk/framework';

import type { GetUserProgressUseCase } from '@/lib/applications/usecases/progress/GetUserProgressUseCase';
import type { UpdateProgressUseCase } from '@/lib/applications/usecases/progress/UpdateProgressUseCase';
import { container } from '@/lib/infrastructures/container';

export class ProgressController {
  static getUserProgress = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const userId = request.nextUrl.searchParams.get('userId');

      if (!userId) {
        return NextResponse.json(
          { status: 'fail', message: 'User ID is required' },
          { status: 400 },
        );
      }

      const useCase = container.getInstance('GetUserProgressUseCase') as GetUserProgressUseCase;
      const result = await useCase.execute({ userId });

      return NextResponse.json(
        {
          status: 'success',
          data: {
            progress: result.progress.map((p) => ({
              id: p.id,
              stepId: p.stepId,
              lessonId: p.lessonId,
              status: p.status,
              attempts: p.attempts,
              completedAt: p.completedAt ? p.completedAt.toISOString() : null,
            })),
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return ProgressController.handleError(error);
    }
  };

  static getProgressByLesson = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const userId = request.nextUrl.searchParams.get('userId');
      const lessonId = request.nextUrl.searchParams.get('lessonId');

      if (!userId || !lessonId) {
        return NextResponse.json(
          { status: 'fail', message: 'User ID and Lesson ID are required' },
          { status: 400 },
        );
      }

      const useCase = container.getInstance('GetUserProgressUseCase') as GetUserProgressUseCase;
      const result = await useCase.execute({ userId });

      const filtered = result.progress.filter((p) => p.lessonId === lessonId);

      return NextResponse.json(
        {
          status: 'success',
          data: {
            progress: filtered.map((p) => ({
              id: p.id,
              stepId: p.stepId,
              lessonId: p.lessonId,
              status: p.status,
              attempts: p.attempts,
              completedAt: p.completedAt ? p.completedAt.toISOString() : null,
            })),
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return ProgressController.handleError(error);
    }
  };

  static updateProgress = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const body = await request.json();
      const { userId, stepId, status } = body;

      const useCase = container.getInstance('UpdateProgressUseCase') as UpdateProgressUseCase;
      const result = await useCase.execute({ userId, stepId, status });

      return NextResponse.json(
        {
          status: 'success',
          data: {
            id: result.id,
            stepId: result.stepId,
            lessonId: result.lessonId,
            status: result.status,
            attempts: result.attempts,
            completedAt: result.completedAt ? result.completedAt.toISOString() : null,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return ProgressController.handleError(error);
    }
  };

  private static handleError(error: unknown): NextResponse {
    if (error instanceof InvariantError) {
      return NextResponse.json(
        { status: 'fail', message: error.message },
        { status: 400 },
      );
    }

    console.error('Progress controller error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
