import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { InvariantError, AuthenticationError } from '@kopiketuk/framework';

import type { RegisterUserUseCase } from '@/lib/applications/usecases/auth/RegisterUserUseCase';
import type { LoginUserUseCase } from '@/lib/applications/usecases/auth/LoginUserUseCase';
import type { LogoutUserUseCase } from '@/lib/applications/usecases/auth/LogoutUserUseCase';
import type { RefreshTokenUseCase } from '@/lib/applications/usecases/auth/RefreshTokenUseCase';
import type { GetCurrentUserUseCase } from '@/lib/applications/usecases/auth/GetCurrentUserUseCase';
import { container } from '@/lib/infrastructures/container';

export class AuthController {
  static register = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const body = await request.json();
      const { username, email, password, confirmPassword } = body;

      const useCase = container.getInstance('RegisterUserUseCase') as RegisterUserUseCase;
      const result = await useCase.execute({ username, email, password, confirmPassword });

      return NextResponse.json(
        {
          status: 'success',
          data: {
            user: {
              id: result.id,
              username: result.username,
              email: result.email,
              displayName: result.displayName,
              createdAt: result.createdAt.toISOString(),
            },
          },
        },
        { status: 201 },
      );
    } catch (error) {
      return AuthController.handleError(error);
    }
  };

  static login = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const body = await request.json();
      const { email, password } = body;

      const useCase = container.getInstance('LoginUserUseCase') as LoginUserUseCase;
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

      response.cookies.set('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth',
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    } catch (error) {
      return AuthController.handleError(error);
    }
  };

  static logout = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const refreshToken = request.cookies.get('refresh_token')?.value;

      const useCase = container.getInstance('LogoutUserUseCase') as LogoutUserUseCase;
      await useCase.execute({ refreshToken: refreshToken || '' });

      const response = NextResponse.json(
        { status: 'success', data: null },
        { status: 200 },
      );

      response.cookies.set('refresh_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth',
        maxAge: 0,
      });

      return response;
    } catch (error) {
      return AuthController.handleError(error);
    }
  };

  static refresh = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const refreshToken = request.cookies.get('refresh_token')?.value;

      if (!refreshToken) {
        return NextResponse.json(
          { status: 'fail', message: 'No refresh token' },
          { status: 401 },
        );
      }

      const useCase = container.getInstance('RefreshTokenUseCase') as RefreshTokenUseCase;
      const result = await useCase.execute({ refreshToken });

      const response = NextResponse.json(
        {
          status: 'success',
          data: { accessToken: result.accessToken },
        },
        { status: 200 },
      );

      response.cookies.set('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth',
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        const response = NextResponse.json(
          { status: 'fail', message: error.message },
          { status: 401 },
        );
        response.cookies.set('refresh_token', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/api/auth',
          maxAge: 0,
        });
        return response;
      }
      return AuthController.handleError(error);
    }
  };

  static me = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const authHeader = request.headers.get('authorization');
      const accessToken = authHeader?.replace('Bearer ', '');

      if (!accessToken) {
        return NextResponse.json(
          { status: 'fail', message: 'No access token' },
          { status: 401 },
        );
      }

      const useCase = container.getInstance('GetCurrentUserUseCase') as GetCurrentUserUseCase;
      const result = await useCase.execute({ accessToken });

      return NextResponse.json(
        {
          status: 'success',
          data: {
            user: {
              id: result.id,
              username: result.username,
              email: result.email,
              displayName: result.displayName,
              createdAt: result.createdAt.toISOString(),
            },
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return AuthController.handleError(error);
    }
  };

  private static handleError(error: unknown): NextResponse {
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

    console.error('Auth controller error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
