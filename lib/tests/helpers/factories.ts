import type { UseCaseDependencies } from '@kopiketuk/framework';
import { vi } from 'vitest';

import type { AuthRepositoryInterface } from '@/lib/domains/auth/repositories/AuthRepositoryInterface';
import type { PasswordServiceInterface } from '@/lib/domains/auth/services/AuthServiceInterface';
import type { JwtServiceInterface } from '@/lib/domains/auth/services/AuthServiceInterface';

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

export function createMockUseCaseDependencies(): UseCaseDependencies {
  return {
    logger: {
      writeError: vi.fn().mockResolvedValue(undefined),
      writeClientError: vi.fn().mockResolvedValue(undefined),
      writeEvent: vi.fn().mockResolvedValue(undefined),
    },
    applicationEvent: {
      raise: vi.fn(),
      subscribe: vi.fn(),
    },
  };
}
