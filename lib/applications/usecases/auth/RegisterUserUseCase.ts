import {
  ApplicationUseCase,
  InvariantError,
} from '@kopiketuk/framework';
import type { UseCaseDependencies } from '@kopiketuk/framework';
import { User } from '../../../domains/auth/entities/User';
import type { AuthRepositoryInterface } from '../../../domains/auth/repositories/AuthRepositoryInterface';

export interface RegisterUserInput {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterUserOutput {
  id: string;
  username: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

export class RegisterUserUseCase extends ApplicationUseCase<
  RegisterUserInput,
  RegisterUserOutput
> {
  private authRepository: AuthRepositoryInterface;

  constructor(
    dependencies: UseCaseDependencies,
    authRepository: AuthRepositoryInterface,
  ) {
    super(dependencies);
    this.authRepository = authRepository;
    // Jangan log input — mengandung password plain text
    this.setLoggingRestriction({ input: true });
  }

  protected async run(
    payload: RegisterUserInput,
  ): Promise<RegisterUserOutput> {
    // Validate required fields
    if (!payload.username || payload.username.trim().length === 0) {
      throw new InvariantError('REGISTER_USER.NO_USERNAME');
    }

    if (!payload.email || payload.email.trim().length === 0) {
      throw new InvariantError('REGISTER_USER.NO_EMAIL');
    }

    if (!payload.password) {
      throw new InvariantError('REGISTER_USER.NO_PASSWORD');
    }

    // Validate password match
    if (payload.password !== payload.confirmPassword) {
      throw new InvariantError('REGISTER_USER.PASSWORD_NOT_MATCH');
    }

    // Check uniqueness
    const existingUser = await this.authRepository.findUserByEmail(
      payload.email,
    );
    if (existingUser) {
      throw new InvariantError('REGISTER_USER.EMAIL_ALREADY_EXISTS');
    }

    const existingUsername = await this.authRepository.findUserByUsername(
      payload.username,
    );
    if (existingUsername) {
      throw new InvariantError('REGISTER_USER.USERNAME_ALREADY_EXISTS');
    }

    // Hash password (stub for now — in real app, use bcrypt)
    const passwordHash = `hashed_${payload.password}`;

    // Create user entity
    const user = User.create({
      username: payload.username,
      email: payload.email,
      passwordHash,
      displayName: payload.username, // default displayName = username
    });

    // Save via repository
    await this.authRepository.createUser(user);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt,
    };
  }
}
