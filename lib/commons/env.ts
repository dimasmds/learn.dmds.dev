interface Env {
  DATABASE_URL: string;
  DATABASE_URL_TEST: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  NEXT_PUBLIC_APP_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

const requiredEnvVars: (keyof Env)[] = [
  'DATABASE_URL',
  'DATABASE_URL_TEST',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
  'NEXT_PUBLIC_APP_URL',
];

function getEnv(): Env {
  const isTest = process.env.NODE_ENV === 'test';

  if (!isTest) {
    const missing = requiredEnvVars.filter(
      (key) => !process.env[key] || process.env[key] === ''
    );

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}`
      );
    }
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL ?? '',
    DATABASE_URL_TEST: process.env.DATABASE_URL_TEST ?? '',
    JWT_SECRET: process.env.JWT_SECRET ?? '',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? '',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? '',
    NODE_ENV: (process.env.NODE_ENV as Env['NODE_ENV']) ?? 'development',
  };
}

export const env = getEnv();
