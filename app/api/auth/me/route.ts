import { NextRequest } from 'next/server';
import { AuthController } from '@/lib/presentations/controllers/auth/AuthController';

export async function GET(request: NextRequest) {
  return AuthController.me(request);
}
