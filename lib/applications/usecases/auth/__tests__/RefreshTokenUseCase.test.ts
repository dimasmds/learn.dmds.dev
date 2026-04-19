import { describe, it, expect, vi } from 'vitest';
import { RefreshTokenUseCase } from '../RefreshTokenUseCase';
import type { AuthRepositoryInterface } from '../../../../domains/auth/repositories/AuthRepositoryInterface';
import type { JwtServiceInterface } from '../../../../domains/auth/services/AuthServiceInterface';
import { User } from '../../../../domains/auth/entities/User';
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
  const mockUser = User.create({
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashed_password',
    displayName: 'Test User',
  });

  const mockSession = AuthSession.create({
    userId: mockUser.id,
    refreshTokenHash: 'hashed_old_refresh',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const authRepository: AuthRepositoryInterface = {
    createUser: vi.fn(),
    findUserByEmail: vi.fn(),
    findUserByUsername: vi.fn(),
    findUserById: vi.fn().mockResolvedValue(mockUser),
    createSession: vi.fn().mockResolvedValue(undefined),
    findSessionByRefreshToken: vi.fn().mockResolvedValue(mockSession),
    deleteSession: vi.fn().mockResolvedValue(undefined),
    deleteUserSessions: vi.fn(),
    countActiveSessions: vi.fn(),
  };

  const jwtService: JwtServiceInterface = {
    generateTokenPair: vi.fn().mockReturnValue({
      accessToken: 'new_access_token',
      refreshToken: 'new_refresh_token',
    }),
    verifyAccessToken: vi.fn(),
    verifyRefreshToken: vi.fn().mockReturnValue({ userId: mockUser.id, username: 'testuser' }),
    hashRefreshToken: vi.fn().mockReturnValue('hashed_old_refresh'),
  };

  return { authRepository, jwtService, mockUser, mockSession };
}

describe('RefreshTokenUseCase', () => {
  it('should refresh tokens successfully', async () => {
    const { authRepository, jwtService } = createMocks();
    const useCase = new RefreshTokenUseCase(mockDeps, authRepository, jwtService);

    const result = await useCase.execute({ refreshToken: 'old_refresh_token' });

    expect(result.accessToken).toBe('new_access_token');
    expect(result.refreshToken).toBe('new_refresh_token');
    expect(authRepository.deleteSession).toHaveBeenCalled(); // old session deleted
    expect(authRepository.createSession).toHaveBeenCalled(); // new session created
  });

  it('should throw when no refresh token provided', async () => {
    const { authRepository, jwtService } = createMocks();
    const useCase = new RefreshTokenUseCase(mockDeps, authRepository, jwtService);

    await expect(useCase.execute({ refreshToken: '' })).rejects.toThrow();
  });

  it('should throw when session not found', async () => {
    const { authRepository, jwtService } = createMocks();
    authRepository.findSessionByRefreshToken = vi.fn().mockResolvedValue(null);
    const useCase = new RefreshTokenUseCase(mockDeps, authRepository, jwtService);

    await expect(
      useCase.execute({ refreshToken: 'invalid_token' })
    ).rejects.toThrow();
  });

  it('should throw when user not found', async () => {
    const { authRepository, jwtService } = createMocks();
    authRepository.findUserById = vi.fn().mockResolvedValue(null);
    const useCase = new RefreshTokenUseCase(mockDeps, authRepository, jwtService);

    await expect(
      useCase.execute({ refreshToken: 'old_refresh_token' })
    ).rejects.toThrow();
  });
});
