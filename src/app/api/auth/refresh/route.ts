import { NextRequest, NextResponse } from 'next/server';
import { register } from '../../../../../lib/infrastructures/container';
import { AuthenticationError } from '@kopiketuk/framework';

const container = register();

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { status: 'fail', message: 'No refresh token' },
        { status: 401 },
      );
    }

    const useCase = container.cradle.refreshTokenUseCase;
    const result = await useCase.execute({ refreshToken });

    const response = NextResponse.json(
      {
        status: 'success',
        data: {
          accessToken: result.accessToken,
        },
      },
      { status: 200 },
    );

    // Set new refresh token cookie (rotation)
    response.cookies.set('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      const response = NextResponse.json(
        { status: 'fail', message: error.message },
        { status: 401 },
      );
      // Clear invalid refresh token
      response.cookies.set('refresh_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth',
        maxAge: 0,
      });
      return response;
    }

    console.error('Refresh error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
