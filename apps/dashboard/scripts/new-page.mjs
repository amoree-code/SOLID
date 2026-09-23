#!/usr/bin/env node
/**
 * Scaffolds a new dashboard page from the reference template in scripts/templates/page
 * (the app itself ships empty):
 * copies the folder, renames every file, and rewrites `Item`/`item`/`items` tokens
 * to the new entity — including the route path, the nested `$itemId` detail
 * folder, and the API endpoint / query-key root embedded in string literals.
 *
 * Usage: pnpm new:page <singular-kebab> <plural-kebab>
 * Example: pnpm new:page user users
 *
 * The page's tests live in its own `tests/` folder, so they are copied with it; its
 * Playwright spec (scripts/templates/page-e2e) is copied to e2e/<plural>.spec.ts.
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

const src = path.join(repoRoot, 'scripts/templates/page');
const dest = path.join(repoRoot, 'src/routes/_app', plural);
const e2eSrc = path.join(repoRoot, 'scripts/templates/page-e2e/example-page.spec.ts');
const e2eDest = path.join(repoRoot, 'e2e', `${plural}.spec.ts`);

for (const [from, to] of [
  [src, dest],
  [e2eSrc, e2eDest],
]) {
  if (!fs.existsSync(from)) {
    fail(`Template not found: ${path.relative(repoRoot, from)}`);
  }
  if (fs.existsSync(to)) {
    fail(`Target already exists: ${path.relative(repoRoot, to)}`);
  }
}

// shadcn/Radix components whose names end in "Item" but are not the entity.
const UI_ITEM_COMPONENTS =
  /\b(Select|DropdownMenu|DropdownMenuCheckbox|DropdownMenuRadio|SidebarMenu|ContextMenu|Menubar|Command|ToggleGroup|Accordion|NavigationMenu|Breadcrumb|Carousel)Item\b/g;

// Order matters:
//   1. park UI components like SelectItem so "Item" inside them is never renamed
//   2. capitalized "Item" (PascalCase compounds like ItemListResponse)
//   3. URL paths, route ids and query-key roots ("/example-resources", "example-page", "['items']")
//   4. "item" inside a path or string ('./item-form', 'create-item.service', "item-name")
//      becomes the kebab name, so imports match the file names from transformName
//   5. any other "item" (itemKeys, $itemId, a variable `item`) becomes camelCase — guarded
//      so the standalone word "items" (PaginatedResponse.items, Tailwind's items-center)
//      is never touched
function transformContent(content) {
  const parked = [];
  return content
    .replace(UI_ITEM_COMPONENTS, (match) => {
      parked.push(match);
      return `@@PARKED${parked.length - 1}@@`;
    })
    .replaceAll('Item', PascalSingular)
    .replaceAll('/example-resources', `/${plural}`)
    .replaceAll('example-page', plural)
    .replace(/\/items(?=[/'"`])/g, `/${plural}`)
    .replace(/\['items'\]/g, `['${plural}']`)
    .replace(/(?<=-)items\b/g, plural)
    .replace(/(?<=[/\-"'])item(?=[-.])/g, singular)
    .replace(/item(?!s\b)/g, camelSingular)
    .replace(/@@PARKED(\d+)@@/g, (_, index) => parked[Number(index)]);
}

// File names use the kebab singular ("item-form.tsx" → "user-profile-form.tsx");
// the route param folder keeps camelCase ("$itemId" → "$userProfileId") to match
// the param name used in code.
function transformName(name) {
  return name
    .replace(/^\$item/, `$${camelSingular}`)
    .replace(/(?<=^|-)item(?=[-.])/g, singular)
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
fs.writeFileSync(e2eDest, transformContent(fs.readFileSync(e2eSrc, 'utf8')));

const relativeTarget = path.relative(repoRoot, dest);

console.log(`Created ${relativeTarget}/`);
console.log(`Created ${path.relative(repoRoot, e2eDest)}`);
console.log('');
console.log('Next steps (not automated — small, reviewable edits):');
console.log('  1. Run `pnpm dev` (or `pnpm typecheck`) once so routeTree.gen.ts picks up the');
console.log('     new route files — the new page will not compile until then');
console.log('  2. Add a sidebar link to navItems in src/shared/components/layout/app-sidebar.tsx:');
console.log(`     { to: '/${plural}', label: '${PascalSingular}s', icon: IconListDetails },`);
console.log("     (import IconListDetails from '@tabler/icons-react')");
console.log(
  `  3. Set VITE_API_BASE_URL in .env — ${relativeTarget}/services/*.ts call /${plural} on it`,
);
console.log(`  4. Update ${relativeTarget}/schemas/${singular}.schema.ts to match the real fields`);
console.log(`  5. Review ${relativeTarget}/tests/ — assertions still describe the old fields`);
