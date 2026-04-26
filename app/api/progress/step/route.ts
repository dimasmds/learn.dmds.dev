import { NextRequest } from 'next/server';
import { ProgressController } from '@/lib/presentations/controllers/progress/ProgressController';

export async function POST(request: NextRequest) {
  return ProgressController.updateProgress(request);
}
