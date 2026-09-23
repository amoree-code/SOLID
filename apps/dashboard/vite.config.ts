/// <reference types="vitest/config" />
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ command, mode }) => {
  // The API URL is baked into the bundle at build time. Without it the app would
  // build fine and then fail in every user's browser — so fail the build instead.
  if (command === 'build' && !loadEnv(mode, process.cwd(), 'VITE_').VITE_API_BASE_URL) {
    throw new Error(
      'VITE_API_BASE_URL is required for a production build (set it in .env or the environment).',
    );
  }

  return {
    plugins: [
      // Route-tree generation only matters for dev/build; running it under Vitest
      // just re-scans every page file on each test run and logs noisy warnings.
      ...(mode === 'test'
        ? []
        : [
            tanstackRouter({
              target: 'react',
              autoCodeSplitting: true,
              routesDirectory: './src/routes',
              generatedRouteTree: './src/routeTree.gen.ts',
              // Matched against each file/folder *name* (not its path): a page's own
              // folders and types.ts are never treated as routes.
              routeFileIgnorePattern: '^(components|services|queries|schemas|tests|types\\.ts)$',
            }),
          ]),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/shared/testing/setup.ts'],
      css: true,
      // Unit/integration tests live next to the code they cover (a page's own
      // `tests/` folder, or `tests/` beside a shared module). `e2e/` holds
      // Playwright specs only, which Vitest must never pick up.
      include: ['src/**/*.test.{ts,tsx}'],
      // Tests never talk to a real server; this just satisfies env validation.
      env: { VITE_API_BASE_URL: 'http://localhost:3000/api' },
    },
  };
});
