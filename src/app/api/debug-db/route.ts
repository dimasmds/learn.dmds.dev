import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const rawUrl = process.env.DATABASE_URL || 'NOT SET';
    
    // Mask password for security
    const maskedUrl = rawUrl.replace(/:([^@]+)@/, ':***@');
    
    // Parse to show components
    const match = rawUrl.match(/^postgresql?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/);
    
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: rawUrl,
      ssl: { rejectUnauthorized: false },
      max: 1,
    });

    const result = await pool.query('SELECT NOW() as now');
    await pool.end();

    return NextResponse.json({
      status: 'ok',
      maskedUrl,
      parsed: match ? {
        user: match[1],
        host: match[3],
        port: match[4],
        database: match[5],
      } : null,
      dbResult: result.rows[0],
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
