import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json, including the ones
  // added by `nest g library`.
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    // Template sources are copied by `pnpm new:resource`, never run in place.
    exclude: ['**/node_modules/**', 'dist/**', 'scripts/templates/**'],
  },
});
