import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvariantError } from '@kopiketuk/framework';
import { RegisterUserUseCase } from '../RegisterUserUseCase';
import type { AuthRepositoryInterface } from '../../../../domains/auth/repositories/AuthRepositoryInterface';
import type { PasswordServiceInterface } from '../../../../domains/auth/services/AuthServiceInterface';
import type { User } from '../../../../domains/auth/entities/User';

function createMockAuthRepository(): AuthRepositoryInterface {
  return {
    createUser: vi.fn().mockResolvedValue(undefined),
    findUserByEmail: vi.fn().mockResolvedValue(null),
    findUserByUsername: vi.fn().mockResolvedValue(null),
    findUserById: vi.fn().mockResolvedValue(null),
    createSession: vi.fn(),
    findSessionByRefreshToken: vi.fn(),
    deleteSession: vi.fn(),
    deleteUserSessions: vi.fn(),
    countActiveSessions: vi.fn(),
  };
}

function createMockPasswordService(): PasswordServiceInterface {
  return {
    hash: vi.fn().mockResolvedValue('bcrypt_hashed_password'),
    compare: vi.fn().mockResolvedValue(true),
  };
}

function createMockUseCaseDependencies() {
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
  let mockDependencies: ReturnType<typeof createMockUseCaseDependencies>;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    mockRepository = createMockAuthRepository();
    mockPasswordService = createMockPasswordService();
    mockDependencies = createMockUseCaseDependencies();
    useCase = new RegisterUserUseCase(mockDependencies, mockRepository, mockPasswordService);
  });

  const validInput = {
    username: 'johndoe',
    email: 'john@example.com',
    password: 'SecurePass123',
    confirmPassword: 'SecurePass123',
  };

  it('should register a user successfully', async () => {
    const result = await useCase.execute(validInput);

    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('string');
    expect(result.username).toBe('johndoe');
    expect(result.email).toBe('john@example.com');
    expect(result.displayName).toBe('johndoe');
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it('should call createUser on the repository', async () => {
    await useCase.execute(validInput);

    expect(mockRepository.createUser).toHaveBeenCalledTimes(1);
    const savedUser = (mockRepository.createUser as ReturnType<typeof vi.fn>).mock.calls[0][0] as User;
    expect(savedUser.username).toBe('johndoe');
    expect(savedUser.email).toBe('john@example.com');
    expect(savedUser.passwordHash).toBe('bcrypt_hashed_password');
  });

  it('should check if email already exists before creating', async () => {
    await useCase.execute(validInput);

    expect(mockRepository.findUserByEmail).toHaveBeenCalledWith(
      'john@example.com',
    );
  });

  it('should check if username already exists before creating', async () => {
    await useCase.execute(validInput);

    expect(mockRepository.findUserByUsername).toHaveBeenCalledWith('johndoe');
  });

  it('should throw InvariantError when username is empty', async () => {
    await expect(
      useCase.execute({ ...validInput, username: '' }),
    ).rejects.toThrow(InvariantError);

    expect(mockRepository.createUser).not.toHaveBeenCalled();
  });

  it('should throw InvariantError when email is empty', async () => {
    await expect(
      useCase.execute({ ...validInput, email: '' }),
    ).rejects.toThrow(InvariantError);

    expect(mockRepository.createUser).not.toHaveBeenCalled();
  });

  it('should throw InvariantError when password is empty', async () => {
    await expect(
      useCase.execute({ ...validInput, password: '' }),
    ).rejects.toThrow(InvariantError);

    expect(mockRepository.createUser).not.toHaveBeenCalled();
  });

  it('should throw InvariantError when passwords do not match', async () => {
    await expect(
      useCase.execute({ ...validInput, confirmPassword: 'DifferentPass456' }),
    ).rejects.toThrow(InvariantError);

    try {
      await useCase.execute({
        ...validInput,
        confirmPassword: 'DifferentPass456',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(InvariantError);
      expect((error as InvariantError).message).toBe(
        'REGISTER_USER.PASSWORD_NOT_MATCH',
      );
    }
  });

  it('should throw InvariantError when email already exists', async () => {
    (
      mockRepository.findUserByEmail as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      id: 'existing-id',
      email: 'john@example.com',
    });

    await expect(useCase.execute(validInput)).rejects.toThrow(InvariantError);

    try {
      await useCase.execute(validInput);
    } catch (error) {
      expect((error as InvariantError).message).toBe(
        'REGISTER_USER.EMAIL_ALREADY_EXISTS',
      );
    }
  });

  it('should throw InvariantError when username already exists', async () => {
    (
      mockRepository.findUserByUsername as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      id: 'existing-id',
      username: 'johndoe',
    });

    await expect(useCase.execute(validInput)).rejects.toThrow(InvariantError);

    try {
      await useCase.execute(validInput);
    } catch (error) {
      expect((error as InvariantError).message).toBe(
        'REGISTER_USER.USERNAME_ALREADY_EXISTS',
      );
    }
  });

  it('should hash the password using bcrypt before storing', async () => {
    await useCase.execute(validInput);

    expect(mockPasswordService.hash).toHaveBeenCalledWith('SecurePass123');

    const savedUser = (mockRepository.createUser as ReturnType<typeof vi.fn>).mock.calls[0][0] as User;
    expect(savedUser.passwordHash).not.toBe(validInput.password);
    expect(savedUser.passwordHash).toBe('bcrypt_hashed_password');
  });

  it('should NOT log input payload (contains plain text password)', async () => {
    await useCase.execute(validInput);

    const loggedEvent = (mockDependencies.logger.writeEvent as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(loggedEvent.payload.input).toBe('**restricted**');
    expect(JSON.stringify(loggedEvent)).not.toContain('SecurePass123');
  });
});
