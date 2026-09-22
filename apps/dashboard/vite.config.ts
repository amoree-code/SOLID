/// <reference types="vitest/config" />
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
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
            routeFileIgnorePattern:
              '/(components|services|queries|schemas)/|/(permissions|types)\\.ts$',
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
    // All unit/integration tests live under e2e/unit/ (mirroring src/), not
    // colocated with the code — e2e/flows/ holds Playwright specs instead,
    // which this project must never pick up.
    include: ['e2e/unit/**/*.{test,spec}.{ts,tsx}'],
  },
}));
