import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthenticationError } from '@kopiketuk/framework';
import { RefreshTokenUseCase } from '../RefreshTokenUseCase';
import type { AuthRepositoryInterface } from '../../../../domains/auth/repositories/AuthRepositoryInterface';
import type { JwtServiceInterface } from '../../../../domains/auth/services/AuthServiceInterface';
import { User } from '../../../../domains/auth/entities/User';
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
    generateTokenPair: vi.fn().mockReturnValue({
      accessToken: 'new-access.token',
      refreshToken: 'new-refresh.token',
    }),
    verifyAccessToken: vi.fn().mockReturnValue({ userId: 'user-id', username: 'johndoe' }),
    verifyRefreshToken: vi.fn().mockReturnValue({ userId: 'user-id', username: 'johndoe' }),
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

describe('RefreshTokenUseCase', () => {
  let mockRepository: AuthRepositoryInterface;
  let mockJwtService: JwtServiceInterface;
  let mockDependencies: ReturnType<typeof createMockDependencies>;
  let useCase: RefreshTokenUseCase;

  const mockUser = User.create({
    username: 'johndoe',
    email: 'john@example.com',
    passwordHash: '$2a$10$hashed',
    displayName: 'John Doe',
  });

  const mockSession = AuthSession.create({
    userId: 'user-id',
    refreshTokenHash: 'hashed-token',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  beforeEach(() => {
    mockRepository = createMockAuthRepository({
      findSessionByRefreshToken: vi.fn().mockResolvedValue(mockSession),
      findUserById: vi.fn().mockResolvedValue(mockUser),
    });
    mockJwtService = createMockJwtService();
    mockDependencies = createMockDependencies();
    useCase = new RefreshTokenUseCase(mockDependencies, mockRepository, mockJwtService);
  });

  describe('happy path', () => {
    it('should refresh tokens successfully', async () => {
      const result = await useCase.execute({ refreshToken: 'old-refresh-token' });

      expect(result.accessToken).toBe('new-access.token');
      expect(result.refreshToken).toBe('new-refresh.token');
    });

    it('should verify the refresh token signature first', async () => {
      await useCase.execute({ refreshToken: 'old-refresh-token' });

      expect(mockJwtService.verifyRefreshToken).toHaveBeenCalledWith('old-refresh-token');
    });

    it('should delete old session (rotation)', async () => {
      await useCase.execute({ refreshToken: 'old-refresh-token' });

      expect(mockRepository.deleteSession).toHaveBeenCalledWith(mockSession.id);
    });

    it('should create new session with new refresh token', async () => {
      await useCase.execute({ refreshToken: 'old-refresh-token' });

      expect(mockRepository.createSession).toHaveBeenCalledTimes(1);
    });

    it('should generate new token pair', async () => {
      await useCase.execute({ refreshToken: 'old-refresh-token' });

      expect(mockJwtService.generateTokenPair).toHaveBeenCalledWith({
        userId: mockUser.id,
        username: 'johndoe',
      });
    });
  });

  describe('validation', () => {
    it('should throw AuthenticationError when no refresh token provided', async () => {
      await expect(useCase.execute({ refreshToken: '' }))
        .rejects.toThrow('REFRESH_TOKEN.NO_TOKEN_PROVIDED');
    });
  });

  describe('error cases', () => {
    it('should throw AuthenticationError when session not found', async () => {
      mockRepository = createMockAuthRepository({
        findSessionByRefreshToken: vi.fn().mockResolvedValue(null),
      });
      useCase = new RefreshTokenUseCase(mockDependencies, mockRepository, mockJwtService);

      await expect(useCase.execute({ refreshToken: 'old-token' }))
        .rejects.toThrow('REFRESH_TOKEN.SESSION_NOT_FOUND');
    });

    it('should throw AuthenticationError when session is expired and delete it', async () => {
      const expiredSession = AuthSession.reconstitute('session-id', {
        userId: 'user-id',
        refreshTokenHash: 'hashed-token',
        expiresAt: new Date(Date.now() - 1000), // expired
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      });
      mockRepository = createMockAuthRepository({
        findSessionByRefreshToken: vi.fn().mockResolvedValue(expiredSession),
      });
      useCase = new RefreshTokenUseCase(mockDependencies, mockRepository, mockJwtService);

      await expect(useCase.execute({ refreshToken: 'old-token' }))
        .rejects.toThrow('REFRESH_TOKEN.SESSION_EXPIRED');
      expect(mockRepository.deleteSession).toHaveBeenCalledWith('session-id');
    });

    it('should throw AuthenticationError when user not found', async () => {
      mockRepository = createMockAuthRepository({
        findSessionByRefreshToken: vi.fn().mockResolvedValue(mockSession),
        findUserById: vi.fn().mockResolvedValue(null),
      });
      useCase = new RefreshTokenUseCase(mockDependencies, mockRepository, mockJwtService);

      await expect(useCase.execute({ refreshToken: 'old-token' }))
        .rejects.toThrow('REFRESH_TOKEN.USER_NOT_FOUND');
    });
  });
});
