import {
  ApplicationUseCase,
  InvariantError,
} from '@kopiketuk/framework';
import { User } from '../../../domains/auth/entities/User';
import type { LearnDmdsUseCaseDependencies } from '../base/dependencies';

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
  private readonly authRepository = this.deps.authRepository;
  private readonly passwordService = this.deps.passwordService;

  constructor(private deps: LearnDmdsUseCaseDependencies) {
    super(deps);
    // Jangan log input — mengandung password plain text
    this.setLoggingRestriction({ input: true });
  }

  protected async run(
    payload: RegisterUserInput,
  ): Promise<RegisterUserOutput> {
    if (!payload.username || payload.username.trim().length === 0) {
      throw new InvariantError('REGISTER_USER.NO_USERNAME');
    }

    if (!payload.email || payload.email.trim().length === 0) {
      throw new InvariantError('REGISTER_USER.NO_EMAIL');
    }

    if (!payload.password) {
      throw new InvariantError('REGISTER_USER.NO_PASSWORD');
    }

    if (payload.password !== payload.confirmPassword) {
      throw new InvariantError('REGISTER_USER.PASSWORD_NOT_MATCH');
    }

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

    const passwordHash = await this.passwordService.hash(payload.password);

    const user = User.create({
      username: payload.username,
      email: payload.email,
      passwordHash,
      displayName: payload.username,
    });

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
