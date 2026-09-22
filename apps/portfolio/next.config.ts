import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Produces a self-contained dist/ (server + only the deps it actually
  // needs) — what the Dockerfile's runtime stage copies, instead of the
  // whole node_modules tree.
  output: 'standalone',
};

export default nextConfig;
