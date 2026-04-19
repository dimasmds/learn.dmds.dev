import {
  ApplicationUseCase,
  AuthenticationError,
} from '@kopiketuk/framework';
import type { UseCaseDependencies } from '@kopiketuk/framework';
import type { AuthRepositoryInterface } from '../../../domains/auth/repositories/AuthRepositoryInterface';
import type { JwtServiceInterface } from '../../../domains/auth/services/AuthServiceInterface';

export interface LogoutUserInput {
  refreshToken: string;
}

export interface LogoutUserOutput {
  success: boolean;
}

export class LogoutUserUseCase extends ApplicationUseCase<
  LogoutUserInput,
  LogoutUserOutput
> {
  constructor(
    dependencies: UseCaseDependencies,
    private authRepository: AuthRepositoryInterface,
    private jwtService: JwtServiceInterface,
  ) {
    super(dependencies);
  }

  protected async run(payload: LogoutUserInput): Promise<LogoutUserOutput> {
    if (!payload.refreshToken) {
      throw new AuthenticationError('LOGOUT_USER.NO_REFRESH_TOKEN');
    }

    const tokenHash = this.jwtService.hashRefreshToken(payload.refreshToken);
    const session = await this.authRepository.findSessionByRefreshToken(tokenHash);

    if (session) {
      await this.authRepository.deleteSession(session.id);
    }

    return { success: true };
  }
}
