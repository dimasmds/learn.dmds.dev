import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthenticationError } from '@kopiketuk/framework';
import { RefreshTokenUseCase } from '../RefreshTokenUseCase';
import { AuthSession } from '@/lib/domains/auth/entities/AuthSession';
import { createMockUseCaseDependencies } from '@/lib/tests/helpers/factories';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;

  const mockSession = AuthSession.create({
    userId: 'user-1',
    refreshTokenHash: 'hashed-old-refresh',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  function createDeps(overrides: Record<string, any> = {}) {
    return createMockUseCaseDependencies({
      authRepository: overrides.authRepository,
      jwtService: overrides.jwtService,
    });
  }

  describe('happy path', () => {
    it('should rotate tokens and return new pair', async () => {
      const deps = createDeps();
      (deps.authRepository.findSessionByRefreshToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockSession);
      (deps.jwtService.verifyRefreshToken as ReturnType<typeof vi.fn>).mockReturnValue({ userId: 'user-1', username: 'johndoe' });
      (deps.jwtService.generateTokenPair as ReturnType<typeof vi.fn>).mockReturnValue({
        accessToken: 'new-access', refreshToken: 'new-refresh',
      });
      useCase = new RefreshTokenUseCase(deps);

      const result = await useCase.execute({ refreshToken: 'old-refresh-token' });

      expect(result.accessToken).toBe('new-access');
      expect(result.refreshToken).toBe('new-refresh');
      expect(deps.authRepository.deleteSession).toHaveBeenCalledWith(mockSession.id);
      expect(deps.authRepository.createSession).toHaveBeenCalledTimes(1);
    });
  });

  describe('authentication failures', () => {
    it('should throw AuthenticationError when session not found', async () => {
      const deps = createMockUseCaseDependencies();
      (deps.authRepository.findSessionByRefreshToken as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      useCase = new RefreshTokenUseCase(deps);

      await expect(useCase.execute({ refreshToken: 'invalid' }))
        .rejects.toThrow('REFRESH_TOKEN.SESSION_NOT_FOUND');
    });

    it('should throw AuthenticationError when session expired', async () => {
      // Create valid session then override expiresAt to simulate expiry
      const expiredSession = AuthSession.create({
        userId: 'user-1',
        refreshTokenHash: 'hashed',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      Object.defineProperty(expiredSession, 'expiresAt', { value: new Date(Date.now() - 1000) });
      const deps = createMockUseCaseDependencies();
      (deps.authRepository.findSessionByRefreshToken as ReturnType<typeof vi.fn>).mockResolvedValue(expiredSession);
      useCase = new RefreshTokenUseCase(deps);

      await expect(useCase.execute({ refreshToken: 'expired-token' }))
        .rejects.toThrow('REFRESH_TOKEN.SESSION_EXPIRED');
    });

    it('should throw AuthenticationError when refresh token invalid', async () => {
      const deps = createMockUseCaseDependencies();
      (deps.authRepository.findSessionByRefreshToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockSession);
      (deps.jwtService.verifyRefreshToken as ReturnType<typeof vi.fn>).mockReturnValue(null);
      useCase = new RefreshTokenUseCase(deps);

      await expect(useCase.execute({ refreshToken: 'tampered-token' }))
        .rejects.toThrow('REFRESH_TOKEN.INVALID_TOKEN');
    });
  });
});
