import {
  createContainer,
  asClass,
  asFunction,
  asValue,
  InjectionMode,
  AwilixContainer,
} from 'awilix';

import {
  ApplicationEventImpl,
  WinstonLoggerImpl,
} from '@kopiketuk/framework';

import pool from './database/pool';
import { JwtService } from './auth/JwtService';
import { BcryptPasswordService } from './auth/BcryptPasswordService';
import { PostgresAuthRepository } from './auth/PostgresAuthRepository';

import { RegisterUserUseCase } from '../applications/usecases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../applications/usecases/auth/LoginUserUseCase';
import { LogoutUserUseCase } from '../applications/usecases/auth/LogoutUserUseCase';
import { RefreshTokenUseCase } from '../applications/usecases/auth/RefreshTokenUseCase';
import { GetCurrentUserUseCase } from '../applications/usecases/auth/GetCurrentUserUseCase';

export interface Cradle {
  // Database
  pool: typeof pool;

  // Framework infrastructures
  applicationEvent: ApplicationEventImpl;
  logger: WinstonLoggerImpl;

  // Auth services
  jwtService: JwtService;
  passwordService: BcryptPasswordService;

  // Auth repositories
  authRepository: PostgresAuthRepository;

  // Auth use cases
  registerUserUseCase: RegisterUserUseCase;
  loginUserUseCase: LoginUserUseCase;
  logoutUserUseCase: LogoutUserUseCase;
  refreshTokenUseCase: RefreshTokenUseCase;
  getCurrentUserUseCase: GetCurrentUserUseCase;
}

const container: AwilixContainer<Cradle> = createContainer<Cradle>({
  injectionMode: InjectionMode.PROXY,
});

export function register(): AwilixContainer<Cradle> {
  // Infrastructure
  container.register({
    pool: asValue(pool),

    // Framework
    applicationEvent: asClass(ApplicationEventImpl).singleton(),
    logger: asClass(WinstonLoggerImpl).singleton(),

    // Auth services
    jwtService: asClass(JwtService).singleton(),
    passwordService: asClass(BcryptPasswordService).singleton(),

    // Auth repositories
    authRepository: asClass(PostgresAuthRepository).singleton(),
  });

  // Use cases (need explicit dependency injection)
  container.register({
    registerUserUseCase: asFunction((cradle) => {
      return new RegisterUserUseCase(
        { applicationEvent: cradle.applicationEvent, logger: cradle.logger },
        cradle.authRepository,
        cradle.passwordService,
      );
    }).singleton(),

    loginUserUseCase: asFunction((cradle) => {
      return new LoginUserUseCase(
        { applicationEvent: cradle.applicationEvent, logger: cradle.logger },
        cradle.authRepository,
        cradle.passwordService,
        cradle.jwtService,
      );
    }).singleton(),

    logoutUserUseCase: asFunction((cradle) => {
      return new LogoutUserUseCase(
        { applicationEvent: cradle.applicationEvent, logger: cradle.logger },
        cradle.authRepository,
        cradle.jwtService,
      );
    }).singleton(),

    refreshTokenUseCase: asFunction((cradle) => {
      return new RefreshTokenUseCase(
        { applicationEvent: cradle.applicationEvent, logger: cradle.logger },
        cradle.authRepository,
        cradle.jwtService,
      );
    }).singleton(),

    getCurrentUserUseCase: asFunction((cradle) => {
      return new GetCurrentUserUseCase(
        { applicationEvent: cradle.applicationEvent, logger: cradle.logger },
        cradle.authRepository,
        cradle.jwtService,
      );
    }).singleton(),
  });

  return container;
}

export default container;
