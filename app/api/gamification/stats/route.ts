import { NextRequest } from 'next/server';
import { GamificationController } from '@/lib/presentations/controllers/gamification/GamificationController';

export async function GET(request: NextRequest) {
  return GamificationController.getStats(request);
}
