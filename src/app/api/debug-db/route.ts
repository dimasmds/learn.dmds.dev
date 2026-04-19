import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Direct test: parse DATABASE_URL manually and connect
    const rawUrl = process.env.DATABASE_URL || '';
    
    if (!rawUrl) {
      return NextResponse.json({ error: 'DATABASE_URL not set' });
    }

    const match = rawUrl.match(/^postgresql?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/);
    if (!match) {
      return NextResponse.json({ error: 'Cannot parse DATABASE_URL', rawUrl: rawUrl.substring(0, 30) + '...' });
    }

    const [, user, password, host, port, database] = match;
    const isPooler = host.includes('pooler.supabase.com');
    const userRef = user.includes('.') ? user.split('.')[1] : null;

    const config = {
      host: isPooler && userRef ? `db.${userRef}.supabase.co` : host,
      port: isPooler ? 5432 : parseInt(port, 10),
      database,
      user: isPooler ? 'postgres' : user,
      password: '***',
      ssl: true,
    };

    // Actually test the connection
    const { Pool } = await import('pg');
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: password,
      ssl: { rejectUnauthorized: false },
      max: 1,
    });

    const result = await pool.query('SELECT NOW() as now');
    await pool.end();

    return NextResponse.json({
      status: 'ok',
      config,
      result: result.rows[0],
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined,
    });
  }
}
