import { NextRequest, NextResponse } from 'next/server';
import { register } from '../../../../../lib/infrastructures/container';
import { AuthenticationError } from '@kopiketuk/framework';

const container = register();

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    if (!accessToken) {
      return NextResponse.json(
        { status: 'fail', message: 'No access token' },
        { status: 401 },
      );
    }

    const useCase = container.cradle.getCurrentUserUseCase;
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
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { status: 'fail', message: error.message },
        { status: 401 },
      );
    }

    console.error('Get current user error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
