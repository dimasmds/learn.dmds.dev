import { vi } from 'vitest';

import type { AuthRepositoryInterface } from '@/lib/domains/auth/repositories/AuthRepositoryInterface';
import type { PasswordServiceInterface, JwtServiceInterface } from '@/lib/domains/auth/services/AuthServiceInterface';
import type { LearningRepositoryInterface } from '@/lib/domains/learning/repositories/LearningRepositoryInterface';
import type { ProgressRepositoryInterface } from '@/lib/domains/progress/repositories/ProgressRepositoryInterface';
import type { LearnDmdsUseCaseDependencies } from '@/lib/applications/usecases/base/dependencies';

export function createMockAuthRepository(
  overrides: Partial<AuthRepositoryInterface> = {},
): AuthRepositoryInterface {
  return {
    createUser: vi.fn(),
    findUserByEmail: vi.fn(),
    findUserByUsername: vi.fn(),
    findUserById: vi.fn(),
    createSession: vi.fn(),
    findSessionByRefreshToken: vi.fn(),
    deleteSession: vi.fn(),
    deleteUserSessions: vi.fn(),
    countActiveSessions: vi.fn(),
    ...overrides,
  };
}

export function createMockPasswordService(
  overrides: Partial<PasswordServiceInterface> = {},
): PasswordServiceInterface {
  return {
    hash: vi.fn().mockResolvedValue('$2a$10$hashedpassword'),
    compare: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}

export function createMockJwtService(
  overrides: Partial<JwtServiceInterface> = {},
): JwtServiceInterface {
  return {
    generateTokenPair: vi.fn().mockReturnValue({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    }),
    verifyAccessToken: vi.fn(),
    verifyRefreshToken: vi.fn(),
    hashRefreshToken: vi.fn().mockReturnValue('hashed-refresh-token'),
    ...overrides,
  };
}

export function createMockLearningRepository(
  overrides: Partial<LearningRepositoryInterface> = {},
): LearningRepositoryInterface {
  return {
    getUnits: vi.fn().mockResolvedValue([]),
    getUnitById: vi.fn().mockResolvedValue(null),
    getLessonsByUnitId: vi.fn().mockResolvedValue([]),
    getLessonById: vi.fn().mockResolvedValue(null),
    getStepsByLessonId: vi.fn().mockResolvedValue([]),
    getStepById: vi.fn().mockResolvedValue(null),
    ...overrides,
  };
}

export function createMockProgressRepository(
  overrides: Partial<ProgressRepositoryInterface> = {},
): ProgressRepositoryInterface {
  return {
    getUserProgress: vi.fn().mockResolvedValue([]),
    getProgressByUserAndLesson: vi.fn().mockResolvedValue([]),
    getProgressByUserAndStep: vi.fn().mockResolvedValue(null),
    upsertProgress: vi.fn(),
    ...overrides,
  };
}

/**
 * DRY: Create fully mocked LearnDmdsUseCaseDependencies.
 * Each use case test only needs to override what it uses.
 */
export function createMockUseCaseDependencies(options: {
  authRepository?: AuthRepositoryInterface;
  passwordService?: PasswordServiceInterface;
  jwtService?: JwtServiceInterface;
  learningRepository?: LearningRepositoryInterface;
  progressRepository?: ProgressRepositoryInterface;
} = {}): LearnDmdsUseCaseDependencies {
  return {
    logger: {
      writeError: vi.fn().mockResolvedValue(undefined),
      writeClientError: vi.fn().mockResolvedValue(undefined),
      writeEvent: vi.fn().mockResolvedValue(undefined),
    },
    applicationEvent: {
      raise: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn(),
    },
    authRepository: options.authRepository ?? createMockAuthRepository(),
    passwordService: options.passwordService ?? createMockPasswordService(),
    jwtService: options.jwtService ?? createMockJwtService(),
    learningRepository: options.learningRepository ?? createMockLearningRepository(),
    progressRepository: options.progressRepository ?? createMockProgressRepository(),
  };
}
