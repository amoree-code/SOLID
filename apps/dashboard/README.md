# Dashboard Template

An empty, domain-neutral React dashboard base: TanStack Router (file-based, typed URL
state), TanStack Query, TanStack Table, shadcn/ui and Tailwind. It ships with **no pages
beyond Home** and calls **no API**, so it runs right after cloning. A generator adds complete
pages when you need them.

The core has **no** authentication, sessions, permissions, translation system or runtime
mocks. Those belong to a real project and are listed under [Optional starters](#optional-starters).

## Stack

| Concern | Choice |
|---|---|
| Build | Vite 8, TypeScript (strict) |
| Routing | TanStack Router: file-based, generated route tree, automatic code splitting |
| Server state | TanStack Query (`queryOptions`, key factories, mutation hooks) |
| Tables | TanStack Table (headless) behind a shared `DataTable` |
| Forms | React Hook Form + Zod |
| UI | shadcn/ui (Radix) + Tailwind CSS 4, toasts via `sonner` |
| HTTP | One Axios instance (`shared/services/http-client.ts`) |
| Quality | Biome, Vitest + Testing Library, Playwright, Knip, Size Limit |

There is no global state library. See [State ownership](#state-ownership).

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:5173 — no .env needed
```

The base calls no API. Once you add pages that do, set the API's address:

```bash
cp .env.example .env        # then set VITE_API_BASE_URL
```

| Variable | Required | Meaning |
|---|---|---|
| `VITE_API_BASE_URL` | once a page calls an API | Absolute (`https://api.example.com`) or a same-origin path (`/api`) |
| `VITE_APP_NAME` | no | Shown in the sidebar and the tab title. Defaults to `Dashboard` |

Both are validated with Zod at startup (`app/config/env.ts`). If a request is made without
`VITE_API_BASE_URL`, the HTTP client refuses to send it and the page shows a clear message.
It never silently calls the dashboard's own origin.

Docker (static files served by nginx):

```bash
docker build --build-arg VITE_API_BASE_URL=https://api.example.com -t dashboard .
```

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Generate the route tree, typecheck, production build |
| `pnpm typecheck` | Generate the route tree, then `tsc -b` |
| `pnpm lint` / `pnpm lint:ci` | Biome with / without autofix |
| `pnpm test` | Unit and integration tests (Vitest) |
| `pnpm e2e` | Playwright against the production build (`pnpm e2e:install` once) |
| `pnpm new:page <singular> <plural>` | Generate a complete page from the template |
| `pnpm check:templates` | Generate a throwaway page, typecheck it, run its tests, remove it |
| `pnpm knip` | Unused files, exports and dependencies |
| `pnpm size` | Total JS budget |
| `pnpm size:first-load` | JS a browser really downloads for `/` (after `pnpm build`) |
| `pnpm verify` | Everything above, in CI order |

## Project structure

```text
src/
├── app/                     # wiring only — no feature code
│   ├── config/              # env.ts (validated), app-config.ts
│   ├── providers/           # app, query, theme, locale providers
│   ├── router/              # router.tsx, router-context.ts, route-pending.tsx
│   └── styles/              # globals.css, tokens.css (theme variables)
├── routes/                  # file-based routes; each page owns its code
│   ├── __root.tsx
│   └── _app/                # pathless layout: sidebar + header
│       └── index.tsx        # /  (the only page in the base)
├── shared/                  # reusable, domain-free building blocks
│   ├── components/
│   │   ├── ui/              # shadcn/ui primitives (generated, not linted)
│   │   ├── data-table/      # DataTable, sort header, pagination, column toggle
│   │   ├── feedback/        # empty/error/loading states, confirm dialog, boundaries
│   │   ├── forms/           # FormField
│   │   └── layout/          # sidebar, header, page header, theme/locale switchers
│   ├── hooks/
│   ├── query/               # query client, query error boundary
│   ├── services/            # http-client, error-normalizer, response-envelope
│   └── testing/             # render helpers, Vitest setup
├── main.tsx
└── vite-env.d.ts

scripts/templates/
├── page/                    # the page `pnpm new:page` copies (with its tests)
└── page-e2e/                # its Playwright spec
```

`shared/` ships ready to use even before any page uses it, so Knip treats it as a public
library (`knip.json`). The form and search-param libraries stay installed for the same
reason: generated pages need them.

## Adding a page

```bash
pnpm new:page user users     # → src/routes/_app/users/ and e2e/users.spec.ts, route /users
```

The generator copies `scripts/templates/page`, renames every file and identifier (multi-word
names work: `user-profile user-profiles`), and prints the remaining steps: add the sidebar
entry, set `VITE_API_BASE_URL`, and adjust the schemas to the real fields. The generated page
calls `/<plural>` on your API and expects the common list shapes (see
[API responses](#api-responses-validated-not-assumed)).

CI runs `pnpm check:templates`, so the template can't silently break.

### What a generated page owns

```text
routes/_app/users/
├── index.tsx              # route: validates search, declares loaderDeps, preloads, composes
├── $userId/
│   ├── route.tsx          # detail route: typed params, preloads the record
│   └── components/
├── components/            # columns (sortable headers), table, filter, form, actions, page
├── services/              # transport only: one function per endpoint, parsed with Zod
├── queries/               # key factory, queryOptions, mutation hooks (+ invalidation)
├── schemas/               # entity, form and URL-search schemas
├── tests/                 # this page's tests
└── types.ts
```

The route file owns URL validation, loader dependencies, preloading and composition. It does
not own Axios details, business rules, form state, table implementation or feedback UI.
Services do transport only, with no React, toasts, navigation or cache policy. Mutations own
cache invalidation, and components own the toasts.

`components`, `services`, `queries`, `schemas`, `tests` and `types.ts` are excluded from
route generation, so only `index.tsx` and `route.tsx` files become routes. **Removing a
page** means deleting its folder, its e2e spec and its sidebar entry.

## State ownership

| State | Owner |
|---|---|
| Server data | TanStack Query. Never copied into `useState` |
| Filters, sorting, pagination | URL search params, validated by the route |
| Form values | React Hook Form |
| Success / failure notices | Toasts (`sonner`), raised by components, never by services |
| Simple local UI state | `useState` |
| Complex local workflows | `useReducer` |
| Theme / locale and direction | `ThemeProvider` / `LocaleProvider` |

A generated page's list state lives in the URL:

```text
/users?page=2&pageSize=25&status=active&search=amer&sort=createdAt&order=desc
```

Every key has a default and a per-key fallback, so a malformed URL still renders. Defaults
are stripped from links, and unknown params never reach the API. Filters survive refresh,
back/forward, bookmarks and shared links.

## API responses: validated, not assumed

- Every generated service parses its response with the page's Zod schema.
- `shared/services/response-envelope.ts` normalizes common list shapes (`{ items, total, … }`,
  `{ data, meta }`, `{ results, count }`, a bare array) into one `PaginatedResponse<T>`.
- `shared/services/error-normalizer.ts` turns any failure into
  `{ message, status, code, fieldErrors }`, reading the common error-body conventions and
  never showing raw exception text.

Add auth headers, tracing or retries with interceptors in `http-client.ts`, the only file
that knows about transport.

## Locale and direction

`app/providers/locale-provider.tsx` holds the current locale (`en`, `ar`, `ckb`, `ku`) and
keeps `<html lang>` and `<html dir>` in sync (`ar` and `ckb` are right-to-left). It contains
no translation resources. Layout uses logical properties, so RTL works without per-component
changes.

## Testing

| Layer | Where | Tool |
|---|---|---|
| Unit / integration | `tests/` beside the module they cover | Vitest + Testing Library |
| Browser flows | `e2e/` | Playwright (Chromium + mobile Chromium) |

`renderWithProviders(ui)` renders one component behind a throwaway router. `renderApp(url)`
renders the **real** route tree at a URL. Tests stub the network at the `httpClient` boundary
(Vitest) or the browser network layer (Playwright). The bundle contains no mocks.

## Bundle budget

`pnpm size:first-load` opens `/` in Chromium and sums every JS file the browser downloads.
The base is about 165 kB (brotli) against a 200 kB budget. `pnpm size` caps all JS at
350 kB. (Counting only `index-*.js`, the old check, missed shared chunks that move around as
pages are added.)

## CI

`.github/workflows/dashboard-ci.yml` runs only when `apps/dashboard/**` changes: typecheck,
lint, Knip, tests, the template check, build, both size budgets, and Playwright. It installs
only this app's own lockfile.

## Optional starters

Not implemented in the core, on purpose. Add them per project:

- **Authentication and sessions:** login routes under a pathless `_auth` layout, a session
  query, a `beforeLoad` guard on `_app`, and an auth interceptor in `http-client.ts`.
- **Authorization:** route-level checks in `beforeLoad` plus a component guard, fed by
  whatever your API issues.
- **Translations:** any i18n library, keyed off `useLocale().locale`.
