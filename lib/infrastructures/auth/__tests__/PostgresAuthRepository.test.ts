import { afterAll, afterEach, beforeAll, beforeEach, describe, it, expect } from 'vitest';
import { PostgresAuthRepository } from '../PostgresAuthRepository';
import { User } from '../../../domains/auth/entities/User';
import { AuthSession } from '../../../domains/auth/entities/AuthSession';
import { createDatabaseTestContext, type DatabaseTestContext } from '../../../tests/helpers/database';

describe.sequential('PostgresAuthRepository', () => {
  const db = createDatabaseTestContext();
  let repository: PostgresAuthRepository;

  beforeAll(async () => {
    await db.setup();
    repository = new PostgresAuthRepository(db.pool);
  });

  afterEach(async () => {
    await db.query('DELETE FROM auth_sessions');
    await db.query('DELETE FROM users');
  });

  afterAll(async () => {
    await db.teardown();
  });

  describe('createUser', () => {
    it('should insert a user and return the same user', async () => {
      const user = User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: '$2a$10$hashedpassword',
        displayName: 'Test User',
      });

      const result = await repository.createUser(user);

      expect(result.id).toBe(user.id);
      expect(result.username).toBe('testuser');
      expect(result.email).toBe('test@example.com');
    });

    it('should persist user so it can be found by email', async () => {
      const user = User.create({
        username: 'findme',
        email: 'find@example.com',
        passwordHash: '$2a$10$hashedpassword',
        displayName: 'Find Me',
      });

      await repository.createUser(user);
      const found = await repository.findUserByEmail('find@example.com');

      expect(found).not.toBeNull();
      expect(found!.id).toBe(user.id);
      expect(found!.username).toBe('findme');
    });

    it('should reject duplicate email', async () => {
      const user1 = User.create({
        username: 'userone',
        email: 'same@example.com',
        passwordHash: '$2a$10$hash1',
        displayName: 'User One',
      });
      await repository.createUser(user1);

      const user2 = User.create({
        username: 'usertwo',
        email: 'same@example.com',
        passwordHash: '$2a$10$hash2',
        displayName: 'User Two',
      });

      await expect(repository.createUser(user2)).rejects.toThrow();
    });

    it('should reject duplicate username', async () => {
      const user1 = User.create({
        username: 'sameusername',
        email: 'first@example.com',
        passwordHash: '$2a$10$hash1',
        displayName: 'First',
      });
      await repository.createUser(user1);

      const user2 = User.create({
        username: 'sameusername',
        email: 'second@example.com',
        passwordHash: '$2a$10$hash2',
        displayName: 'Second',
      });

      await expect(repository.createUser(user2)).rejects.toThrow();
    });
  });

  describe('findUserByEmail', () => {
    it('should return null when user not found', async () => {
      const result = await repository.findUserByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });

    it('should return user with correct fields', async () => {
      const user = User.create({
        username: 'emailuser',
        email: 'email@example.com',
        passwordHash: '$2a$10$hashedpassword',
        displayName: 'Email User',
      });

      await repository.createUser(user);
      const result = await repository.findUserByEmail('email@example.com');

      expect(result).not.toBeNull();
      expect(result!.email).toBe('email@example.com');
      expect(result!.passwordHash).toBe('$2a$10$hashedpassword');
      expect(result!.displayName).toBe('Email User');
    });
  });

  describe('findUserByUsername', () => {
    it('should return null when username not found', async () => {
      const result = await repository.findUserByUsername('nonexistent');
      expect(result).toBeNull();
    });

    it('should return user by username', async () => {
      const user = User.create({
        username: 'uniqueuser',
        email: 'unique@example.com',
        passwordHash: '$2a$10$hashedpassword',
        displayName: 'Unique User',
      });

      await repository.createUser(user);
      const result = await repository.findUserByUsername('uniqueuser');

      expect(result).not.toBeNull();
      expect(result!.username).toBe('uniqueuser');
    });
  });

  describe('findUserById', () => {
    it('should return null when id not found', async () => {
      const result = await repository.findUserById('00000000-0000-0000-0000-000000000000');
      expect(result).toBeNull();
    });

    it('should return user by id', async () => {
      const user = User.create({
        username: 'iduser',
        email: 'id@example.com',
        passwordHash: '$2a$10$hashedpassword',
        displayName: 'ID User',
      });

      await repository.createUser(user);
      const result = await repository.findUserById(user.id);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(user.id);
    });
  });

  describe('session operations', () => {
    let testUser: User;

    beforeEach(async () => {
      testUser = User.create({
        username: 'sessionuser',
        email: 'session@example.com',
        passwordHash: '$2a$10$hashedpassword',
        displayName: 'Session User',
      });
      await repository.createUser(testUser);
    });

    describe('createSession', () => {
      it('should create a session and return it', async () => {
        const session = AuthSession.create({
          userId: testUser.id,
          refreshTokenHash: 'hash-of-refresh-token',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        const result = await repository.createSession(session);

        expect(result.id).toBe(session.id);
        expect(result.userId).toBe(testUser.id);
        expect(result.refreshTokenHash).toBe('hash-of-refresh-token');
      });
    });

    describe('findSessionByRefreshToken', () => {
      it('should return null when session not found', async () => {
        const result = await repository.findSessionByRefreshToken('nonexistent-hash');
        expect(result).toBeNull();
      });

      it('should find session by refresh token hash', async () => {
        const session = AuthSession.create({
          userId: testUser.id,
          refreshTokenHash: 'unique-hash-123',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        await repository.createSession(session);
        const result = await repository.findSessionByRefreshToken('unique-hash-123');

        expect(result).not.toBeNull();
        expect(result!.id).toBe(session.id);
        expect(result!.userId).toBe(testUser.id);
      });
    });

    describe('deleteSession', () => {
      it('should delete a specific session', async () => {
        const session = AuthSession.create({
          userId: testUser.id,
          refreshTokenHash: 'to-delete-hash',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        await repository.createSession(session);
        await repository.deleteSession(session.id);
        const result = await repository.findSessionByRefreshToken('to-delete-hash');

        expect(result).toBeNull();
      });

      it('should not delete other sessions', async () => {
        const session1 = AuthSession.create({
          userId: testUser.id,
          refreshTokenHash: 'keep-this-hash',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        const session2 = AuthSession.create({
          userId: testUser.id,
          refreshTokenHash: 'delete-this-hash',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        await repository.createSession(session1);
        await repository.createSession(session2);
        await repository.deleteSession(session2.id);

        expect(await repository.findSessionByRefreshToken('keep-this-hash')).not.toBeNull();
        expect(await repository.findSessionByRefreshToken('delete-this-hash')).toBeNull();
      });
    });

    describe('deleteUserSessions', () => {
      it('should delete all sessions for a user', async () => {
        const session1 = AuthSession.create({
          userId: testUser.id,
          refreshTokenHash: 'session-hash-1',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        const session2 = AuthSession.create({
          userId: testUser.id,
          refreshTokenHash: 'session-hash-2',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        await repository.createSession(session1);
        await repository.createSession(session2);
        await repository.deleteUserSessions(testUser.id);

        expect(await repository.findSessionByRefreshToken('session-hash-1')).toBeNull();
        expect(await repository.findSessionByRefreshToken('session-hash-2')).toBeNull();
      });
    });

    describe('countActiveSessions', () => {
      it('should return 0 when no sessions exist', async () => {
        const count = await repository.countActiveSessions(testUser.id);
        expect(count).toBe(0);
      });

      it('should count active sessions correctly', async () => {
        for (let i = 0; i < 3; i++) {
          const session = AuthSession.create({
            userId: testUser.id,
            refreshTokenHash: `count-hash-${i}`,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          });
          await repository.createSession(session);
        }

        const count = await repository.countActiveSessions(testUser.id);
        expect(count).toBe(3);
      });

      it('should not count expired sessions', async () => {
        await db.query(
          `INSERT INTO auth_sessions (id, user_id, refresh_token_hash, expires_at, created_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [
            crypto.randomUUID(),
            testUser.id,
            'expired-hash',
            new Date(Date.now() - 1000),
          ],
        );

        const count = await repository.countActiveSessions(testUser.id);
        expect(count).toBe(0);
      });
    });
  });
});
