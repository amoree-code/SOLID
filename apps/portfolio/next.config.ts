import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Produces a self-contained dist/ (server + only the deps it actually
  // needs) — what the Dockerfile's runtime stage copies, instead of the
  // whole node_modules tree.
  output: 'standalone',
  // This is a pnpm workspace — without this, Next's file tracing can guess
  // the wrong monorepo root and either miss dependencies or bundle too much.
  outputFileTracingRoot: path.join(import.meta.dirname, '../..'),
};

export default nextConfig;
