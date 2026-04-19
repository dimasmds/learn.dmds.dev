import type { UseCaseDependencies } from '@kopiketuk/framework';

import type { AuthRepositoryInterface } from '@/lib/domains/auth/repositories/AuthRepositoryInterface';
import type { PasswordServiceInterface, JwtServiceInterface } from '@/lib/domains/auth/services/AuthServiceInterface';

export interface LearnDmdsUseCaseDependencies extends UseCaseDependencies {
  authRepository: AuthRepositoryInterface;
  passwordService: PasswordServiceInterface;
  jwtService: JwtServiceInterface;
}
