#!/usr/bin/env node
/**
 * Proves the page template still works: generates a throwaway page from it,
 * typechecks the whole app with it in place, runs the page's own tests, then
 * removes it again. Runs in CI so a broken template fails there, not the day
 * someone runs `pnpm new:page`.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pageDir = path.join(root, 'src/routes/_app/template-checks');
const e2eSpec = path.join(root, 'e2e/template-checks.spec.ts');

function run(command, args) {
  execFileSync(command, args, { cwd: root, stdio: 'inherit' });
}

function cleanUp() {
  fs.rmSync(pageDir, { recursive: true, force: true });
  fs.rmSync(e2eSpec, { force: true });
}

cleanUp();
try {
  run('node', ['scripts/new-page.mjs', 'template-check', 'template-checks']);
  run('pnpm', ['exec', 'tsr', 'generate']);
  run('pnpm', ['exec', 'tsc', '-b', '--noEmit']);
  run('pnpm', ['exec', 'vitest', 'run', 'src/routes/_app/template-checks']);
  console.log('\n✔ Page template generates, typechecks and passes its tests.');
} finally {
  cleanUp();
  run('pnpm', ['exec', 'tsr', 'generate']);
}
