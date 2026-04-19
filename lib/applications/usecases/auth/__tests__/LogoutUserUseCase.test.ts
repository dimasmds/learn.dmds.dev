import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthenticationError } from '@kopiketuk/framework';
import { LogoutUserUseCase } from '../LogoutUserUseCase';
import type { AuthRepositoryInterface } from '../../../../domains/auth/repositories/AuthRepositoryInterface';
import type { JwtServiceInterface } from '../../../../domains/auth/services/AuthServiceInterface';
import { AuthSession } from '../../../../domains/auth/entities/AuthSession';

function createMockAuthRepository(overrides: Partial<AuthRepositoryInterface> = {}): AuthRepositoryInterface {
  return {
    createUser: vi.fn().mockResolvedValue(undefined),
    findUserByEmail: vi.fn().mockResolvedValue(null),
    findUserByUsername: vi.fn().mockResolvedValue(null),
    findUserById: vi.fn().mockResolvedValue(null),
    createSession: vi.fn().mockResolvedValue(undefined),
    findSessionByRefreshToken: vi.fn().mockResolvedValue(null),
    deleteSession: vi.fn().mockResolvedValue(undefined),
    deleteUserSessions: vi.fn().mockResolvedValue(undefined),
    countActiveSessions: vi.fn().mockResolvedValue(0),
    ...overrides,
  };
}

function createMockJwtService(): JwtServiceInterface {
  return {
    generateTokenPair: vi.fn().mockReturnValue({ accessToken: 'access', refreshToken: 'refresh' }),
    verifyAccessToken: vi.fn().mockReturnValue({ userId: 'user-id', username: 'test' }),
    verifyRefreshToken: vi.fn().mockReturnValue({ userId: 'user-id', username: 'test' }),
    hashRefreshToken: vi.fn().mockReturnValue('hashed-token'),
  };
}

function createMockDependencies() {
  return {
    applicationEvent: { raise: vi.fn().mockResolvedValue(undefined), subscribe: vi.fn() },
    logger: {
      writeError: vi.fn().mockResolvedValue(undefined),
      writeClientError: vi.fn().mockResolvedValue(undefined),
      writeEvent: vi.fn().mockResolvedValue(undefined),
    },
  };
}

describe('LogoutUserUseCase', () => {
  let mockRepository: AuthRepositoryInterface;
  let mockJwtService: JwtServiceInterface;
  let mockDependencies: ReturnType<typeof createMockDependencies>;
  let useCase: LogoutUserUseCase;

  beforeEach(() => {
    mockRepository = createMockAuthRepository();
    mockJwtService = createMockJwtService();
    mockDependencies = createMockDependencies();
    useCase = new LogoutUserUseCase(mockDependencies, mockRepository, mockJwtService);
  });

  const mockSession = AuthSession.create({
    userId: 'user-id',
    refreshTokenHash: 'hashed-token',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  describe('happy path', () => {
    it('should logout successfully when session exists', async () => {
      mockRepository = createMockAuthRepository({
        findSessionByRefreshToken: vi.fn().mockResolvedValue(mockSession),
      });
      useCase = new LogoutUserUseCase(mockDependencies, mockRepository, mockJwtService);

      const result = await useCase.execute({ refreshToken: 'some-refresh-token' });

      expect(result.success).toBe(true);
    });

    it('should hash the refresh token and find the session', async () => {
      mockRepository = createMockAuthRepository({
        findSessionByRefreshToken: vi.fn().mockResolvedValue(mockSession),
      });
      useCase = new LogoutUserUseCase(mockDependencies, mockRepository, mockJwtService);

      await useCase.execute({ refreshToken: 'some-refresh-token' });

      expect(mockJwtService.hashRefreshToken).toHaveBeenCalledWith('some-refresh-token');
      expect(mockRepository.findSessionByRefreshToken).toHaveBeenCalledWith('hashed-token');
    });

    it('should delete the session when found', async () => {
      mockRepository = createMockAuthRepository({
        findSessionByRefreshToken: vi.fn().mockResolvedValue(mockSession),
      });
      useCase = new LogoutUserUseCase(mockDependencies, mockRepository, mockJwtService);

      await useCase.execute({ refreshToken: 'some-refresh-token' });

      expect(mockRepository.deleteSession).toHaveBeenCalledWith(mockSession.id);
    });
  });

  describe('validation', () => {
    it('should throw AuthenticationError when refreshToken is empty', async () => {
      await expect(useCase.execute({ refreshToken: '' }))
        .rejects.toThrow('LOGOUT_USER.NO_REFRESH_TOKEN');
    });

    it('should throw AuthenticationError when refreshToken is missing', async () => {
      await expect(useCase.execute({ refreshToken: '' }))
        .rejects.toThrow(AuthenticationError);
    });
  });

  describe('edge cases', () => {
    it('should still return success when session not found (idempotent)', async () => {
      mockRepository = createMockAuthRepository({
        findSessionByRefreshToken: vi.fn().mockResolvedValue(null),
      });
      useCase = new LogoutUserUseCase(mockDependencies, mockRepository, mockJwtService);

      const result = await useCase.execute({ refreshToken: 'nonexistent-token' });

      expect(result.success).toBe(true);
    });

    it('should NOT call deleteSession when session not found', async () => {
      mockRepository = createMockAuthRepository({
        findSessionByRefreshToken: vi.fn().mockResolvedValue(null),
      });
      useCase = new LogoutUserUseCase(mockDependencies, mockRepository, mockJwtService);

      await useCase.execute({ refreshToken: 'nonexistent-token' });

      expect(mockRepository.deleteSession).not.toHaveBeenCalled();
    });
  });
});
