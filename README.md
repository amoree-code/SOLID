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
```

Every route directory follows the same shape:

```text
routes/_dashboard/example-page/
├── index.tsx           # list route: validates search params, checks permissions, loads data
├── $itemId.tsx          # detail route
├── components/          # page-local UI
├── services/            # HTTP calls only — no hooks, no UI, no toasts
├── queries/              # query keys, query options, mutations
├── schemas/              # Zod schemas (URL search + forms)
├── tests/                # Vitest + Testing Library
├── permissions.ts        # the page's slice of the shared permission map
└── types.ts              # page-local types
```

**`example-page` is the canonical reference implementation.** When starting a real feature,
copy it, rename it, and replace its contents — don't build a new page pattern from scratch.

### Adding a page

1. Copy `routes/_dashboard/example-page` to `routes/_dashboard/<your-page>`.
2. Rename `Item*` → your entity, update `permissions.ts`, `types.ts`, and the Zod schemas.
3. Point `services/*.ts` at your real endpoints.
4. Add navigation entry in `shared/components/layout/dashboard-sidebar.tsx`.
5. Add translation keys to `shared/i18n/locales/*/navigation.json` (and any page-specific copy).
6. Write page-local tests in `tests/`.

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

- **Vitest + Testing Library** for schemas, permission logic, query key factories, and
  component/page interactions (`shared/testing/render.tsx` gives a full-stack render — query
  client, locale, and a throwaway router — for anything using `Link`/`useNavigate`).
- **Playwright** (`e2e/`) for critical flows that don't need a real backend to be meaningful:
  auth redirects, route-permission denial, and form validation. Extend this suite per-flow
  once a real backend is wired up (login success, CRUD on the reference page, logout).

A few exports are intentionally kept even though nothing in this template currently calls
them — they're part of the shared kit's public surface for whoever builds the next page:
`CardDescription`/`CardFooter` (full Card API), `health.service.ts`/`upload.service.ts`
(infra stubs), and the extra test helpers in `shared/testing/`. These are listed explicitly
in `knip.json`'s `ignore`, not swept under a blanket exclusion.
