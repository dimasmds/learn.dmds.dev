import {
  createContainer,
  asClass,
  asFunction,
  asValue,
  InjectionMode,
  AwilixContainer,
} from 'awilix';

import { Pool } from 'pg';
import { JwtService } from './auth/JwtService';
import { BcryptPasswordService } from './auth/BcryptPasswordService';
import { PostgresAuthRepository } from './auth/PostgresAuthRepository';
import { serverlessDeps } from './serverless-deps';

import { RegisterUserUseCase } from '../applications/usecases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../applications/usecases/auth/LoginUserUseCase';
import { LogoutUserUseCase } from '../applications/usecases/auth/LogoutUserUseCase';
import { RefreshTokenUseCase } from '../applications/usecases/auth/RefreshTokenUseCase';
import { GetCurrentUserUseCase } from '../applications/usecases/auth/GetCurrentUserUseCase';

export interface Cradle {
  jwtService: JwtService;
  passwordService: BcryptPasswordService;
  authRepository: PostgresAuthRepository;
  registerUserUseCase: RegisterUserUseCase;
  loginUserUseCase: LoginUserUseCase;
  logoutUserUseCase: LogoutUserUseCase;
  refreshTokenUseCase: RefreshTokenUseCase;
  getCurrentUserUseCase: GetCurrentUserUseCase;
}

const container: AwilixContainer<Cradle> = createContainer<Cradle>({
  injectionMode: InjectionMode.CLASSIC,
});

let _pool: Pool | null = null;

function buildDatabaseConfig() {
  const rawUrl = process.env.DATABASE_URL || '';
  if (!rawUrl) return null;

  // Supabase pooler port 6543 (transaction mode) doesn't support
  // all operations needed for auth. Use direct connection port 5432 instead.
  const match = rawUrl.match(/^postgresql?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/);
  if (match) {
    const [, user, password, host, _port, database] = match;
    // Pooler host: aws-0-<region>.pooler.supabase.com → extract ref from user (postgres.<ref>)
    // Direct host: db.<ref>.supabase.co
    const isPooler = host.includes('pooler.supabase.com');
    const userRef = user.includes('.') ? user.split('.')[1] : null;
    return {
      host: isPooler && userRef ? `db.${userRef}.supabase.co` : host,
      port: isPooler ? 5432 : parseInt(_port, 10),
      database,
      user: isPooler ? 'postgres' : user, // direct connection uses 'postgres', not 'postgres.<ref>'
      password,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  }

  // Fallback: use connectionString directly
  return { connectionString: rawUrl, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false };
}

function getPool(): Pool {
  if (!_pool) {
    const config = buildDatabaseConfig();
    if (!config) throw new Error('DATABASE_URL is not set');
    _pool = new Pool({
      ...config,
      max: 5,
    });
  }
  return _pool;
}

export function register(): AwilixContainer<Cradle> {
  const deps = serverlessDeps;

  container.register({
    jwtService: asClass(JwtService).singleton(),
    passwordService: asClass(BcryptPasswordService).singleton(),
    authRepository: asFunction(() => {
      return new PostgresAuthRepository(getPool());
    }).singleton(),

    registerUserUseCase: asFunction(() => {
      return new RegisterUserUseCase(
        { applicationEvent: deps.applicationEvent, logger: deps.logger },
        container.cradle.authRepository,
        container.cradle.passwordService,
      );
    }).singleton(),

    loginUserUseCase: asFunction(() => {
      return new LoginUserUseCase(
        { applicationEvent: deps.applicationEvent, logger: deps.logger },
        container.cradle.authRepository,
        container.cradle.passwordService,
        container.cradle.jwtService,
      );
    }).singleton(),

    logoutUserUseCase: asFunction(() => {
      return new LogoutUserUseCase(
        { applicationEvent: deps.applicationEvent, logger: deps.logger },
        container.cradle.authRepository,
        container.cradle.jwtService,
      );
    }).singleton(),

    refreshTokenUseCase: asFunction(() => {
      return new RefreshTokenUseCase(
        { applicationEvent: deps.applicationEvent, logger: deps.logger },
        container.cradle.authRepository,
        container.cradle.jwtService,
      );
    }).singleton(),

    getCurrentUserUseCase: asFunction(() => {
      return new GetCurrentUserUseCase(
        { applicationEvent: deps.applicationEvent, logger: deps.logger },
        container.cradle.authRepository,
        container.cradle.jwtService,
      );
    }).singleton(),
  });

  return container;
}

export default container;
