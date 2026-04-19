import { NextRequest, NextResponse } from 'next/server';
import { register } from '../../../../../lib/infrastructures/container';
import { InvariantError } from '@kopiketuk/framework';

const container = register();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, confirmPassword } = body;

    const useCase = container.cradle.registerUserUseCase;
    const result = await useCase.execute({
      username,
      email,
      password,
      confirmPassword,
    });

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
    if (error instanceof InvariantError) {
      return NextResponse.json(
        { status: 'fail', message: error.message },
        { status: 400 },
      );
    }

    console.error('Register error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
