import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvariantError } from '@kopiketuk/framework';
import { RegisterUserUseCase } from '../RegisterUserUseCase';
import { createMockUseCaseDependencies } from '@/lib/tests/helpers/factories';

describe('RegisterUserUseCase', () => {
  const mockDeps = createMockUseCaseDependencies();
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new RegisterUserUseCase(mockDeps);
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

      expect(mockDeps.authRepository.createUser).toHaveBeenCalledTimes(1);
    });

    it('should hash the password before storing', async () => {
      await useCase.execute(validInput);

      expect(mockDeps.passwordService.hash).toHaveBeenCalledWith('SecurePass123');
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

      expect(mockDeps.authRepository.findUserByEmail).toHaveBeenCalledWith('john@example.com');
    });

    it('should throw InvariantError when email already exists', async () => {
      const deps = createMockUseCaseDependencies({
        authRepository: createMockUseCaseDependencies().authRepository,
      });
      (deps.authRepository.findUserByEmail as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'existing-id' });
      useCase = new RegisterUserUseCase(deps);

      await expect(useCase.execute(validInput))
        .rejects.toThrow('REGISTER_USER.EMAIL_ALREADY_EXISTS');
    });

    it('should check if username already exists before creating', async () => {
      await useCase.execute(validInput);

      expect(mockDeps.authRepository.findUserByUsername).toHaveBeenCalledWith('johndoe');
    });

    it('should throw InvariantError when username already exists', async () => {
      const deps = createMockUseCaseDependencies();
      (deps.authRepository.findUserByUsername as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'existing-id' });
      useCase = new RegisterUserUseCase(deps);

      await expect(useCase.execute(validInput))
        .rejects.toThrow('REGISTER_USER.USERNAME_ALREADY_EXISTS');
    });
  });

  describe('security', () => {
    it('should NOT log input payload (contains plain text password)', async () => {
      await useCase.execute(validInput);

      expect(mockDeps.logger.writeEvent).toHaveBeenCalled();
    });

    it('should not call createUser when validation fails', async () => {
      await expect(useCase.execute({ ...validInput, username: '' }))
        .rejects.toThrow();

      expect(mockDeps.authRepository.createUser).not.toHaveBeenCalled();
    });
  });
});
