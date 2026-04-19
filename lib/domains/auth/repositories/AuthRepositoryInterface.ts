import { User } from '../entities/User';

export interface AuthRepositoryInterface {
  createUser(user: User): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserByUsername(username: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
}
