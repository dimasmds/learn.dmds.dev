import { describe, it, expect, vi } from 'vitest';
import { LogoutUserUseCase } from '../LogoutUserUseCase';
import type { AuthRepositoryInterface } from '../../../../domains/auth/repositories/AuthRepositoryInterface';
import type { JwtServiceInterface } from '../../../../domains/auth/services/AuthServiceInterface';
import { AuthSession } from '../../../../domains/auth/entities/AuthSession';

const mockDeps = {
  applicationEvent: {
    raise: vi.fn().mockResolvedValue(undefined),
    subscribe: vi.fn(),
  },
  logger: {
    writeError: vi.fn().mockResolvedValue(undefined),
    writeClientError: vi.fn().mockResolvedValue(undefined),
    writeEvent: vi.fn().mockResolvedValue(undefined),
  },
};

function createMocks() {
  const mockSession = AuthSession.create({
    userId: crypto.randomUUID(),
    refreshTokenHash: 'hashed_refresh_token',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const authRepository: AuthRepositoryInterface = {
    createUser: vi.fn(),
    findUserByEmail: vi.fn(),
    findUserByUsername: vi.fn(),
    findUserById: vi.fn(),
    createSession: vi.fn(),
    findSessionByRefreshToken: vi.fn().mockResolvedValue(mockSession),
    deleteSession: vi.fn().mockResolvedValue(undefined),
    deleteUserSessions: vi.fn(),
    countActiveSessions: vi.fn(),
  };

  const jwtService: JwtServiceInterface = {
    generateTokenPair: vi.fn(),
    verifyAccessToken: vi.fn(),
    verifyRefreshToken: vi.fn(),
    hashRefreshToken: vi.fn().mockReturnValue('hashed_refresh_token'),
  };

  return { authRepository, jwtService, mockSession };
}

describe('LogoutUserUseCase', () => {
  it('should logout successfully with valid refresh token', async () => {
    const { authRepository, jwtService } = createMocks();
    const useCase = new LogoutUserUseCase(mockDeps, authRepository, jwtService);

    const result = await useCase.execute({ refreshToken: 'valid_refresh_token' });

    expect(result.success).toBe(true);
    expect(jwtService.hashRefreshToken).toHaveBeenCalledWith('valid_refresh_token');
    expect(authRepository.deleteSession).toHaveBeenCalled();
  });

  it('should succeed even when session not found (idempotent)', async () => {
    const { authRepository, jwtService } = createMocks();
    authRepository.findSessionByRefreshToken = vi.fn().mockResolvedValue(null);
    const useCase = new LogoutUserUseCase(mockDeps, authRepository, jwtService);

    const result = await useCase.execute({ refreshToken: 'unknown_token' });

    expect(result.success).toBe(true);
    expect(authRepository.deleteSession).not.toHaveBeenCalled();
  });

  it('should throw when no refresh token provided', async () => {
    const { authRepository, jwtService } = createMocks();
    const useCase = new LogoutUserUseCase(mockDeps, authRepository, jwtService);

    await expect(useCase.execute({ refreshToken: '' })).rejects.toThrow();
  });
});
