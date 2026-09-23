# Dashboard Template

A minimal, domain-neutral React dashboard: TanStack Router (file-based, typed URL state),
TanStack Query, TanStack Table, shadcn/ui and Tailwind. It talks to **any** HTTP API through
one configured base URL. It does not depend on any particular backend, including the one in
this repository.

The core has **no** authentication, sessions, permissions, translation system, or runtime
mocks. Those belong to a real project and are listed under [Optional starters](#optional-starters).

## Stack

| Concern | Choice |
|---|---|
| Build | Vite 8, TypeScript (strict) |
| Routing | TanStack Router: file-based, generated route tree, automatic code splitting |
| Server state | TanStack Query (`queryOptions`, key factories, mutation hooks) |
| Tables | TanStack Table (headless) behind a shared `DataTable` |
| Forms | React Hook Form + Zod |
| UI | shadcn/ui (Radix) + Tailwind CSS 4 |
| HTTP | One Axios instance (`shared/services/http-client.ts`) |
| Quality | Biome, Vitest + Testing Library, Playwright, Knip, Size Limit |

There is no global state library. See [State ownership](#state-ownership).

## Getting started

```bash
pnpm install
cp .env.example .env        # set VITE_API_BASE_URL to your API
pnpm dev
```

| Variable | Required | Meaning |
|---|---|---|
| `VITE_API_BASE_URL` | yes | Base URL of the API every service calls, e.g. `https://api.example.com` |
| `VITE_APP_NAME` | no | Shown in the sidebar and the tab title. Defaults to `Dashboard` |

Both are validated with Zod at startup (`app/config/env.ts`). A missing or malformed value
fails immediately instead of on the first request.

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Generate the route tree, typecheck, production build |
| `pnpm typecheck` | Generate the route tree, then `tsc -b` |
| `pnpm lint` / `pnpm lint:ci` | Biome with / without autofix |
| `pnpm test` | Unit and integration tests (Vitest) |
| `pnpm e2e` | Playwright against the production build (`pnpm e2e:install` once) |
| `pnpm knip` | Unused files, exports and dependencies |
| `pnpm size` | Bundle size budget (`.size-limit.json`) |
| `pnpm new:page <singular> <plural>` | Scaffold a page from `example-page` |
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
│       ├── index.tsx        # /
│       └── example-page/    # /example-page — the reference page
├── shared/                  # reusable, domain-free code only
│   ├── components/
│   │   ├── ui/              # shadcn/ui primitives (generated, not linted)
│   │   ├── data-table/      # DataTable, pagination, column toggle
│   │   ├── feedback/        # empty/error/loading states, confirm dialog, boundaries
│   │   ├── forms/           # FormField
│   │   └── layout/          # sidebar, header, page header, theme/locale switchers
│   ├── hooks/
│   ├── query/               # query client, query error boundary
│   ├── services/            # http-client, error-normalizer, response-envelope
│   └── testing/             # render helpers, Vitest setup
├── main.tsx
└── vite-env.d.ts
```

### A page owns its code

```text
routes/_app/example-page/
├── index.tsx              # route: validates search, declares loaderDeps, preloads, composes
├── $itemId/
│   ├── route.tsx          # detail route: typed params, preloads the item
│   └── components/
├── components/            # columns, table, filter, form, actions, page
├── services/              # transport only: one function per endpoint, parsed with Zod
├── queries/               # key factory, queryOptions, mutation hooks (+ invalidation)
├── schemas/               # entity, form and URL-search schemas
├── tests/                 # this page's tests
└── types.ts
```

The route file owns URL validation, loader dependencies, preloading and composition. It does
not own Axios details, business rules, form state, table implementation or feedback UI.

Services do transport only. No React, no toasts, no navigation, no cache policy. Queries own
keys and `queryOptions`. Mutations own cache invalidation. Components decide what the user
sees on success or failure.

`components`, `services`, `queries`, `schemas`, `tests` and `types.ts` are excluded from
route generation (`tsr.config.json` and `vite.config.ts`), so only `index.tsx` and
`route.tsx` files become routes.

**Adding a page:** run `pnpm new:page user users`, add a sidebar entry in
`shared/components/layout/app-sidebar.tsx`, then point the new services and schemas at the
real endpoints. **Removing a page:** delete its folder and its sidebar entry. Nothing else
references it.

**Shared-folder rule:** code moves into `shared/` only once a second page needs it, and only
if it carries no domain knowledge.

## State ownership

| State | Owner |
|---|---|
| Server data | TanStack Query. Never copied into `useState` |
| Filters, sorting, pagination | URL search params, validated by the route |
| Form values | React Hook Form |
| Simple local UI state | `useState` |
| Complex local workflows | `useReducer` |
| Theme | `ThemeProvider` |
| Locale and direction | `LocaleProvider` |

### URL search state

`example-page/schemas/item-search.schema.ts` defines the list's URL state:

```text
/example-page?page=2&pageSize=25&status=active&search=amer&sort=createdAt&order=desc
```

Every key has a default and a per-key fallback, so a malformed or stale URL still renders
instead of erroring. Defaults are stripped from the URL (`stripSearchParams`) to keep links
short. `loaderDeps` picks only the keys the query uses, so an unrelated URL param never
triggers a refetch and never reaches the API. Because all of this lives in the URL, filters
survive refresh, back/forward, bookmarks and shared links.

## API responses: validated, not assumed

- Every service parses its response with the page's Zod schema. A renamed or missing field
  fails at the boundary, not deep inside a component.
- `shared/services/response-envelope.ts` normalizes common list shapes (`{ items, total, … }`,
  `{ data, meta }`, `{ results, count }`, a bare array) into one `PaginatedResponse<T>`.
- `shared/services/error-normalizer.ts` turns any failure into
  `{ message, status, code, fieldErrors }`. It reads the common error-body conventions
  (`message` as a string or string array, `code`, `errors`/`fieldErrors`) and falls back to
  a generic message for anything else. Raw exception text never reaches the UI.

To add auth headers, tracing or retries, add Axios interceptors in `http-client.ts`. That is
the only file that knows about transport.

## Locale and direction

`app/providers/locale-provider.tsx` holds the current locale (`en`, `ar`, `ckb`, `ku`) and
keeps `<html lang>` and `<html dir>` in sync (`ar` and `ckb` are right-to-left). It contains
no translation resources. Layout uses logical properties (`ms-*`, `me-*`, `text-start`), so
RTL works without per-component changes. Plug in a translation system on top of
`useLocale().locale` when a project needs one.

## Testing

| Layer | Where | Tool |
|---|---|---|
| Unit / integration | `tests/` inside the page or shared module they cover | Vitest + Testing Library |
| Browser flows | `e2e/` | Playwright (Chromium + mobile Chromium) |

`shared/testing/render.tsx` provides two helpers:

- `renderWithProviders(ui)` renders a single component behind a throwaway router.
- `renderApp(url)` renders the **real** generated route tree at a URL, so search
  validation, loaders and the page run exactly as in the app.

Tests stub the network at the `httpClient` boundary (Vitest) or at the browser network layer
(`page.route` in Playwright). The app bundle itself contains no mocks.

## CI

`.github/workflows/dashboard-ci.yml` at the repository root runs only when `apps/dashboard/**`
changes: typecheck, lint, Knip, tests, build, size budget, Playwright. It installs only
this app's own lockfile.

## Optional starters

Not implemented in the core, on purpose. Add them per project:

- **Authentication and sessions:** login routes under a pathless `_auth` layout, a session
  query, a `beforeLoad` guard on `_app`, an auth interceptor in `http-client.ts`.
- **Authorization:** route-level checks in `beforeLoad` plus a component guard, fed by
  whatever your API issues.
- **Translations:** any i18n library, keyed off `useLocale().locale`.
- **Toasts:** a toaster in `AppProviders`, triggered from components (never from services).
