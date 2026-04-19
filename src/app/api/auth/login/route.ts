import { NextRequest, NextResponse } from 'next/server';
import { register } from '../../../../../lib/infrastructures/container';
import { InvariantError, AuthenticationError } from '@kopiketuk/framework';

const container = register();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const useCase = container.cradle.loginUserUseCase;
    const result = await useCase.execute({ email, password });

    const response = NextResponse.json(
      {
        status: 'success',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      },
      { status: 200 },
    );

    // Set refresh token as httpOnly cookie
    response.cookies.set('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    if (error instanceof InvariantError) {
      return NextResponse.json(
        { status: 'fail', message: error.message },
        { status: 400 },
      );
    }

    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { status: 'fail', message: error.message },
        { status: 401 },
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
