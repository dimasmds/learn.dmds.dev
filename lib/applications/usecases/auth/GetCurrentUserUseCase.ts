import {
  ApplicationUseCase,
  AuthenticationError,
} from '@kopiketuk/framework';
import type { LearnDmdsUseCaseDependencies } from '../base/dependencies';

export interface GetCurrentUserInput {
  accessToken: string;
}

export interface GetCurrentUserOutput {
  id: string;
  username: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

export class GetCurrentUserUseCase extends ApplicationUseCase<
  GetCurrentUserInput,
  GetCurrentUserOutput
> {
  private readonly authRepository = this.deps.authRepository;
  private readonly jwtService = this.deps.jwtService;

  constructor(private deps: LearnDmdsUseCaseDependencies) {
    super(deps);
  }

  protected async run(payload: GetCurrentUserInput): Promise<GetCurrentUserOutput> {
    const decoded = this.jwtService.verifyAccessToken(payload.accessToken);
    if (!decoded) {
      throw new AuthenticationError('GET_CURRENT_USER.INVALID_TOKEN');
    }

    const user = await this.authRepository.findUserById(decoded.userId);
    if (!user) {
      throw new AuthenticationError('GET_CURRENT_USER.USER_NOT_FOUND');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt,
    };
  }
}
