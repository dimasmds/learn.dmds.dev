import { describe, it, expect, vi } from 'vitest';
import { LoginUserUseCase } from '../LoginUserUseCase';
import type { AuthRepositoryInterface } from '../../../../domains/auth/repositories/AuthRepositoryInterface';
import type { PasswordServiceInterface, JwtServiceInterface } from '../../../../domains/auth/services/AuthServiceInterface';
import { User } from '../../../../domains/auth/entities/User';

// Mock deps
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
    passwordHash: 'real_hashed_password',
    displayName: 'Test User',
  });

  const authRepository: AuthRepositoryInterface = {
    createUser: vi.fn(),
    findUserByEmail: vi.fn().mockResolvedValue(mockUser),
    findUserByUsername: vi.fn(),
    findUserById: vi.fn(),
    createSession: vi.fn().mockResolvedValue(undefined),
    findSessionByRefreshToken: vi.fn(),
    deleteSession: vi.fn(),
    deleteUserSessions: vi.fn(),
    countActiveSessions: vi.fn().mockResolvedValue(0),
  };

  const passwordService: PasswordServiceInterface = {
    hash: vi.fn().mockResolvedValue('hashed_pw'),
    compare: vi.fn().mockResolvedValue(true),
  };

  const jwtService: JwtServiceInterface = {
    generateTokenPair: vi.fn().mockReturnValue({
      accessToken: 'access_token_123',
      refreshToken: 'refresh_token_456',
    }),
    verifyAccessToken: vi.fn().mockReturnValue({ userId: mockUser.id, username: 'testuser' }),
    verifyRefreshToken: vi.fn().mockReturnValue({ userId: mockUser.id, username: 'testuser' }),
    hashRefreshToken: vi.fn().mockReturnValue('hashed_refresh_token'),
  };

  return { authRepository, passwordService, jwtService, mockUser };
}

describe('LoginUserUseCase', () => {
  it('should login with valid credentials', async () => {
    const { authRepository, passwordService, jwtService, mockUser } = createMocks();
    const useCase = new LoginUserUseCase(mockDeps, authRepository, passwordService, jwtService);

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'Password1',
    });

    expect(result.accessToken).toBe('access_token_123');
    expect(result.refreshToken).toBe('refresh_token_456');
    expect(result.user.id).toBe(mockUser.id);
    expect(authRepository.findUserByEmail).toHaveBeenCalledWith('test@example.com');
    expect(passwordService.compare).toHaveBeenCalledWith('Password1', 'real_hashed_password');
    expect(authRepository.createSession).toHaveBeenCalled();
  });

  it('should throw on missing credentials', async () => {
    const { authRepository, passwordService, jwtService } = createMocks();
    const useCase = new LoginUserUseCase(mockDeps, authRepository, passwordService, jwtService);

    await expect(useCase.execute({ email: '', password: '' })).rejects.toThrow();
  });

  it('should throw on user not found', async () => {
    const { authRepository, passwordService, jwtService } = createMocks();
    authRepository.findUserByEmail = vi.fn().mockResolvedValue(null);
    const useCase = new LoginUserUseCase(mockDeps, authRepository, passwordService, jwtService);

    await expect(
      useCase.execute({ email: 'nope@example.com', password: 'Password1' })
    ).rejects.toThrow();
  });

  it('should throw on wrong password', async () => {
    const { authRepository, passwordService, jwtService } = createMocks();
    passwordService.compare = vi.fn().mockResolvedValue(false);
    const useCase = new LoginUserUseCase(mockDeps, authRepository, passwordService, jwtService);

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'WrongPassword1' })
    ).rejects.toThrow();
  });

  it('should delete all sessions when user has 5+ active sessions', async () => {
    const { authRepository, passwordService, jwtService } = createMocks();
    authRepository.countActiveSessions = vi.fn().mockResolvedValue(5);
    const useCase = new LoginUserUseCase(mockDeps, authRepository, passwordService, jwtService);

    await useCase.execute({ email: 'test@example.com', password: 'Password1' });

    expect(authRepository.deleteUserSessions).toHaveBeenCalled();
  });

  it('should normalize email to lowercase', async () => {
    const { authRepository, passwordService, jwtService } = createMocks();
    const useCase = new LoginUserUseCase(mockDeps, authRepository, passwordService, jwtService);

    await useCase.execute({ email: 'TEST@EXAMPLE.COM', password: 'Password1' });

    expect(authRepository.findUserByEmail).toHaveBeenCalledWith('test@example.com');
  });
});
