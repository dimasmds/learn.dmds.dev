import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvariantError, AuthenticationError } from '@kopiketuk/framework';
import { LoginUserUseCase } from '../LoginUserUseCase';
import type { AuthRepositoryInterface } from '../../../../domains/auth/repositories/AuthRepositoryInterface';
import type { PasswordServiceInterface, JwtServiceInterface } from '../../../../domains/auth/services/AuthServiceInterface';
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

function createMockPasswordService(overrides: Partial<PasswordServiceInterface> = {}): PasswordServiceInterface {
  return {
    hash: vi.fn().mockResolvedValue('$2a$10$hashed'),
    compare: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}

function createMockJwtService(): JwtServiceInterface {
  return {
    generateTokenPair: vi.fn().mockReturnValue({
      accessToken: 'access.token.here',
      refreshToken: 'refresh.token.here',
    }),
    verifyAccessToken: vi.fn().mockReturnValue({ userId: 'user-id', username: 'johndoe' }),
    verifyRefreshToken: vi.fn().mockReturnValue({ userId: 'user-id', username: 'johndoe' }),
    hashRefreshToken: vi.fn().mockReturnValue('hashed-refresh-token'),
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

describe('LoginUserUseCase', () => {
  let mockRepository: AuthRepositoryInterface;
  let mockPasswordService: PasswordServiceInterface;
  let mockJwtService: JwtServiceInterface;
  let mockDependencies: ReturnType<typeof createMockDependencies>;
  let useCase: LoginUserUseCase;

  const mockUser = User.create({
    username: 'johndoe',
    email: 'john@example.com',
    passwordHash: '$2a$10$hashedpassword',
    displayName: 'John Doe',
  });

  beforeEach(() => {
    mockRepository = createMockAuthRepository({
      findUserByEmail: vi.fn().mockResolvedValue(mockUser),
    });
    mockPasswordService = createMockPasswordService();
    mockJwtService = createMockJwtService();
    mockDependencies = createMockDependencies();
    useCase = new LoginUserUseCase(mockDependencies, mockRepository, mockPasswordService, mockJwtService);
  });

  describe('happy path', () => {
    it('should login successfully and return tokens with user data', async () => {
      const result = await useCase.execute({
        email: 'john@example.com',
        password: 'SecurePass123',
      });

      expect(result.accessToken).toBe('access.token.here');
      expect(result.refreshToken).toBe('refresh.token.here');
      expect(result.user.username).toBe('johndoe');
      expect(result.user.email).toBe('john@example.com');
    });

    it('should verify password against stored hash', async () => {
      await useCase.execute({ email: 'john@example.com', password: 'SecurePass123' });

      expect(mockPasswordService.compare).toHaveBeenCalledWith('SecurePass123', mockUser.passwordHash);
    });

    it('should generate token pair', async () => {
      await useCase.execute({ email: 'john@example.com', password: 'SecurePass123' });

      expect(mockJwtService.generateTokenPair).toHaveBeenCalledWith({
        userId: mockUser.id,
        username: 'johndoe',
      });
    });

    it('should create a new session', async () => {
      await useCase.execute({ email: 'john@example.com', password: 'SecurePass123' });

      expect(mockRepository.createSession).toHaveBeenCalledTimes(1);
    });

    it('should trim and lowercase email before lookup', async () => {
      await useCase.execute({ email: '  JOHN@EXAMPLE.COM  ', password: 'SecurePass123' });

      expect(mockRepository.findUserByEmail).toHaveBeenCalledWith('john@example.com');
    });
  });

  describe('validation', () => {
    it('should throw InvariantError when email or password is missing', async () => {
      await expect(useCase.execute({ email: '', password: 'pass' }))
        .rejects.toThrow('LOGIN_USER.MISSING_CREDENTIALS');
    });

    it('should throw InvariantError when password is missing', async () => {
      await expect(useCase.execute({ email: 'john@example.com', password: '' }))
        .rejects.toThrow('LOGIN_USER.MISSING_CREDENTIALS');
    });
  });

  describe('authentication failures', () => {
    it('should throw AuthenticationError when user not found', async () => {
      mockRepository = createMockAuthRepository({
        findUserByEmail: vi.fn().mockResolvedValue(null),
      });
      useCase = new LoginUserUseCase(mockDependencies, mockRepository, mockPasswordService, mockJwtService);

      await expect(useCase.execute({ email: 'noone@example.com', password: 'pass' }))
        .rejects.toThrow('LOGIN_USER.INVALID_CREDENTIALS');
    });

    it('should throw AuthenticationError when password is wrong', async () => {
      mockPasswordService = createMockPasswordService({
        compare: vi.fn().mockResolvedValue(false),
      });
      useCase = new LoginUserUseCase(mockDependencies, mockRepository, mockPasswordService, mockJwtService);

      await expect(useCase.execute({ email: 'john@example.com', password: 'wrongpass' }))
        .rejects.toThrow('LOGIN_USER.INVALID_CREDENTIALS');
    });

    it('should not create session when authentication fails', async () => {
      mockRepository = createMockAuthRepository({
        findUserByEmail: vi.fn().mockResolvedValue(null),
      });
      useCase = new LoginUserUseCase(mockDependencies, mockRepository, mockPasswordService, mockJwtService);

      await expect(useCase.execute({ email: 'noone@example.com', password: 'pass' }))
        .rejects.toThrow();

      expect(mockRepository.createSession).not.toHaveBeenCalled();
    });
  });

  describe('session management', () => {
    it('should delete all sessions when user has 5+ active sessions', async () => {
      mockRepository = createMockAuthRepository({
        findUserByEmail: vi.fn().mockResolvedValue(mockUser),
        countActiveSessions: vi.fn().mockResolvedValue(5),
      });
      useCase = new LoginUserUseCase(mockDependencies, mockRepository, mockPasswordService, mockJwtService);

      await useCase.execute({ email: 'john@example.com', password: 'SecurePass123' });

      expect(mockRepository.deleteUserSessions).toHaveBeenCalledWith(mockUser.id);
    });

    it('should NOT delete sessions when user has fewer than 5 active sessions', async () => {
      mockRepository = createMockAuthRepository({
        findUserByEmail: vi.fn().mockResolvedValue(mockUser),
        countActiveSessions: vi.fn().mockResolvedValue(4),
      });
      useCase = new LoginUserUseCase(mockDependencies, mockRepository, mockPasswordService, mockJwtService);

      await useCase.execute({ email: 'john@example.com', password: 'SecurePass123' });

      expect(mockRepository.deleteUserSessions).not.toHaveBeenCalled();
    });
  });
});
