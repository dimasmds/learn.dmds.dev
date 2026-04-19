import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthenticationError } from '@kopiketuk/framework';
import { LogoutUserUseCase } from '../LogoutUserUseCase';
import { AuthSession } from '@/lib/domains/auth/entities/AuthSession';
import { createMockUseCaseDependencies } from '@/lib/tests/helpers/factories';

describe('LogoutUserUseCase', () => {
  let useCase: LogoutUserUseCase;

  const mockSession = AuthSession.create({
    userId: 'user-1',
    refreshTokenHash: 'hashed-token',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  function createDeps(overrides: Record<string, any> = {}) {
    const deps = createMockUseCaseDependencies({
      authRepository: overrides.authRepository,
      jwtService: overrides.jwtService,
    });
    // Default: session found
    if (!overrides.authRepository) {
      (deps.authRepository.findSessionByRefreshToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockSession);
    }
    return deps;
  }

  describe('happy path', () => {
    it('should logout successfully by deleting session', async () => {
      const deps = createDeps();
      useCase = new LogoutUserUseCase(deps);
      const result = await useCase.execute({ refreshToken: 'some-refresh-token' });

      expect(result.success).toBe(true);
      expect(deps.authRepository.deleteSession).toHaveBeenCalledWith(mockSession.id);
    });
  });

  describe('validation', () => {
    it('should throw AuthenticationError when no refresh token provided', async () => {
      useCase = new LogoutUserUseCase(createDeps());
      await expect(useCase.execute({ refreshToken: '' }))
        .rejects.toThrow('LOGOUT_USER.NO_REFRESH_TOKEN');
    });
  });

  describe('authentication failures', () => {
    it('should throw AuthenticationError when session not found', async () => {
      const deps = createMockUseCaseDependencies();
      (deps.authRepository.findSessionByRefreshToken as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      useCase = new LogoutUserUseCase(deps);

      await expect(useCase.execute({ refreshToken: 'invalid-token' }))
        .rejects.toThrow('LOGOUT_USER.SESSION_NOT_FOUND');
    });
  });
});
