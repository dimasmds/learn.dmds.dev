import { Pool } from 'pg';

const MIGRATION_SQL = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_users_username UNIQUE (username),
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT ck_users_username_format CHECK (username ~ '^[a-zA-Z][a-zA-Z0-9_-]{2,19}$')
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_auth_sessions_token UNIQUE (refresh_token_hash)
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
`;

export function createTestPool(): Pool {
  const connectionString = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/learn_dmds_test';
  return new Pool({ connectionString, max: 5 });
}

export async function migrateTestDatabase(pool: Pool): Promise<void> {
  await pool.query(MIGRATION_SQL);
}

export async function cleanDatabase(pool: Pool): Promise<void> {
  await pool.query('TRUNCATE TABLE auth_sessions, users CASCADE');
}

export async function dropTestTables(pool: Pool): Promise<void> {
  await pool.query('DROP TABLE IF EXISTS auth_sessions CASCADE');
  await pool.query('DROP TABLE IF EXISTS users CASCADE');
}
