import { Pool } from 'pg';
import type { AuthRepositoryInterface } from '../../domains/auth/repositories/AuthRepositoryInterface';
import { User, type UserProps } from '../../domains/auth/entities/User';
import { AuthSession, type AuthSessionProps } from '../../domains/auth/entities/AuthSession';

interface UserRow {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  display_name: string;
  created_at: Date;
  updated_at: Date;
}

interface SessionRow {
  id: string;
  user_id: string;
  refresh_token_hash: string;
  expires_at: Date;
  created_at: Date;
}

interface CountRow {
  count: string;
}

export class PostgresAuthRepository implements AuthRepositoryInterface {
  constructor(private pool: Pool) {}

  async createUser(user: User): Promise<User> {
    await this.pool.query(
      `INSERT INTO users (id, username, email, password_hash, display_name, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [user.id, user.username, user.email, user.passwordHash, user.displayName, user.createdAt, user.updatedAt],
    );
    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query<UserRow>(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToUser(result.rows[0]);
  }

  async findUserByUsername(username: string): Promise<User | null> {
    const result = await this.pool.query<UserRow>(
      'SELECT * FROM users WHERE username = $1',
      [username],
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToUser(result.rows[0]);
  }

  async findUserById(id: string): Promise<User | null> {
    const result = await this.pool.query<UserRow>(
      'SELECT * FROM users WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToUser(result.rows[0]);
  }

  async createSession(session: AuthSession): Promise<AuthSession> {
    await this.pool.query(
      `INSERT INTO auth_sessions (id, user_id, refresh_token_hash, expires_at, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [session.id, session.userId, session.refreshTokenHash, session.expiresAt, session.createdAt],
    );
    return session;
  }

  async findSessionByRefreshToken(tokenHash: string): Promise<AuthSession | null> {
    const result = await this.pool.query<SessionRow>(
      'SELECT * FROM auth_sessions WHERE refresh_token_hash = $1',
      [tokenHash],
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToSession(result.rows[0]);
  }

  async deleteSession(id: string): Promise<void> {
    await this.pool.query('DELETE FROM auth_sessions WHERE id = $1', [id]);
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await this.pool.query('DELETE FROM auth_sessions WHERE user_id = $1', [userId]);
  }

  async countActiveSessions(userId: string): Promise<number> {
    const result = await this.pool.query<CountRow>(
      'SELECT COUNT(*) as count FROM auth_sessions WHERE user_id = $1 AND expires_at > NOW()',
      [userId],
    );
    return parseInt(result.rows[0].count, 10);
  }

  private mapRowToUser(row: UserRow): User {
    return User.reconstitute(row.id, {
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash,
      displayName: row.display_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  private mapRowToSession(row: SessionRow): AuthSession {
    return AuthSession.reconstitute(row.id, {
      userId: row.user_id,
      refreshTokenHash: row.refresh_token_hash,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
    });
  }
}
