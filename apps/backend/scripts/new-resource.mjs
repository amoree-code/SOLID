#!/usr/bin/env node
/**
 * Scaffolds a new NestJS resource from the `items` reference implementation:
 * copies src/items/ -> src/<plural>/, renames every file and identifier
 * (including the @Controller path, permission strings, and Prisma client
 * accessor), and appends a matching model + enum to prisma/schema.prisma.
 *
 * Usage: pnpm new:resource <singular-kebab> <plural-kebab>
 * Example: pnpm new:resource product products
 *
 * Deliberately does NOT touch app.module.ts or run a migration — wiring the
 * new module in and reviewing the generated Prisma model are small,
 * reviewable edits, not something a generator should do silently.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

function printUsage() {
  console.log('Usage: pnpm new:resource <singular-kebab> <plural-kebab>');
  console.log('Example: pnpm new:resource product products');
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
    fail(`${label} must be lowercase kebab-case (e.g. "product"), got "${value}".`);
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
const PascalPlural = toPascalCase(plural);
const camelPlural = toCamelCase(plural);

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const templateDir = path.join(repoRoot, 'src/items');
const targetDir = path.join(repoRoot, 'src', plural);
const schemaPath = path.join(repoRoot, 'prisma/schema.prisma');

if (!fs.existsSync(templateDir)) {
  fail(`Template not found: ${path.relative(repoRoot, templateDir)}`);
}

if (fs.existsSync(targetDir)) {
  fail(`Target already exists: ${path.relative(repoRoot, targetDir)}`);
}

if (!fs.existsSync(schemaPath)) {
  fail(`Prisma schema not found: ${path.relative(repoRoot, schemaPath)}`);
}

// Order matters, longest/most-specific match first, so nothing is left for a
// later, broader rule to corrupt:
//   1. "Items" (capitalized plural — ItemsController, ItemsService...)
//   2. "Item" (capitalized singular — everything "Items" didn't already consume)
//   3. "items" immediately before `.`, `'`, `"`, or a capital letter — the
//      plural appears in a file path ('./items.service.js'), a quoted
//      string ('items.read', @Controller('items'), @@map("items")), or a
//      camelCase prefix (itemsService) — never as the bare word "items",
//      which is the generic PaginatedResponse.items field and must stay
//      "items" for every resource.
//   4. "item" not immediately followed by a literal "s" — guards the
//      standalone word "items" a second time (defence in depth).
function transformContent(content) {
  return content
    .replaceAll('Items', PascalPlural)
    .replaceAll('Item', PascalSingular)
    .replace(/items(?=[.'"A-Z])/g, camelPlural)
    .replace(/item(?!s\b)/g, camelSingular);
}

function transformName(name) {
  return name.replace(/items/g, plural).replace(/item/g, singular);
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

copyRecursive(templateDir, targetDir);

// ---- Prisma: append a matching model + enum, extracted from the reference
// schema's own `model Item { ... }` / `enum ItemStatus { ... }` blocks ----
const schema = fs.readFileSync(schemaPath, 'utf8');
const modelMatch = schema.match(/model Item \{[\s\S]*?\n\}\n/);
const enumMatch = schema.match(/enum ItemStatus \{[\s\S]*?\n\}\n/);

if (!modelMatch || !enumMatch) {
  fail(
    'Could not find "model Item" / "enum ItemStatus" in prisma/schema.prisma to use as a template — has the reference schema been renamed or removed?',
  );
}

const newModel = transformContent(modelMatch[0]);
const newEnum = transformContent(enumMatch[0]);
fs.appendFileSync(schemaPath, `\n${newModel}\n${newEnum}`);

// Column alignment in the appended block was copied from Item's — almost
// never right once the names change length. `prisma format` re-aligns the
// whole file the same way `pnpm db:generate`/`db:migrate` already expect.
try {
  execFileSync('pnpm', ['exec', 'prisma', 'format'], { cwd: repoRoot, stdio: 'ignore' });
} catch {
  console.warn(
    '⚠ Could not run `prisma format` automatically — run it yourself to tidy alignment.',
  );
}

const relativeTarget = path.relative(repoRoot, targetDir);

console.log(`Created ${relativeTarget}/`);
console.log(
  `Appended model ${PascalSingular} + enum ${PascalSingular}Status to prisma/schema.prisma`,
);
console.log('');
console.log('Next steps (not automated — small, reviewable edits):');
console.log('  1. Review the appended model in prisma/schema.prisma — field types and');
console.log('     defaults were copied from Item and may not fit the new resource.');
console.log('  2. REQUIRED to compile: register the module in src/app.module.ts —');
console.log(`     import { ${PascalPlural}Module } from './${plural}/${plural}.module.js';`);
console.log(`     and add it to the imports array.`);
console.log('  3. REQUIRED for the database: pnpm db:migrate (creates and applies the');
console.log('     migration for the new model).');
console.log(`  4. Add "${plural}.*" permissions to whatever issues your JWTs (this`);
console.log(`     template has no central permission catalog — see the ${plural}.controller.ts`);
console.log('     @RequirePermission calls for the exact strings expected).');
console.log(`  5. Update src/${plural}/schemas/${singular}.schema.ts to match the real fields`);
console.log('     once you adjust the Prisma model.');
console.log(`  6. Add tests for src/${plural}/ — there is no existing items.*.spec.ts to`);
console.log(
  '     copy from yet; follow the pattern in src/common/pipes/zod-validation.pipe.spec.ts',
);
console.log('     and src/auth/guards/permissions.guard.spec.ts.');
