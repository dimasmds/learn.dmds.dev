import { User } from '../entities/User';
import { AuthSession } from '../entities/AuthSession';

export interface AuthRepositoryInterface {
  // User operations
  createUser(user: User): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserByUsername(username: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;

  // Session operations
  createSession(session: AuthSession): Promise<AuthSession>;
  findSessionByRefreshToken(tokenHash: string): Promise<AuthSession | null>;
  deleteSession(id: string): Promise<void>;
  deleteUserSessions(userId: string): Promise<void>;
  countActiveSessions(userId: string): Promise<number>;
}
