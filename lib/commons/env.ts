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

function createEnv(): Env {
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

function validateEnv(env: Env): void {
  const missing = requiredEnvVars.filter(
    (key) => !env[key] || env[key] === '',
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }
}

// Lazy proxy — only validates on first property access, not at import time
// This prevents build-time crashes when env vars aren't set
let _env: Env | null = null;
let _validated = false;

export const env = new Proxy({} as Env, {
  get(_target, prop: string | symbol) {
    if (!_env) {
      _env = createEnv();
    }

    if (!_validated && typeof prop === 'string' && prop !== 'NODE_ENV') {
      _validated = true;
      // Skip validation during Next.js build phase
      if (process.env.NEXT_PHASE !== 'phase-production-build') {
        const isTest = _env.NODE_ENV === 'test';
        if (!isTest) {
          validateEnv(_env);
        }
      }
    }

    return (_env as unknown as Record<string | symbol, unknown>)[prop];
  },
});
