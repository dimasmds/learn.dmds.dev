import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvariantError, AuthenticationError } from '@kopiketuk/framework';
import { LoginUserUseCase } from '../LoginUserUseCase';
import { User } from '@/lib/domains/auth/entities/User';
import { createMockUseCaseDependencies } from '@/lib/tests/helpers/factories';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;

  const mockUser = User.create({
    username: 'johndoe',
    email: 'john@example.com',
    passwordHash: '$2a$10$hashedpassword',
    displayName: 'John Doe',
  });

  function createDeps(overrides: Record<string, any> = {}) {
    const deps = createMockUseCaseDependencies({
      authRepository: overrides.authRepository,
      passwordService: overrides.passwordService,
      jwtService: overrides.jwtService,
    });
    // Default: email lookup returns mockUser
    if (!overrides.authRepository) {
      (deps.authRepository.findUserByEmail as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);
    }
    return deps;
  }

  describe('happy path', () => {
    it('should login successfully and return tokens with user data', async () => {
      const deps = createDeps();
      useCase = new LoginUserUseCase(deps);
      const result = await useCase.execute({ email: 'john@example.com', password: 'SecurePass123' });

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(result.user.username).toBe('johndoe');
      expect(result.user.email).toBe('john@example.com');
    });

    it('should verify password against stored hash', async () => {
      const deps = createDeps();
      useCase = new LoginUserUseCase(deps);
      await useCase.execute({ email: 'john@example.com', password: 'SecurePass123' });

      expect(deps.passwordService.compare).toHaveBeenCalledWith('SecurePass123', mockUser.passwordHash);
    });

    it('should generate token pair', async () => {
      const deps = createDeps();
      useCase = new LoginUserUseCase(deps);
      await useCase.execute({ email: 'john@example.com', password: 'SecurePass123' });

      expect(deps.jwtService.generateTokenPair).toHaveBeenCalledWith({
        userId: mockUser.id,
        username: 'johndoe',
      });
    });

    it('should create a new session', async () => {
      const deps = createDeps();
      useCase = new LoginUserUseCase(deps);
      await useCase.execute({ email: 'john@example.com', password: 'SecurePass123' });

      expect(deps.authRepository.createSession).toHaveBeenCalledTimes(1);
    });

    it('should trim and lowercase email before lookup', async () => {
      const deps = createDeps();
      useCase = new LoginUserUseCase(deps);
      await useCase.execute({ email: '  JOHN@EXAMPLE.COM  ', password: 'SecurePass123' });

      expect(deps.authRepository.findUserByEmail).toHaveBeenCalledWith('john@example.com');
    });
  });

  describe('validation', () => {
    it('should throw InvariantError when email or password is missing', async () => {
      useCase = new LoginUserUseCase(createDeps());
      await expect(useCase.execute({ email: '', password: 'pass' }))
        .rejects.toThrow('LOGIN_USER.MISSING_CREDENTIALS');
    });

    it('should throw InvariantError when password is missing', async () => {
      useCase = new LoginUserUseCase(createDeps());
      await expect(useCase.execute({ email: 'john@example.com', password: '' }))
        .rejects.toThrow('LOGIN_USER.MISSING_CREDENTIALS');
    });
  });

  describe('authentication failures', () => {
    it('should throw AuthenticationError when user not found', async () => {
      const deps = createMockUseCaseDependencies();
      (deps.authRepository.findUserByEmail as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      useCase = new LoginUserUseCase(deps);

      await expect(useCase.execute({ email: 'noone@example.com', password: 'pass' }))
        .rejects.toThrow('LOGIN_USER.INVALID_CREDENTIALS');
    });

    it('should throw AuthenticationError when password is wrong', async () => {
      const deps = createDeps();
      (deps.passwordService.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false);
      useCase = new LoginUserUseCase(deps);

      await expect(useCase.execute({ email: 'john@example.com', password: 'wrongpass' }))
        .rejects.toThrow('LOGIN_USER.INVALID_CREDENTIALS');
    });

    it('should not create session when authentication fails', async () => {
      const deps = createMockUseCaseDependencies();
      (deps.authRepository.findUserByEmail as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      useCase = new LoginUserUseCase(deps);

      await expect(useCase.execute({ email: 'noone@example.com', password: 'pass' }))
        .rejects.toThrow();

      expect(deps.authRepository.createSession).not.toHaveBeenCalled();
    });
  });

  describe('session management', () => {
    it('should delete all sessions when user has 5+ active sessions', async () => {
      const deps = createDeps();
      (deps.authRepository.countActiveSessions as ReturnType<typeof vi.fn>).mockResolvedValue(5);
      useCase = new LoginUserUseCase(deps);

      await useCase.execute({ email: 'john@example.com', password: 'SecurePass123' });

      expect(deps.authRepository.deleteUserSessions).toHaveBeenCalledWith(mockUser.id);
    });

    it('should NOT delete sessions when user has fewer than 5 active sessions', async () => {
      const deps = createDeps();
      (deps.authRepository.countActiveSessions as ReturnType<typeof vi.fn>).mockResolvedValue(4);
      useCase = new LoginUserUseCase(deps);

      await useCase.execute({ email: 'john@example.com', password: 'SecurePass123' });

      expect(deps.authRepository.deleteUserSessions).not.toHaveBeenCalled();
    });
  });
});
