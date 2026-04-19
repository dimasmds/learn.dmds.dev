import { NextRequest } from 'next/server';
import { AuthController } from '@/lib/presentations/controllers/auth/AuthController';

export async function POST(request: NextRequest) {
  return AuthController.logout(request);
}
