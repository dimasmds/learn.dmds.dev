import {
  ApplicationUseCase,
  AuthenticationError,
} from '@kopiketuk/framework';
import type { UseCaseDependencies } from '@kopiketuk/framework';
import type { AuthRepositoryInterface } from '../../../domains/auth/repositories/AuthRepositoryInterface';
import type { JwtServiceInterface } from '../../../domains/auth/services/AuthServiceInterface';
import { AuthSession } from '../../../domains/auth/entities/AuthSession';

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshTokenOutput {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenUseCase extends ApplicationUseCase<
  RefreshTokenInput,
  RefreshTokenOutput
> {
  constructor(
    dependencies: UseCaseDependencies,
    private authRepository: AuthRepositoryInterface,
    private jwtService: JwtServiceInterface,
  ) {
    super(dependencies);
  }

  protected async run(payload: RefreshTokenInput): Promise<RefreshTokenOutput> {
    if (!payload.refreshToken) {
      throw new AuthenticationError('REFRESH_TOKEN.NO_TOKEN_PROVIDED');
    }

    // Verify refresh token signature
    const decoded = this.jwtService.verifyRefreshToken(payload.refreshToken);

    // Find existing session
    const tokenHash = this.jwtService.hashRefreshToken(payload.refreshToken);
    const session = await this.authRepository.findSessionByRefreshToken(tokenHash);

    if (!session) {
      throw new AuthenticationError('REFRESH_TOKEN.SESSION_NOT_FOUND');
    }

    if (session.isExpired) {
      await this.authRepository.deleteSession(session.id);
      throw new AuthenticationError('REFRESH_TOKEN.SESSION_EXPIRED');
    }

    // Delete old session (rotation)
    await this.authRepository.deleteSession(session.id);

    // Get user
    const user = await this.authRepository.findUserById(decoded.userId);
    if (!user) {
      throw new AuthenticationError('REFRESH_TOKEN.USER_NOT_FOUND');
    }

    // Generate new token pair
    const newTokens = this.jwtService.generateTokenPair({
      userId: user.id,
      username: user.username,
    });

    // Create new session
    const newSession = AuthSession.create({
      userId: user.id,
      refreshTokenHash: this.jwtService.hashRefreshToken(newTokens.refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await this.authRepository.createSession(newSession);

    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    };
  }
}
