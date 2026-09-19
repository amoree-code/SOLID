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
              '\\.(test|spec)\\.(ts|tsx)$|/(components|services|queries|schemas|tests)/|/(permissions|types)\\.ts$',
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
    exclude: ['node_modules/**', 'e2e/**'],
  },
}));
