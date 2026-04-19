import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthenticationError } from '@kopiketuk/framework';
import { GetCurrentUserUseCase } from '../GetCurrentUserUseCase';
import type { AuthRepositoryInterface } from '../../../../domains/auth/repositories/AuthRepositoryInterface';
import type { JwtServiceInterface } from '../../../../domains/auth/services/AuthServiceInterface';
import { User } from '../../../../domains/auth/entities/User';

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
    verifyAccessToken: vi.fn().mockReturnValue({ userId: 'user-id', username: 'johndoe' }),
    verifyRefreshToken: vi.fn().mockReturnValue({ userId: 'user-id', username: 'johndoe' }),
    hashRefreshToken: vi.fn().mockReturnValue('hashed'),
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

describe('GetCurrentUserUseCase', () => {
  let mockRepository: AuthRepositoryInterface;
  let mockJwtService: JwtServiceInterface;
  let mockDependencies: ReturnType<typeof createMockDependencies>;
  let useCase: GetCurrentUserUseCase;

  const mockUser = User.create({
    username: 'johndoe',
    email: 'john@example.com',
    passwordHash: '$2a$10$hashed',
    displayName: 'John Doe',
  });

  beforeEach(() => {
    mockRepository = createMockAuthRepository({
      findUserById: vi.fn().mockResolvedValue(mockUser),
    });
    mockJwtService = createMockJwtService();
    mockDependencies = createMockDependencies();
    useCase = new GetCurrentUserUseCase(mockDependencies, mockRepository, mockJwtService);
  });

  describe('happy path', () => {
    it('should return current user data', async () => {
      const result = await useCase.execute({ accessToken: 'valid-token' });

      expect(result.id).toBe(mockUser.id);
      expect(result.username).toBe('johndoe');
      expect(result.email).toBe('john@example.com');
      expect(result.displayName).toBe('John Doe');
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should verify the access token', async () => {
      await useCase.execute({ accessToken: 'valid-token' });

      expect(mockJwtService.verifyAccessToken).toHaveBeenCalledWith('valid-token');
    });

    it('should find user by decoded userId', async () => {
      await useCase.execute({ accessToken: 'valid-token' });

      expect(mockRepository.findUserById).toHaveBeenCalledWith('user-id');
    });
  });

  describe('validation', () => {
    it('should throw AuthenticationError when no access token provided', async () => {
      await expect(useCase.execute({ accessToken: '' }))
        .rejects.toThrow('GET_CURRENT_USER.NO_ACCESS_TOKEN');
    });
  });

  describe('error cases', () => {
    it('should throw AuthenticationError when user not found', async () => {
      mockRepository = createMockAuthRepository({
        findUserById: vi.fn().mockResolvedValue(null),
      });
      useCase = new GetCurrentUserUseCase(mockDependencies, mockRepository, mockJwtService);

      await expect(useCase.execute({ accessToken: 'valid-token' }))
        .rejects.toThrow('GET_CURRENT_USER.USER_NOT_FOUND');
    });

    it('should propagate JWT verification errors', async () => {
      mockJwtService = {
        ...createMockJwtService(),
        verifyAccessToken: vi.fn().mockImplementation(() => {
          throw new Error('jwt expired');
        }),
      };
      useCase = new GetCurrentUserUseCase(mockDependencies, mockRepository, mockJwtService);

      await expect(useCase.execute({ accessToken: 'expired-token' }))
        .rejects.toThrow('jwt expired');
    });
  });
});
