import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { InvariantError } from '@kopiketuk/framework';

import type { GetUnitsUseCase } from '@/lib/applications/usecases/learning/GetUnitsUseCase';
import type { GetUnitDetailUseCase } from '@/lib/applications/usecases/learning/GetUnitDetailUseCase';
import type { GetLessonDetailUseCase } from '@/lib/applications/usecases/learning/GetLessonDetailUseCase';
import { container } from '@/lib/infrastructures/container';

export class LearningController {
  static getUnits = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const useCase = container.getInstance('GetUnitsUseCase') as GetUnitsUseCase;
      const result = await useCase.execute({});

      return NextResponse.json(
        {
          status: 'success',
          data: {
            units: result.units,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return LearningController.handleError(error);
    }
  };

  static getUnitDetail = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const unitId = request.nextUrl.searchParams.get('unitId');

      if (!unitId) {
        return NextResponse.json(
          { status: 'fail', message: 'Unit ID is required' },
          { status: 400 },
        );
      }

      const useCase = container.getInstance('GetUnitDetailUseCase') as GetUnitDetailUseCase;
      const result = await useCase.execute({ unitId });

      return NextResponse.json(
        {
          status: 'success',
          data: {
            unit: result.unit,
            lessons: result.lessons,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return LearningController.handleError(error);
    }
  };

  static getLessonDetail = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const lessonId = request.nextUrl.searchParams.get('lessonId');

      if (!lessonId) {
        return NextResponse.json(
          { status: 'fail', message: 'Lesson ID is required' },
          { status: 400 },
        );
      }

      const useCase = container.getInstance('GetLessonDetailUseCase') as GetLessonDetailUseCase;
      const result = await useCase.execute({ lessonId });

      return NextResponse.json(
        {
          status: 'success',
          data: {
            lesson: result.lesson,
            steps: result.steps,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return LearningController.handleError(error);
    }
  };

  private static handleError(error: unknown): NextResponse {
    if (error instanceof InvariantError) {
      return NextResponse.json(
        { status: 'fail', message: error.message },
        { status: 400 },
      );
    }

    console.error('Learning controller error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
