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
 * Deliberately does NOT touch shared/ files (permission map, sidebar nav,
 * locale files) — those are small, reviewable edits the generator prints as
 * next steps instead of guessing how to splice them into existing code.
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

// The route folder and its tests live in separate trees (see README > Testing):
// unit tests are centralized under e2e/unit/, mirroring src/, not colocated.
const copies = [
  {
    src: path.join(repoRoot, 'src/routes/_dashboard/example-page'),
    dest: path.join(repoRoot, 'src/routes/_dashboard', plural),
  },
  {
    src: path.join(repoRoot, 'e2e/unit/routes/_dashboard/example-page'),
    dest: path.join(repoRoot, 'e2e/unit/routes/_dashboard', plural),
  },
];

for (const { src, dest } of copies) {
  if (!fs.existsSync(src)) {
    fail(`Template not found: ${path.relative(repoRoot, src)}`);
  }
  if (fs.existsSync(dest)) {
    fail(`Target already exists: ${path.relative(repoRoot, dest)}`);
  }
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
    .replaceAll('example-page', plural)
    .replaceAll('permissions.items', `permissions.${plural}`)
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

for (const { src, dest } of copies) {
  copyRecursive(src, dest);
}

const relativeTarget = path.relative(repoRoot, copies[0].dest);
const relativeTestTarget = path.relative(repoRoot, copies[1].dest);

console.log(`Created ${relativeTarget}/`);
console.log(`Created ${relativeTestTarget}/`);
console.log('');
console.log('Next steps (not automated — small, reviewable edits):');
console.log('  1. REQUIRED to compile: run `pnpm dev` (or `pnpm build`) once so the router');
console.log(`     plugin picks up the new route files and regenerates routeTree.gen.ts`);
console.log(
  `  2. REQUIRED to compile: add a "${plural}" group to src/shared/permissions/permission-map.ts`,
);
console.log('  3. Add a sidebar link in src/shared/components/layout/dashboard-sidebar.tsx');
console.log(`  4. Add nav.${camelSingular}... keys to src/shared/i18n/locales/*/navigation.json`);
console.log(`  5. Point ${relativeTarget}/services/*.ts at the real backend contract`);
console.log(`  6. Update ${relativeTarget}/schemas/${singular}.schema.ts to match real fields`);
console.log(`  7. Review the copied tests in ${relativeTestTarget}/ — assertions still describe`);
console.log('     the old fields');
