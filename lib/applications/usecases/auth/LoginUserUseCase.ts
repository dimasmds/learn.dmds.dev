import {
  ApplicationUseCase,
  InvariantError,
  AuthenticationError,
} from '@kopiketuk/framework';
import type { UseCaseDependencies } from '@kopiketuk/framework';
import type { AuthRepositoryInterface } from '../../../domains/auth/repositories/AuthRepositoryInterface';
import type { PasswordServiceInterface, JwtServiceInterface } from '../../../domains/auth/services/AuthServiceInterface';
import { AuthSession } from '../../../domains/auth/entities/AuthSession';

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    displayName: string;
  };
}

export class LoginUserUseCase extends ApplicationUseCase<
  LoginUserInput,
  LoginUserOutput
> {
  constructor(
    dependencies: UseCaseDependencies,
    private authRepository: AuthRepositoryInterface,
    private passwordService: PasswordServiceInterface,
    private jwtService: JwtServiceInterface,
  ) {
    super(dependencies);
    this.setLoggingRestriction({ input: true });
  }

  protected async run(payload: LoginUserInput): Promise<LoginUserOutput> {
    if (!payload.email || !payload.password) {
      throw new InvariantError('LOGIN_USER.MISSING_CREDENTIALS');
    }

    // Find user by email
    const user = await this.authRepository.findUserByEmail(
      payload.email.trim().toLowerCase(),
    );

    if (!user) {
      throw new AuthenticationError('LOGIN_USER.INVALID_CREDENTIALS');
    }

    // Verify password
    const isValid = await this.passwordService.compare(
      payload.password,
      user.passwordHash,
    );

    if (!isValid) {
      throw new AuthenticationError('LOGIN_USER.INVALID_CREDENTIALS');
    }

    // Generate tokens
    const tokens = this.jwtService.generateTokenPair({
      userId: user.id,
      username: user.username,
    });

    // Create session
    const session = AuthSession.create({
      userId: user.id,
      refreshTokenHash: this.jwtService.hashRefreshToken(tokens.refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Enforce max 5 active sessions
    const activeCount = await this.authRepository.countActiveSessions(user.id);
    if (activeCount >= 5) {
      await this.authRepository.deleteUserSessions(user.id);
    }

    await this.authRepository.createSession(session);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
      },
    };
  }
}
