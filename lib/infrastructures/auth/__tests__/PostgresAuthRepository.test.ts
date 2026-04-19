import { beforeAll, afterAll, afterEach, beforeEach, describe, it, expect } from 'vitest';
import { Pool } from 'pg';
import { PostgresAuthRepository } from '../PostgresAuthRepository';
import { User } from '../../../domains/auth/entities/User';
import { AuthSession } from '../../../domains/auth/entities/AuthSession';
import { createTestPool, migrateTestDatabase, cleanDatabase } from '../../../tests/helpers/database';

let pool: Pool;
let repository: PostgresAuthRepository;
let dbAvailable = false;

try {
  const testPool = createTestPool();
  await testPool.query('SELECT 1');
  await testPool.end();
  dbAvailable = true;
} catch {
  dbAvailable = false;
}

describe.skipIf(!dbAvailable)('PostgresAuthRepository', () => {
  beforeAll(async () => {
    pool = createTestPool();
    await migrateTestDatabase(pool);
    repository = new PostgresAuthRepository(pool);
  });

  afterEach(async () => {
    await cleanDatabase(pool);
  });

  afterAll(async () => {
    await pool.end();
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
  });

  describe('findUserByEmail', () => {
    it('should return null when user not found', async () => {
      const result = await repository.findUserByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });

    it('should return user when found', async () => {
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
    });

    it('should find user with normalized (lowercase) email', async () => {
      const user = User.create({
        username: 'casesensitive',
        email: 'Case@Example.COM',
        passwordHash: '$2a$10$hashedpassword',
        displayName: 'Case User',
      });

      await repository.createUser(user);
      const result = await repository.findUserByEmail('case@example.com');

      expect(result).not.toBeNull();
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
      it('should delete a session', async () => {
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
        await pool.query(
          `INSERT INTO auth_sessions (id, user_id, refresh_token_hash, expires_at, created_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            crypto.randomUUID(),
            testUser.id,
            'expired-hash',
            new Date(Date.now() - 1000),
            new Date(),
          ],
        );

        const count = await repository.countActiveSessions(testUser.id);
        expect(count).toBe(0);
      });
    });
  });
});
