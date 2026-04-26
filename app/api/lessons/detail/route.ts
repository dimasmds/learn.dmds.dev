import { NextRequest } from 'next/server';
import { LearningController } from '@/lib/presentations/controllers/learning/LearningController';

export async function GET(request: NextRequest) {
  return LearningController.getLessonDetail(request);
}
