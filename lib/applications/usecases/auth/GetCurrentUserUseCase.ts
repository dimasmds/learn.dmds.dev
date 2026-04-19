import {
  ApplicationUseCase,
  AuthenticationError,
} from '@kopiketuk/framework';
import type { UseCaseDependencies } from '@kopiketuk/framework';
import type { AuthRepositoryInterface } from '../../../domains/auth/repositories/AuthRepositoryInterface';
import type { JwtServiceInterface } from '../../../domains/auth/services/AuthServiceInterface';

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
  constructor(
    dependencies: UseCaseDependencies,
    private authRepository: AuthRepositoryInterface,
    private jwtService: JwtServiceInterface,
  ) {
    super(dependencies);
  }

  protected async run(payload: GetCurrentUserInput): Promise<GetCurrentUserOutput> {
    if (!payload.accessToken) {
      throw new AuthenticationError('GET_CURRENT_USER.NO_ACCESS_TOKEN');
    }

    const decoded = this.jwtService.verifyAccessToken(payload.accessToken);

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
