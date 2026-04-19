import { Pool } from 'pg';

import { env } from '../../commons/env';

const pool = new Pool({
  connectionString:
    env.NODE_ENV === 'test' ? env.DATABASE_URL_TEST : env.DATABASE_URL,
});

export default pool;
