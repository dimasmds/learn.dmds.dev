import { NextRequest } from 'next/server';
import { ProgressController } from '@/lib/presentations/controllers/progress/ProgressController';

export async function GET(request: NextRequest) {
  return ProgressController.getUserProgress(request);
}
