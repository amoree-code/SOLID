#!/usr/bin/env node
/**
 * Scaffolds a new dashboard page from the `example-page` reference implementation:
 * copies the folder, renames every file, and rewrites `Item`/`item`/`items` tokens
 * to the new entity — including the route path, the nested `$itemId` detail
 * folder, and the API endpoint / query-key root embedded in string literals.
 *
 * Usage: pnpm new:page <singular-kebab> <plural-kebab>
 * Example: pnpm new:page user users
 *
 * The page's tests live in its own `tests/` folder, so they are copied with it.
 * Deliberately does NOT touch shared/ files (the sidebar nav) — that is a small,
 * reviewable edit the generator prints as a next step instead of guessing how
 * to splice it into existing code.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

function printUsage() {
  console.log('Usage: pnpm new:page <singular-kebab> <plural-kebab>');
  console.log('Example: pnpm new:page user users');
}

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  printUsage();
  process.exit(0);
}

const [singular, plural] = args;

if (!singular || !plural) {
  printUsage();
  fail('both a singular and a plural name are required.');
}

const kebabPattern = /^[a-z][a-z0-9-]*$/;

for (const [value, label] of [
  [singular, 'singular name'],
  [plural, 'plural name'],
]) {
  if (!kebabPattern.test(value)) {
    fail(`${label} must be lowercase kebab-case (e.g. "user"), got "${value}".`);
  }
}

if (singular === plural) {
  fail('singular and plural names must be different (got the same value twice).');
}

function toPascalCase(kebab) {
  return kebab
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('');
}

function toCamelCase(kebab) {
  const pascal = toPascalCase(kebab);
  return pascal[0].toLowerCase() + pascal.slice(1);
}

const PascalSingular = toPascalCase(singular);
const camelSingular = toCamelCase(singular);

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const src = path.join(repoRoot, 'src/routes/_app/example-page');
const dest = path.join(repoRoot, 'src/routes/_app', plural);

if (!fs.existsSync(src)) {
  fail(`Template not found: ${path.relative(repoRoot, src)}`);
}
if (fs.existsSync(dest)) {
  fail(`Target already exists: ${path.relative(repoRoot, dest)}`);
}

// Order matters: capitalized "Item" first (handles PascalCase compounds like
// ItemListResponse), then the URL-path and query-key-root string literals
// (distinguishable by their surrounding "/" or quotes from a bare `.items`
// property access), then lowercase "item" — guarded so it never touches the
// standalone word "items", which is the generic PaginatedResponse.items field
// and must stay "items" for every entity.
function transformContent(content) {
  return content
    .replaceAll('Item', PascalSingular)
    .replaceAll('/example-resources', `/${plural}`)
    .replaceAll('example-page', plural)
    .replace(/\/items(?=[/'"`])/g, `/${plural}`)
    .replace(/\['items'\]/g, `['${plural}']`)
    .replace(/(?<=-)items\b/g, plural)
    .replace(/item(?!s\b)/g, camelSingular);
}

function transformName(name) {
  return name
    .replaceAll('Item', PascalSingular)
    .replace(/item(?!s\b)/g, camelSingular)
    .replace(/items/g, plural)
    .replace(/^example-page$/, plural);
}

function copyRecursive(srcPath, destPath) {
  const stat = fs.statSync(srcPath);

  if (stat.isDirectory()) {
    fs.mkdirSync(destPath, { recursive: true });
    for (const entry of fs.readdirSync(srcPath)) {
      copyRecursive(path.join(srcPath, entry), path.join(destPath, transformName(entry)));
    }
    return;
  }

  const content = fs.readFileSync(srcPath, 'utf8');
  fs.writeFileSync(destPath, transformContent(content));
}

copyRecursive(src, dest);

const relativeTarget = path.relative(repoRoot, dest);

console.log(`Created ${relativeTarget}/`);
console.log('');
console.log('Next steps (not automated — small, reviewable edits):');
console.log('  1. Run `pnpm dev` (or `pnpm typecheck`) once so routeTree.gen.ts picks up the');
console.log('     new route files — the new page will not compile until then');
console.log('  2. Add a sidebar link in src/shared/components/layout/app-sidebar.tsx');
console.log(
  `  3. Check ${relativeTarget}/services/*.ts — they call /${plural} on VITE_API_BASE_URL`,
);
console.log(`  4. Update ${relativeTarget}/schemas/${singular}.schema.ts to match the real fields`);
console.log(`  5. Review ${relativeTarget}/tests/ — assertions still describe the old fields`);
