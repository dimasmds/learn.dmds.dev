import { describe, it, expect } from 'vitest';
import { InvariantError } from '@kopiketuk/framework';
import { User } from '../User';

describe('User Entity', () => {
  const validPayload = {
    username: 'johndoe',
    email: 'john@example.com',
    passwordHash: 'hashed_password_123',
    displayName: 'John Doe',
  };

  describe('create', () => {
    it('should create a valid User entity', () => {
      const user = User.create(validPayload);

      expect(user.id).toBeDefined();
      expect(typeof user.id).toBe('string');
      expect(user.id.length).toBeGreaterThan(0);
      expect(user.username).toBe('johndoe');
      expect(user.email).toBe('john@example.com');
      expect(user.passwordHash).toBe('hashed_password_123');
      expect(user.displayName).toBe('John Doe');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should lowercase and trim email', () => {
      const user = User.create({
        ...validPayload,
        email: '  John@Example.COM  ',
      });

      expect(user.email).toBe('john@example.com');
    });

    it('should trim username and displayName', () => {
      const user = User.create({
        ...validPayload,
        username: '  johndoe  ',
        displayName: '  John Doe  ',
      });

      expect(user.username).toBe('johndoe');
      expect(user.displayName).toBe('John Doe');
    });

    it('should set createdAt and updatedAt to the same time on creation', () => {
      const user = User.create(validPayload);

      expect(user.createdAt.getTime()).toBe(user.updatedAt.getTime());
    });

    it('should throw InvariantError when username is empty', () => {
      expect(() =>
        User.create({ ...validPayload, username: '' }),
      ).toThrow(InvariantError);
    });

    it('should throw InvariantError when username is whitespace only', () => {
      expect(() =>
        User.create({ ...validPayload, username: '   ' }),
      ).toThrow(InvariantError);
    });

    it('should throw InvariantError when email is empty', () => {
      expect(() =>
        User.create({ ...validPayload, email: '' }),
      ).toThrow(InvariantError);
    });

    it('should throw InvariantError when email format is invalid', () => {
      expect(() =>
        User.create({ ...validPayload, email: 'not-an-email' }),
      ).toThrow(InvariantError);
    });

    it('should throw InvariantError when passwordHash is empty', () => {
      expect(() =>
        User.create({ ...validPayload, passwordHash: '' }),
      ).toThrow(InvariantError);
    });

    it('should throw InvariantError when displayName is empty', () => {
      expect(() =>
        User.create({ ...validPayload, displayName: '' }),
      ).toThrow(InvariantError);
    });

    it('should throw InvariantError with correct message for empty username', () => {
      try {
        User.create({ ...validPayload, username: '' });
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect((error as InvariantError).message).toBe(
          'REGISTER_USER.USERNAME_EMPTY',
        );
      }
    });
  });

  describe('updateProfile', () => {
    it('should return a new User instance with updated displayName', () => {
      const user = User.create(validPayload);
      const updated = user.updateProfile({ displayName: 'Jane Doe' });

      expect(updated).not.toBe(user);
      expect(updated.id).toBe(user.id);
      expect(updated.username).toBe(user.username);
      expect(updated.email).toBe(user.email);
      expect(updated.passwordHash).toBe(user.passwordHash);
      expect(updated.displayName).toBe('Jane Doe');
    });

    it('should update updatedAt timestamp', () => {
      const user = User.create(validPayload);

      // Small delay to ensure different timestamp
      const originalUpdatedAt = user.updatedAt;

      const updated = user.updateProfile({ displayName: 'New Name' });

      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('should preserve original user immutability', () => {
      const user = User.create(validPayload);
      const originalName = user.displayName;

      user.updateProfile({ displayName: 'Changed Name' });

      expect(user.displayName).toBe(originalName);
    });

    it('should throw InvariantError when displayName is empty', () => {
      const user = User.create(validPayload);

      expect(() => user.updateProfile({ displayName: '' })).toThrow(
        InvariantError,
      );
    });

    it('should throw InvariantError when displayName is whitespace only', () => {
      const user = User.create(validPayload);

      expect(() => user.updateProfile({ displayName: '   ' })).toThrow(
        InvariantError,
      );
    });
  });

  describe('equals', () => {
    it('should return true for same id', () => {
      const user = User.create(validPayload);

      // Same entity reference should be equal
      expect(user.equals(user)).toBe(true);
    });

    it('should return false for null', () => {
      const user = User.create(validPayload);
      expect(user.equals(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      const user = User.create(validPayload);
      expect(user.equals(undefined)).toBe(false);
    });

    it('should return false for different users', () => {
      const user1 = User.create(validPayload);
      const user2 = User.create({
        ...validPayload,
        username: 'janedoe',
        email: 'jane@example.com',
      });

      expect(user1.equals(user2)).toBe(false);
    });
  });
});
