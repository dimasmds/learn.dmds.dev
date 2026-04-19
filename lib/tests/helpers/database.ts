import { Pool, type PoolConfig } from 'pg';

/**
 * Database test context for integration tests
 * Manages database connection and cleanup for tests
 * Following Bijakcerdas pattern
 */
export class DatabaseTestContext {
  private _pool: Pool | null = null;

  get pool(): Pool {
    if (!this._pool) {
      throw new Error('DatabaseTestContext not initialized. Call setup() first.');
    }
    return this._pool;
  }

  async setup(): Promise<void> {
    const connectionString = process.env.DATABASE_URL_TEST
      || 'postgresql://postgres:postgres@localhost:5432/learn_dmds_test';

    const config: PoolConfig = {
      connectionString,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

    // SSL only for remote (Supabase)
    if (connectionString.includes('supabase')) {
      config.ssl = { rejectUnauthorized: false };
    }

    this._pool = new Pool(config);

    // Verify connection
    const client = await this._pool.connect();
    client.release();
  }

  async teardown(): Promise<void> {
    if (this._pool) {
      await this._pool.end();
      this._pool = null;
    }
  }

  async query(sql: string, params?: unknown[]): Promise<void> {
    await this._pool!.query(sql, params);
  }
}

export function createDatabaseTestContext(): DatabaseTestContext {
  return new DatabaseTestContext();
}
