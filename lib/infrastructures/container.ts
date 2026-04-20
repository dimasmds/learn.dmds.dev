import type { ParameterOption } from 'instances-container';
import { createContainer } from 'instances-container';
import { Pool } from 'pg';

import { RegisterUserUseCase } from '../applications/usecases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../applications/usecases/auth/LoginUserUseCase';
import { LogoutUserUseCase } from '../applications/usecases/auth/LogoutUserUseCase';
import { RefreshTokenUseCase } from '../applications/usecases/auth/RefreshTokenUseCase';
import { GetCurrentUserUseCase } from '../applications/usecases/auth/GetCurrentUserUseCase';

import { GetUnitsUseCase } from '../applications/usecases/learning/GetUnitsUseCase';
import { GetUnitDetailUseCase } from '../applications/usecases/learning/GetUnitDetailUseCase';
import { GetLessonDetailUseCase } from '../applications/usecases/learning/GetLessonDetailUseCase';

import { GetUserProgressUseCase } from '../applications/usecases/progress/GetUserProgressUseCase';
import { UpdateProgressUseCase } from '../applications/usecases/progress/UpdateProgressUseCase';

import { JwtService } from './auth/JwtService';
import { BcryptPasswordService } from './auth/BcryptPasswordService';
import { PostgresAuthRepository } from './auth/PostgresAuthRepository';
import { PostgresLearningRepository } from './learning/PostgresLearningRepository';
import { PostgresProgressRepository } from './progress/PostgresProgressRepository';
import { serverlessDeps } from './serverless-deps';

const container = createContainer();

// ── Pool singleton ────────────────────────────────────────────────────
let _pool: Pool | null = null;

function getPool(): Pool {
  if (!_pool) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL is not set');
    _pool = new Pool({
      connectionString: dbUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 5,
    });
  }
  return _pool;
}

// ── Shared use case dependencies (DRY — Bijakcerdas pattern) ─────────
const useCaseDependencies: ParameterOption = {
  injectType: 'destructuring',
  dependencies: [
    { name: 'applicationEvent', concrete: serverlessDeps.applicationEvent },
    { name: 'logger', concrete: serverlessDeps.logger },
    { name: 'authRepository', internal: 'AuthRepository' },
    { name: 'passwordService', internal: 'PasswordService' },
    { name: 'jwtService', internal: 'JwtService' },
    { name: 'learningRepository', internal: 'LearningRepository' },
    { name: 'progressRepository', internal: 'ProgressRepository' },
  ],
};

// ── Register concrete instances ───────────────────────────────────────
container.register([
  { key: 'AuthRepository', Class: PostgresAuthRepository, parameter: { injectType: 'parameter', dependencies: [{ concrete: getPool() }] } },
  { key: 'LearningRepository', Class: PostgresLearningRepository, parameter: { injectType: 'parameter', dependencies: [{ concrete: getPool() }] } },
  { key: 'ProgressRepository', Class: PostgresProgressRepository, parameter: { injectType: 'parameter', dependencies: [{ concrete: getPool() }] } },
]);

container.register([
  { key: 'JwtService', Class: JwtService },
  { key: 'PasswordService', Class: BcryptPasswordService },
]);

// ── Use cases (shared ParameterOption = DRY) ──────────────────────────
container.register([
  { key: 'RegisterUserUseCase', Class: RegisterUserUseCase, parameter: useCaseDependencies },
  { key: 'LoginUserUseCase', Class: LoginUserUseCase, parameter: useCaseDependencies },
  { key: 'LogoutUserUseCase', Class: LogoutUserUseCase, parameter: useCaseDependencies },
  { key: 'RefreshTokenUseCase', Class: RefreshTokenUseCase, parameter: useCaseDependencies },
  { key: 'GetCurrentUserUseCase', Class: GetCurrentUserUseCase, parameter: useCaseDependencies },
  { key: 'GetUnitsUseCase', Class: GetUnitsUseCase, parameter: useCaseDependencies },
  { key: 'GetUnitDetailUseCase', Class: GetUnitDetailUseCase, parameter: useCaseDependencies },
  { key: 'GetLessonDetailUseCase', Class: GetLessonDetailUseCase, parameter: useCaseDependencies },
  { key: 'GetUserProgressUseCase', Class: GetUserProgressUseCase, parameter: useCaseDependencies },
  { key: 'UpdateProgressUseCase', Class: UpdateProgressUseCase, parameter: useCaseDependencies },
]);

export { container, getPool };
