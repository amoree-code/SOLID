#!/usr/bin/env node
/**
 * Proves the resource template still works: generates a throwaway resource,
 * regenerates the Prisma client with its model, typechecks, runs the
 * resource's own HTTP spec, then restores schema.prisma and removes it.
 * Runs in CI so a broken template fails there, not the day someone runs
 * `pnpm new:resource`. Needs no database.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaPath = path.join(root, 'prisma/schema.prisma');
const moduleDir = path.join(root, 'src/modules/template-check');
const originalSchema = fs.readFileSync(schemaPath, 'utf8');

function run(command, args) {
  execFileSync(command, args, { cwd: root, stdio: 'inherit' });
}

fs.rmSync(moduleDir, { recursive: true, force: true });
try {
  run('node', ['scripts/new-resource.mjs', 'template-check', 'template-checks']);
  run('pnpm', ['exec', 'prisma', 'generate']);
  run('pnpm', ['exec', 'tsc', '--noEmit', '-p', 'tsconfig.json']);
  run('pnpm', ['exec', 'vitest', 'run', 'src/modules/template-check']);
  console.log('\n✔ Resource template generates, typechecks and passes its tests.');
} finally {
  // Restore the schema first: nothing below may leave the throwaway model behind.
  fs.writeFileSync(schemaPath, originalSchema);
  fs.rmSync(moduleDir, { recursive: true, force: true });
  const modulesDir = path.join(root, 'src/modules');
  if (fs.existsSync(modulesDir) && fs.readdirSync(modulesDir).length === 0) {
    fs.rmdirSync(modulesDir); // only if this script created it; real resources stay
  }
  run('pnpm', ['exec', 'prisma', 'generate']);
}
