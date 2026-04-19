import { NextRequest, NextResponse } from 'next/server';
import { register } from '../../../../../lib/infrastructures/container';
import { AuthenticationError } from '@kopiketuk/framework';

const container = register();

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value;

    const useCase = container.cradle.logoutUserUseCase;
    await useCase.execute({ refreshToken: refreshToken || '' });

    const response = NextResponse.json(
      { status: 'success', data: null },
      { status: 200 },
    );

    // Clear refresh token cookie
    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { status: 'fail', message: error.message },
        { status: 401 },
      );
    }

    console.error('Logout error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
