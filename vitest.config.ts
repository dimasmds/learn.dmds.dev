import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['lib/**', 'features/**', 'components/**', 'hooks/**', 'stores/**'],
      thresholds: {
        'lib/domains/**': { branches: 90, functions: 90, lines: 90, statements: 90 },
        'lib/applications/**': { branches: 85, functions: 85, lines: 85, statements: 85 },
        'lib/presentations/**': { branches: 75, functions: 75, lines: 75, statements: 75 },
        'lib/infrastructures/**': { branches: 80, functions: 80, lines: 80, statements: 80 },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@lib': path.resolve(__dirname, './lib'),
      '@features': path.resolve(__dirname, './features'),
      '@components': path.resolve(__dirname, './components'),
      '@hooks': path.resolve(__dirname, './hooks'),
      '@stores': path.resolve(__dirname, './stores'),
      '@content': path.resolve(__dirname, './content'),
    },
  },
});
