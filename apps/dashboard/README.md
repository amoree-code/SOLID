# SOLID Dashboard Template

A reusable, route-first frontend template for internal dashboards: TypeScript strict mode,
TanStack Router/Query/Table, colocated page ownership, backend-driven permissions validated
at the boundary, and multi-locale (English / Arabic / Kurdish Sorani / Kurdish Kurmanji) RTL
support out of the box.

## Stack

| Layer | Choice |
|---|---|
| Build | Vite |
| Routing | TanStack Router (file-based, code-split) |
| Server state | TanStack Query |
| Tables | TanStack Table |
| Forms | React Hook Form + Zod |
| HTTP | Axios (single shared client) |
| UI | Tailwind CSS + shadcn/ui-style primitives (Radix Slot, CVA) — theme source: [tweakcn.com/community](https://tweakcn.com/community) |
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
e2e/               # every test in the project — see Testing
├── unit/          # Vitest — mirrors src/ 1:1, just without the app code
└── flows/         # Playwright — user journeys, not page-specific
scripts/           # new-page.mjs — the `pnpm new:page` generator
```

Every route directory follows the same shape:

```text
routes/_dashboard/example-page/
├── index.tsx              # list route: validates search params, checks permissions, loads data
├── $itemId/                # detail route — its OWN directory (see below), not a bare file
│   ├── route.tsx
│   └── components/          # detail-only UI (e.g. ItemDetails)
├── components/              # list-page UI, plus anything both routes share (e.g. ItemForm)
├── services/                # HTTP calls only — no hooks, no UI, no toasts
├── queries/                  # query keys, query options, mutations
├── schemas/                  # Zod schemas (entity shape, URL search, forms)
├── permissions.ts            # the page's slice of the shared permission map
└── types.ts                  # page-local types
```

Its tests live at the mirrored path under `e2e/unit/` (see Testing below), not inside this
tree — that's a deliberate project-wide choice, not a per-page exception.

**Why `$itemId/` is a directory, not `$itemId.tsx`:** TanStack Router supports "directory
routes" — a route file can be `$itemId/route.tsx` instead of `$itemId.tsx`, with a sibling
`components/` folder that the router ignores (see `routeFileIgnorePattern` in
`vite.config.ts`). That gives the detail page its own isolated `components/` without
duplicating `services/`, `queries/`, `schemas/`, `types.ts`, and `permissions.ts` — list and
detail are the same SOLID *unit of change* (the same entity, the same endpoints, the same
permission group), so sharing those specific files isn't premature sharing, it's avoiding a
fork of the same contract. If a detail page ever needs its own service or query that the
list page doesn't, add it under `$itemId/` directly the same way.

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
7. Review the copied tests in `e2e/unit/routes/_dashboard/<plural>/` — their assertions still
   describe the old entity's fields.

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

`/auth/me`, `/auth/login`, `/auth/verify`, and `/auth/refresh` are validated the same way,
through `shared/auth/auth.schema.ts` (`authUserSchema`, `authTokensSchema`) — a renamed or
missing `permissions`/`roles` field fails loudly there instead of silently making every
`can()` check return `false` with no error anywhere.

## Auth, sessions, and permissions

- `shared/auth/session-storage.ts` is the **only** place that touches token storage. Swap its
  internals (e.g. to an in-memory-only strategy once the backend supports cookie refresh)
  without touching any component.
- `shared/services/http-client.ts` attaches the access token, and on a `401` funnels all
  concurrent requests through a single shared refresh promise — no duplicate refresh calls,
  no infinite loops.
- `shared/auth/session.ts` → `logout()` calls `POST /auth/logout` before clearing the local
  token (best-effort — local cleanup happens either way). Without this, a still-valid
  refresh cookie could keep minting access tokens after the user believes they've signed out.
- **The backend remains authoritative.** Hiding a button or blocking a route client-side is a
  UX nicety, not a security boundary.

**Permission values are 100% backend-driven — nothing about their shape is assumed:**

`Permission` (`shared/permissions/permission.types.ts`) is a plain `string`, not a union
derived from a local literal map. `shared/permissions/permission-map.ts` still exists, but
only as example constants for autocomplete/one-place-to-rename — it is **not** the source of
truth for what permissions exist, and nothing rejects a permission string just because it
isn't declared there. The one thing that actually is validated is the *shape* of
`user.permissions` (an array of strings, via `authUserSchema` above) — not the specific
values inside it, which are the backend's to define however it names them
(`items.read`, `ITEMS_READ`, `item:read`, a GUID — `can()` just does a string `.includes()`).

Earlier drafts of this template derived `Permission` from the literal strings in
`permission-map.ts`, which quietly assumed the frontend could invent the backend's naming
convention in advance. If your backend's real values don't match the examples in
`permission-map.ts`, update the constants to match — there's no type error either way, so
this is a naming-consistency habit, not a compiler-enforced one.

**Known trade-off — recorded, not fixed here:** the access token lives in `localStorage`
(see `session-storage.ts`), which any XSS elsewhere in the app could read. Moving it to
memory-only (re-hydrated via a `httpOnly` refresh cookie on load) is the stronger option
once your backend supports that refresh flow — swap it behind `session-storage.ts` when it
does. Relatedly, the cookie-based refresh flow (`refresh-session.ts`) has no CSRF token
plumbed through it; that's a backend-side control (`SameSite` cookie attributes, a CSRF
token endpoint) this template can't add on its own, but budget for it before relying on
cookies in production.

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

Every test in the project lives under `e2e/`, split into two trees by *how it runs*, not by
which page it covers:

```text
e2e/
├── unit/    # Vitest + Testing Library — mirrors src/ path-for-path, minus the app code
│   ├── routes/_auth/login/login-form.test.tsx
│   ├── routes/_dashboard/example-page/item-form.test.tsx
│   ├── routes/_dashboard/example-page/$itemId/item-details.test.tsx
│   └── shared/permissions/can.test.ts
└── flows/   # Playwright — one file per user journey, not per page
    └── auth.spec.ts
```

- `pnpm test` runs Vitest against `e2e/unit/**` only (`vite.config.ts` → `test.include`).
- `pnpm e2e` runs Playwright against `e2e/flows/**` only (`playwright.config.ts` →
  `testDir`). Neither runner ever picks up the other's files.
- Every test file imports the code it tests through the `@/` alias
  (`@/routes/_dashboard/example-page/components/item-form`), never a relative path — since
  a test's location no longer matches the code's location, relative paths would be fragile
  and misleading.
- `pnpm new:page` generates both trees together: `src/routes/_dashboard/<plural>/` *and*
  `e2e/unit/routes/_dashboard/<plural>/`, so a new page always arrives with a matching test
  skeleton — see "Adding a page" above.

**Why this instead of colocated unit tests:** colocation (test next to the code, deleted
with the page) is the more common default and is what the original spec for this template
assumed. This project deliberately trades that per-page cleanup guarantee for **one single,
predictable place to look for or add any test, regardless of type** — a project-wide
decision, not a per-page exception. `pnpm new:page` is what keeps this trade from costing
you anything in practice: it generates the matching `e2e/unit/` skeleton for every new page
automatically, so nothing is actually left to clean up by hand when a page is removed —
delete both `src/routes/_dashboard/<plural>/` and `e2e/unit/routes/_dashboard/<plural>/`.

`e2e/flows/auth.spec.ts` covers what's meaningful without a real backend: auth redirects,
route-permission denial, and form validation. Extend it per-flow once a real backend is
wired up (login success, CRUD on a real page, logout, language/RTL switching).

A few exports are intentionally kept even though nothing in this template currently calls
them — they're part of the shared kit's public surface for whoever builds the next page:
`CardDescription`/`CardFooter` (full Card API), `health.service.ts`/`upload.service.ts`
(infra stubs), and the extra test helpers in `shared/testing/`. These are listed explicitly
in `knip.json`'s `ignore`, not swept under a blanket exclusion.

## CI/CD

`.github/workflows/ci.yml` runs on every push to `main` and every pull request, as four
independent jobs so a failure points at exactly one gate:

| Job | Runs |
|---|---|
| `quality` | `pnpm typecheck` → `pnpm lint:ci` → `pnpm knip` |
| `test` | `pnpm test` (Vitest, `e2e/unit/`) |
| `build` | `pnpm build` → `pnpm size`, uploads `dist/` as an artifact |
| `e2e` | installs Chromium, builds, `pnpm e2e` (Playwright, `e2e/flows/`); uploads the HTML report as an artifact **only on failure**, for local download and inspection |

Turn this into a required check on `main` from the GitHub repo settings (Settings → Branches
→ branch protection rule) once you've pushed it — the workflow file alone doesn't block
merges by itself. Locally, `pnpm verify` runs the same gates in one sequential command
(plus `pnpm e2e` at the end) and is what `lefthook`'s `pre-push` hook already calls.
