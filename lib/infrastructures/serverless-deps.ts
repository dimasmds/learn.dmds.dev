/**
 * Lightweight use case dependencies for serverless (Vercel).
 * Avoids heavy framework deps (WinstonLogger, ApplicationEvent) 
 * that need Node.js-specific features not available in serverless.
 */

export interface ServerlessUseCaseDependencies {
  applicationEvent: {
    raise: () => Promise<void>;
    subscribe: () => void;
  };
  logger: {
    writeError: (error: unknown) => Promise<void>;
    writeClientError: (error: unknown) => Promise<void>;
    writeEvent: (event: unknown) => Promise<void>;
  };
}

export const serverlessDeps: ServerlessUseCaseDependencies = {
  applicationEvent: {
    raise: async () => {},
    subscribe: () => {},
  },
  logger: {
    writeError: async (error: unknown) => {
      console.error('[ERROR]', error);
    },
    writeClientError: async (error: unknown) => {
      console.warn('[CLIENT_ERROR]', error);
    },
    writeEvent: async (event: unknown) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[EVENT]', JSON.stringify(event));
      }
    },
  },
};
