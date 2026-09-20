# SOLID Dashboard Template

A reusable, route-first frontend template for internal dashboards: TypeScript strict mode,
TanStack Router/Query/Table, colocated page ownership, typed permissions, and multi-locale
(English / Arabic / Kurdish Sorani / Kurdish Kurmanji) RTL support out of the box.

## Stack

| Layer | Choice |
|---|---|
| Build | Vite |
| Routing | TanStack Router (file-based, code-split) |
| Server state | TanStack Query |
| Tables | TanStack Table |
| Forms | React Hook Form + Zod |
| HTTP | Axios (single shared client) |
| UI | Tailwind CSS + shadcn/ui-style primitives (Radix Slot, CVA) |
| Lint/format | Biome |
| Unit/integration tests | Vitest + Testing Library |
| E2E tests | Playwright |
| Dead code / bundle budget | Knip / Size Limit |
| Git hooks | Lefthook |

## Create a new page

```bash
pnpm new:page user users
```

Copies `example-page/`, renames every file and identifier to the new entity (including the
API endpoint and query-key root embedded in string literals), and prints the small set of
manual steps left (adding a permission group, a sidebar link, translation keys — see
"Adding a page" below). It deliberately never touches `shared/` files itself; those are
reviewable, one-line edits, not something a script should guess at.

## Getting started

```bash
pnpm install
cp .env.example .env   # point VITE_API_BASE_URL at your backend
pnpm dev
```

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Typecheck + production build |
| `pnpm typecheck` | `tsc -b --noEmit` |
| `pnpm lint` / `pnpm lint:ci` | Biome, with/without auto-fix |
| `pnpm test` / `pnpm test:watch` | Vitest |
| `pnpm knip` | Dead code / unused dependency check |
| `pnpm size` | Bundle size budget check |
| `pnpm e2e` | Playwright critical-flow suite (needs `pnpm build && pnpm preview`, or let Playwright start it) |
| `pnpm verify` | The full CI gate, in order: typecheck → lint → test → build → knip → size → e2e |

`pnpm verify` is what CI should run. Fix commands (`lint`, `format`) are kept separate from
their read-only CI counterparts (`lint:ci`) so a gate never silently mutates the working tree.

## Project structure

```text
src/
├── app/           # bootstrap: providers, router wiring, env config, global styles
├── routes/        # file-based routes — each page owns its full vertical slice
│   ├── _auth/     # pathless layout: login, verify (unauthenticated only)
│   └── _dashboard/# pathless layout: authenticated shell + pages (e.g. example-page)
└── shared/        # code promoted here only once ≥2 pages need it (see below)
e2e/               # Playwright — user journeys, not page-specific (see Testing)
scripts/           # new-page.mjs — the `pnpm new:page` generator
```

Every route directory follows the same shape:

```text
routes/_dashboard/example-page/
├── index.tsx              # list route: validates search params, checks permissions, loads data
├── $itemId/                # detail route — its OWN directory (see below), not a bare file
│   ├── route.tsx
│   ├── components/          # detail-only UI (e.g. ItemDetails)
│   └── tests/
├── components/              # list-page UI, plus anything both routes share (e.g. ItemForm)
├── services/                # HTTP calls only — no hooks, no UI, no toasts
├── queries/                  # query keys, query options, mutations
├── schemas/                  # Zod schemas (entity shape, URL search, forms)
├── tests/                    # Vitest + Testing Library (list-page tests)
├── permissions.ts            # the page's slice of the shared permission map
└── types.ts                  # page-local types
```

**Why `$itemId/` is a directory, not `$itemId.tsx`:** TanStack Router supports "directory
routes" — a route file can be `$itemId/route.tsx` instead of `$itemId.tsx`, with sibling
`components/`/`tests/` folders that the router ignores (see `routeFileIgnorePattern` in
`vite.config.ts`). That gives the detail page its own isolated `components/`/`tests/`
without duplicating `services/`, `queries/`, `schemas/`, `types.ts`, and `permissions.ts` —
list and detail are the same SOLID *unit of change* (the same entity, the same endpoints,
the same permission group), so sharing those specific files isn't premature sharing, it's
avoiding a fork of the same contract. If a detail page ever needs its own service or query
that the list page doesn't, add it under `$itemId/` directly the same way.

**`example-page` is the canonical reference implementation.** When starting a real feature,
run `pnpm new:page <singular> <plural>` (see above) instead of copying it by hand.

### Adding a page

1. Run `pnpm new:page <singular> <plural>` (e.g. `pnpm new:page user users`).
2. Run `pnpm dev` (or `pnpm build`) once — the router plugin must regenerate
   `routeTree.gen.ts` before the new routes exist for TypeScript.
3. Add a `<plural>` permission group to `shared/permissions/permission-map.ts` (the generated
   page references it immediately, so this is required for the build to type-check — that's
   intentional: a missing permission group fails loudly instead of silently borrowing the
   wrong one).
4. Add a navigation entry in `shared/components/layout/dashboard-sidebar.tsx`.
5. Add translation keys to `shared/i18n/locales/*/navigation.json` (and any page-specific copy).
6. Update `schemas/<singular>.schema.ts` to match the real backend fields, and point
   `services/*.ts` at the real endpoints.
7. Review the copied tests — their assertions still describe the old entity's fields.

### Removing a page

Delete its route directory. Nothing outside it should reference its internals — if something
does, that's a sign it was promoted to `shared` too early.

### Shared-folder rule

A module moves to `shared/` only when **all** of these are true: used by ≥2 real pages, has
no page-specific business knowledge, has a stable contract, sharing it removes real
duplication, and its name describes one responsibility. `helpers.ts` / `utils.ts` grab-bags
are not allowed — see `shared/utils/cn.ts` for the kind of name we do want.

## State ownership

| State | Owner |
|---|---|
| Server data | TanStack Query |
| Filters / pagination / sorting | TanStack Router search params (Zod-validated) |
| Form values | React Hook Form |
| Simple local UI | `useState` |
| Theme | `ThemeProvider` |
| Locale + direction | `LocaleProvider` |
| Session / current user | TanStack Query, read synchronously via `getSessionUser(queryClient)` in route guards |
| Permissions | Derived from the session user |

There is deliberately no global client-state library (no Zustand/Redux). If you're reaching
for one, first check whether the state actually belongs in the URL or in Query.

## Backend responses: validated, not assumed

`httpClient.get<T>(...)` is only a compile-time cast — it proves nothing about what the
backend actually returned. Every page service instead parses the raw response through a Zod
schema before it reaches a page:

- `schemas/<entity>.schema.ts` describes the entity as the backend really sends it. A
  renamed or missing field fails loudly in the service, not silently as `undefined` three
  components later.
- `shared/services/response-envelope.ts` normalizes the handful of common list-response
  shapes backends use for pagination — `{ items, total, page, pageSize }`, `{ data, meta }`,
  `{ results, count }`, or a raw array — into the one canonical `PaginatedResponse<T>` every
  page and every shared table/pagination component actually works with.

If your backend's envelope doesn't match any of those, add the shape to
`paginatedEnvelopeSchema` in that file — once, for every page — rather than teaching each
page's service to guess its own shape.

## Auth, sessions, and permissions

- `shared/auth/session-storage.ts` is the **only** place that touches token storage. Swap its
  internals (e.g. to an in-memory-only strategy once the backend supports cookie refresh)
  without touching any component.
- `shared/services/http-client.ts` attaches the access token, and on a `401` funnels all
  concurrent requests through a single shared refresh promise — no duplicate refresh calls,
  no infinite loops.
- `shared/permissions/permission-map.ts` defines named, typed capabilities (`items.read`, not
  a CRUD letter or a raw role string). Enforce them at the route (`requirePermission` in
  `beforeLoad`) and at the component (`<PermissionGuard permission={...}>`).
- **The backend remains authoritative.** Hiding a button or blocking a route client-side is a
  UX nicety, not a security boundary.

**What's dynamic vs. what's static, on purpose:**

| | Source | Why |
|---|---|---|
| The permissions a *specific user* has (`user.permissions: string[]`) | 100% dynamic — comes from `GET /auth/me` | Grant/revoke access from the backend with zero frontend deploys. |
| The *catalog* of permission names (`permission-map.ts`) | Static, in code | Typed capability names (`permissions.items.read`) instead of raw strings — autocomplete, and a typo fails at compile time instead of silently denying access at runtime. This is the literal spec: *"Permissions use typed, descriptive capability names."* |

If your backend's permission catalog itself changes without a frontend deploy (e.g. an
admin UI defines new capability names at runtime), that's a different, fully-dynamic model —
`Permission` would become `string` and you lose the compile-time typo check. Don't make that
trade unless you actually have that requirement.

## Internationalization

Locales live in `shared/i18n/locales/<locale>/<namespace>.json` (`common`, `auth`,
`navigation`). `LocaleProvider` keeps `<html lang>` / `<html dir>` in sync, and
`translation.service.ts` warns in dev when a non-default locale is missing a key the default
locale has. Supported locales: `en` (LTR), `ar` (RTL), `ckb` — Kurdish Sorani (RTL), `ku` —
Kurdish Kurmanji (LTR).

## SOLID, applied

| Principle | Where |
|---|---|
| **S**ingle responsibility | Route = navigation/guards, service = HTTP, query = cache policy, component = rendering. See `example-page`. |
| **O**pen/closed | `shared/components/data-table/data-table.tsx` takes `columns`/`data`/`empty` — new pages configure it, they don't modify it. |
| **L**iskov substitution | `sessionStorage`'s shape must stay substitutable if the storage strategy changes later. |
| **I**nterface segregation | Components take only the props they need (e.g. `itemId`/`itemName`, not the whole entity). |
| **D**ependency inversion | Pages depend on `httpClient`, never construct their own Axios instance. |

## Testing

Two kinds of tests live in two different places, on purpose — they're not interchangeable:

| | Where | Why there |
|---|---|---|
| **Vitest + Testing Library** (unit/integration) | Colocated: `<page>/tests/`, `<page>/$id/tests/`, or right beside a `shared/` file (e.g. `can.test.ts`) | Tests a single piece — a schema, a permission check, one component — in isolation. Deleting a page deletes its tests with it; nothing is left behind to fail for a page that no longer exists. This is what "every page owns its tests" means literally. |
| **Playwright** (E2E) | One central `e2e/` folder, organized by user *journey* | A real flow crosses multiple pages/routes in one browser session (`login` → `items` → `logout`), so it doesn't belong to any single page's folder. Discovered automatically — anything under `e2e/` runs with `pnpm e2e`; `vite.config.ts` explicitly excludes that folder from `pnpm test` so the two runners never pick up each other's files. |

`pnpm new:page` copies the reference page's colocated tests as a starting template — their
assertions still describe the old entity until you update them (step 7 above).

`e2e/auth.spec.ts` covers what's meaningful without a real backend: auth redirects,
route-permission denial, and form validation. Extend it per-flow once a real backend is
wired up (login success, CRUD on a real page, logout, language/RTL switching).

A few exports are intentionally kept even though nothing in this template currently calls
them — they're part of the shared kit's public surface for whoever builds the next page:
`CardDescription`/`CardFooter` (full Card API), `health.service.ts`/`upload.service.ts`
(infra stubs), and the extra test helpers in `shared/testing/`. These are listed explicitly
in `knip.json`'s `ignore`, not swept under a blanket exclusion.
