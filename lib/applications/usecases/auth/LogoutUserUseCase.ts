import {
  ApplicationUseCase,
  AuthenticationError,
} from '@kopiketuk/framework';
import type { LearnDmdsUseCaseDependencies } from '../base/dependencies';

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
  private readonly authRepository = this.deps.authRepository;
  private readonly jwtService = this.deps.jwtService;

  constructor(private deps: LearnDmdsUseCaseDependencies) {
    super(deps);
  }

  protected async run(payload: LogoutUserInput): Promise<LogoutUserOutput> {
    if (!payload.refreshToken) {
      throw new AuthenticationError('LOGOUT_USER.NO_REFRESH_TOKEN');
    }

    const tokenHash = this.jwtService.hashRefreshToken(payload.refreshToken);
    const session = await this.authRepository.findSessionByRefreshToken(tokenHash);

    if (!session) {
      throw new AuthenticationError('LOGOUT_USER.SESSION_NOT_FOUND');
    }

    await this.authRepository.deleteSession(session.id);

    return { success: true };
  }
}
