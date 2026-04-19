import {
  ApplicationUseCase,
  AuthenticationError,
} from '@kopiketuk/framework';
import { AuthSession } from '../../../domains/auth/entities/AuthSession';
import type { LearnDmdsUseCaseDependencies } from '../base/dependencies';

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
  private readonly authRepository = this.deps.authRepository;
  private readonly jwtService = this.deps.jwtService;

  constructor(private deps: LearnDmdsUseCaseDependencies) {
    super(deps);
  }

  protected async run(payload: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const tokenHash = this.jwtService.hashRefreshToken(payload.refreshToken);
    const session = await this.authRepository.findSessionByRefreshToken(tokenHash);

    if (!session) {
      throw new AuthenticationError('REFRESH_TOKEN.SESSION_NOT_FOUND');
    }

    if (session.expiresAt < new Date()) {
      await this.authRepository.deleteSession(session.id);
      throw new AuthenticationError('REFRESH_TOKEN.SESSION_EXPIRED');
    }

    const decoded = this.jwtService.verifyRefreshToken(payload.refreshToken);
    if (!decoded) {
      throw new AuthenticationError('REFRESH_TOKEN.INVALID_TOKEN');
    }

    const newTokens = this.jwtService.generateTokenPair({
      userId: decoded.userId,
      username: decoded.username,
    });

    await this.authRepository.deleteSession(session.id);

    const newSession = AuthSession.create({
      userId: session.userId,
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
