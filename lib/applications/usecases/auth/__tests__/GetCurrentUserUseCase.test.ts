import { describe, it, expect, vi } from 'vitest';
import { GetCurrentUserUseCase } from '../GetCurrentUserUseCase';
import type { AuthRepositoryInterface } from '../../../../domains/auth/repositories/AuthRepositoryInterface';
import type { JwtServiceInterface } from '../../../../domains/auth/services/AuthServiceInterface';
import { User } from '../../../../domains/auth/entities/User';

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

  const authRepository: AuthRepositoryInterface = {
    createUser: vi.fn(),
    findUserByEmail: vi.fn(),
    findUserByUsername: vi.fn(),
    findUserById: vi.fn().mockResolvedValue(mockUser),
    createSession: vi.fn(),
    findSessionByRefreshToken: vi.fn(),
    deleteSession: vi.fn(),
    deleteUserSessions: vi.fn(),
    countActiveSessions: vi.fn(),
  };

  const jwtService: JwtServiceInterface = {
    generateTokenPair: vi.fn(),
    verifyAccessToken: vi.fn().mockReturnValue({ userId: mockUser.id, username: 'testuser' }),
    verifyRefreshToken: vi.fn(),
    hashRefreshToken: vi.fn(),
  };

  return { authRepository, jwtService, mockUser };
}

describe('GetCurrentUserUseCase', () => {
  it('should return current user from valid access token', async () => {
    const { authRepository, jwtService, mockUser } = createMocks();
    const useCase = new GetCurrentUserUseCase(mockDeps, authRepository, jwtService);

    const result = await useCase.execute({ accessToken: 'valid_access_token' });

    expect(result.id).toBe(mockUser.id);
    expect(result.username).toBe('testuser');
    expect(result.email).toBe('test@example.com');
    expect(result.displayName).toBe('Test User');
    expect(jwtService.verifyAccessToken).toHaveBeenCalledWith('valid_access_token');
  });

  it('should throw when no access token provided', async () => {
    const { authRepository, jwtService } = createMocks();
    const useCase = new GetCurrentUserUseCase(mockDeps, authRepository, jwtService);

    await expect(useCase.execute({ accessToken: '' })).rejects.toThrow();
  });

  it('should throw when user not found', async () => {
    const { authRepository, jwtService } = createMocks();
    authRepository.findUserById = vi.fn().mockResolvedValue(null);
    const useCase = new GetCurrentUserUseCase(mockDeps, authRepository, jwtService);

    await expect(
      useCase.execute({ accessToken: 'valid_token' })
    ).rejects.toThrow();
  });
});
