#!/usr/bin/env node
/**
 * One command from a fresh clone to a running database:
 *   1. create .env from .env.example (only if .env does not exist yet)
 *   2. start the local Postgres from docker-compose.yml and wait until it is healthy
 *   3. generate the Prisma client and apply any migrations
 *
 * Usage: pnpm quickstart   (then: pnpm dev)
 *
 * Point DATABASE_URL at your own Postgres and pass --no-docker to skip step 2.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skipDocker = process.argv.includes('--no-docker');

function step(message) {
  console.log(`\n▸ ${message}`);
}

function run(command, args) {
  execFileSync(command, args, { cwd: root, stdio: 'inherit' });
}

function fail(message) {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}

step('Environment');
const envPath = path.join(root, '.env');
if (fs.existsSync(envPath)) {
  console.log('  .env already exists — left untouched.');
} else {
  fs.copyFileSync(path.join(root, '.env.example'), envPath);
  console.log('  Created .env from .env.example.');
}

if (!skipDocker) {
  step('Postgres (docker compose)');
  const docker = spawnSync('docker', ['compose', 'version'], { stdio: 'ignore' });
  if (docker.status !== 0) {
    fail(
      'Docker with the compose plugin was not found. Install Docker, or point DATABASE_URL in .env at your own Postgres and run: pnpm quickstart --no-docker',
    );
  }
  try {
    run('docker', ['compose', 'up', '-d', '--wait', 'postgres']);
  } catch {
    fail(
      'Postgres did not start. If port 5432 is already taken, set POSTGRES_PORT in .env (and the port in DATABASE_URL) to a free one, then run this again.',
    );
  }
}

step('Database schema');
run('pnpm', ['exec', 'prisma', 'generate']);
run('pnpm', ['exec', 'prisma', 'migrate', 'deploy']);

console.log('\n✔ Ready. Start the API with: pnpm dev');
