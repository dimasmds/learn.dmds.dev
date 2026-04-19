import { NextRequest, NextResponse } from 'next/server';
import { register } from '../../../../../lib/infrastructures/container';
import { AuthController } from '../../../../../lib/presentations/controllers/auth/AuthController';

const controller = new AuthController(register());

export async function POST(request: NextRequest) {
  return controller.refresh(request);
}
