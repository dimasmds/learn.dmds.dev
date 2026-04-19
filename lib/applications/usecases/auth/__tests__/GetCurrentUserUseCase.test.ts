import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthenticationError } from '@kopiketuk/framework';
import { GetCurrentUserUseCase } from '../GetCurrentUserUseCase';
import { User } from '@/lib/domains/auth/entities/User';
import { createMockUseCaseDependencies } from '@/lib/tests/helpers/factories';

describe('GetCurrentUserUseCase', () => {
  let useCase: GetCurrentUserUseCase;

  const mockUser = User.create({
    username: 'johndoe',
    email: 'john@example.com',
    passwordHash: '$2a$10$hashed',
    displayName: 'John Doe',
  });

  function createDeps(overrides: Record<string, any> = {}) {
    return createMockUseCaseDependencies({
      authRepository: overrides.authRepository,
      jwtService: overrides.jwtService,
    });
  }

  describe('happy path', () => {
    it('should return current user data with valid access token', async () => {
      const deps = createDeps();
      (deps.jwtService.verifyAccessToken as ReturnType<typeof vi.fn>).mockReturnValue({ userId: mockUser.id, username: 'johndoe' });
      (deps.authRepository.findUserById as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);
      useCase = new GetCurrentUserUseCase(deps);

      const result = await useCase.execute({ accessToken: 'valid-token' });

      expect(result.id).toBe(mockUser.id);
      expect(result.username).toBe('johndoe');
      expect(result.email).toBe('john@example.com');
      expect(result.displayName).toBe('John Doe');
    });
  });

  describe('authentication failures', () => {
    it('should throw AuthenticationError when access token is invalid', async () => {
      const deps = createDeps();
      (deps.jwtService.verifyAccessToken as ReturnType<typeof vi.fn>).mockReturnValue(null);
      useCase = new GetCurrentUserUseCase(deps);

      await expect(useCase.execute({ accessToken: 'invalid-token' }))
        .rejects.toThrow('GET_CURRENT_USER.INVALID_TOKEN');
    });

    it('should throw AuthenticationError when user not found', async () => {
      const deps = createDeps();
      (deps.jwtService.verifyAccessToken as ReturnType<typeof vi.fn>).mockReturnValue({ userId: 'deleted-user', username: 'gone' });
      (deps.authRepository.findUserById as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      useCase = new GetCurrentUserUseCase(deps);

      await expect(useCase.execute({ accessToken: 'valid-but-user-gone' }))
        .rejects.toThrow('GET_CURRENT_USER.USER_NOT_FOUND');
    });
  });
});
