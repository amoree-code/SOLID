#!/usr/bin/env node
/**
 * Scaffolds a new NestJS resource from the `example-resource` reference module:
 * copies src/modules/example-resource/ -> src/modules/<singular>/, renames every
 * file and identifier (classes, the @Controller route, the Prisma accessor and
 * table name), and appends a matching model + enum to prisma/schema.prisma.
 * The module's HTTP spec is copied too, so the new resource starts tested.
 *
 * Backend code only — it never generates frontend files, auth, or permissions.
 *
 * Usage: pnpm new:resource <singular-kebab> <plural-kebab>
 * Example: pnpm new:resource product products   ->  GET /products
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
const humanSingular = singular.replaceAll('-', ' ');
const snakePlural = plural.replaceAll('-', '_');

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const templateDir = path.join(repoRoot, 'src/modules/example-resource');
const targetDir = path.join(repoRoot, 'src/modules', singular);
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

// The reference names are distinctive multi-word tokens, so each form maps
// one-to-one and nothing generic (like the `items` field of a paginated
// response) can be caught by accident. Plural forms go first so the singular
// rule never sees them.
function transformContent(content) {
  return content
    .replaceAll('example-resources', plural)
    .replaceAll('example_resources', snakePlural)
    .replaceAll('example-resource', singular)
    .replaceAll('ExampleResource', PascalSingular)
    .replaceAll('exampleResource', camelSingular)
    .replaceAll('Example resource', humanSingular[0].toUpperCase() + humanSingular.slice(1));
}

function transformName(name) {
  return name.replaceAll('example-resource', singular);
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
// schema's own `model ExampleResource { ... }` / `enum ExampleResourceStatus { ... }` blocks ----
const schema = fs.readFileSync(schemaPath, 'utf8');
const modelMatch = schema.match(/model ExampleResource \{[\s\S]*?\n\}\n/);
const enumMatch = schema.match(/enum ExampleResourceStatus \{[\s\S]*?\n\}\n/);

if (!modelMatch || !enumMatch) {
  fail(
    'Could not find "model ExampleResource" / "enum ExampleResourceStatus" in prisma/schema.prisma to use as a template — has the reference schema been renamed or removed?',
  );
}

const newModel = transformContent(modelMatch[0]);
const newEnum = transformContent(enumMatch[0]);
fs.appendFileSync(schemaPath, `\n${newModel}\n${newEnum}`);

// Column alignment in the appended block was copied from ExampleResource's — almost
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
console.log('     defaults were copied from ExampleResource and may not fit.');
console.log('  2. REQUIRED to compile: pnpm db:generate, then register the module in');
console.log('     src/app.module.ts —');
console.log(
  `     import { ${PascalSingular}Module } from './modules/${singular}/${singular}.module.js';`,
);
console.log('     and add it to the imports array.');
console.log('  3. REQUIRED for the database: pnpm db:migrate (creates and applies the');
console.log('     migration for the new model).');
console.log(`  4. Update ${relativeTarget}/schemas/ to match the real fields, then the`);
console.log(`     copied ${singular}.controller.spec.ts assertions.`);
