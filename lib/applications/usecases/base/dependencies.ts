import type { UseCaseDependencies } from '@kopiketuk/framework';

import type { AuthRepositoryInterface } from '@/lib/domains/auth/repositories/AuthRepositoryInterface';
import type { PasswordServiceInterface, JwtServiceInterface } from '@/lib/domains/auth/services/AuthServiceInterface';
import type { LearningRepositoryInterface } from '@/lib/domains/learning/repositories/LearningRepositoryInterface';
import type { ProgressRepositoryInterface } from '@/lib/domains/progress/repositories/ProgressRepositoryInterface';

export interface LearnDmdsUseCaseDependencies extends UseCaseDependencies {
  authRepository: AuthRepositoryInterface;
  passwordService: PasswordServiceInterface;
  jwtService: JwtServiceInterface;
  learningRepository: LearningRepositoryInterface;
  progressRepository: ProgressRepositoryInterface;
}
