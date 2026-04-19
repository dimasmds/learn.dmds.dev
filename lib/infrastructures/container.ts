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

import pool from './database/pool.js';

export interface Cradle {
  // Database
  pool: typeof pool;

  // Framework infrastructures
  applicationEvent: ApplicationEventImpl;
  logger: WinstonLoggerImpl;

  // Repositories (will be added in M2-M4)
  // Services (will be added in M2-M4)
  // Use cases (will be added in M2-M4)
}

const container: AwilixContainer<Cradle> = createContainer<Cradle>({
  injectionMode: InjectionMode.PROXY,
});

export function register(): AwilixContainer<Cradle> {
  // Infrastructure
  container.register({
    pool: asValue(pool),
    applicationEvent: asClass(ApplicationEventImpl).singleton(),
    logger: asClass(WinstonLoggerImpl).singleton(),
  });

  // Repositories — placeholder, will be filled in M2-M4

  // Services — placeholder, will be filled in M2-M4

  // Use cases — placeholder, will be filled in M2-M4

  return container;
}

export default container;
