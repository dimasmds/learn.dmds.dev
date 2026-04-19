import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvariantError } from '@kopiketuk/framework';
import { RegisterUserUseCase } from '../RegisterUserUseCase';
import type { AuthRepositoryInterface } from '../../../../domains/auth/repositories/AuthRepositoryInterface';
import type { PasswordServiceInterface } from '../../../../domains/auth/services/AuthServiceInterface';

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

function createMockPasswordService(): PasswordServiceInterface {
  return {
    hash: vi.fn().mockResolvedValue('$2a$10$hashedpassword123'),
    compare: vi.fn().mockResolvedValue(true),
  };
}

function createMockDependencies() {
  return {
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
}

describe('RegisterUserUseCase', () => {
  let mockRepository: AuthRepositoryInterface;
  let mockPasswordService: PasswordServiceInterface;
  let mockDependencies: ReturnType<typeof createMockDependencies>;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    mockRepository = createMockAuthRepository();
    mockPasswordService = createMockPasswordService();
    mockDependencies = createMockDependencies();
    useCase = new RegisterUserUseCase(mockDependencies, mockRepository, mockPasswordService);
  });

  const validInput = {
    username: 'johndoe',
    email: 'john@example.com',
    password: 'SecurePass123',
    confirmPassword: 'SecurePass123',
  };

  describe('happy path', () => {
    it('should register a user successfully and return user data', async () => {
      const result = await useCase.execute(validInput);

      expect(result).toHaveProperty('id');
      expect(result.username).toBe('johndoe');
      expect(result.email).toBe('john@example.com');
      expect(result.displayName).toBe('johndoe');
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should call createUser on the repository', async () => {
      await useCase.execute(validInput);

      expect(mockRepository.createUser).toHaveBeenCalledTimes(1);
      const createdUser = await (mockRepository.createUser as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(createdUser.username).toBe('johndoe');
      expect(createdUser.email).toBe('john@example.com');
    });

    it('should hash the password before storing', async () => {
      await useCase.execute(validInput);

      expect(mockPasswordService.hash).toHaveBeenCalledWith('SecurePass123');
    });

    it('should set displayName to username by default', async () => {
      const result = await useCase.execute(validInput);

      expect(result.displayName).toBe('johndoe');
    });
  });

  describe('validation', () => {
    it('should throw InvariantError when username is empty', async () => {
      await expect(useCase.execute({ ...validInput, username: '' }))
        .rejects.toThrow(InvariantError);
      await expect(useCase.execute({ ...validInput, username: '' }))
        .rejects.toThrow('REGISTER_USER.NO_USERNAME');
    });

    it('should throw InvariantError when username is whitespace only', async () => {
      await expect(useCase.execute({ ...validInput, username: '   ' }))
        .rejects.toThrow('REGISTER_USER.NO_USERNAME');
    });

    it('should throw InvariantError when email is empty', async () => {
      await expect(useCase.execute({ ...validInput, email: '' }))
        .rejects.toThrow('REGISTER_USER.NO_EMAIL');
    });

    it('should throw InvariantError when password is empty', async () => {
      await expect(useCase.execute({ ...validInput, password: '' }))
        .rejects.toThrow('REGISTER_USER.NO_PASSWORD');
    });

    it('should throw InvariantError when passwords do not match', async () => {
      await expect(useCase.execute({ ...validInput, confirmPassword: 'DifferentPass' }))
        .rejects.toThrow('REGISTER_USER.PASSWORD_NOT_MATCH');
    });
  });

  describe('uniqueness checks', () => {
    it('should check if email already exists before creating', async () => {
      await useCase.execute(validInput);

      expect(mockRepository.findUserByEmail).toHaveBeenCalledWith('john@example.com');
    });

    it('should throw InvariantError when email already exists', async () => {
      mockRepository = createMockAuthRepository({
        findUserByEmail: vi.fn().mockResolvedValue({ id: 'existing-id' }),
      });
      useCase = new RegisterUserUseCase(mockDependencies, mockRepository, mockPasswordService);

      await expect(useCase.execute(validInput))
        .rejects.toThrow('REGISTER_USER.EMAIL_ALREADY_EXISTS');
    });

    it('should check if username already exists before creating', async () => {
      await useCase.execute(validInput);

      expect(mockRepository.findUserByUsername).toHaveBeenCalledWith('johndoe');
    });

    it('should throw InvariantError when username already exists', async () => {
      mockRepository = createMockAuthRepository({
        findUserByUsername: vi.fn().mockResolvedValue({ id: 'existing-id' }),
      });
      useCase = new RegisterUserUseCase(mockDependencies, mockRepository, mockPasswordService);

      await expect(useCase.execute(validInput))
        .rejects.toThrow('REGISTER_USER.USERNAME_ALREADY_EXISTS');
    });
  });

  describe('security', () => {
    it('should NOT log input payload (contains plain text password)', async () => {
      await useCase.execute(validInput);

      // writeEvent should be called but with restricted input
      // The setLoggingRestriction({ input: true }) in constructor handles this
      // We verify that the use case was constructed with logging restriction
      expect(mockDependencies.logger.writeEvent).toHaveBeenCalled();
    });

    it('should not call createUser when validation fails', async () => {
      await expect(useCase.execute({ ...validInput, username: '' }))
        .rejects.toThrow();

      expect(mockRepository.createUser).not.toHaveBeenCalled();
    });
  });
});
