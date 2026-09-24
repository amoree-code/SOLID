# SOLID

A collection of **independent** project templates. Each app under `apps/` stands alone with
its own `package.json`, lockfile, README, environment configuration, tests, Docker build and
CI workflow. **No app depends on another app.** Copy only the one you need.

```text
apps/
├── dashboard/   React dashboard base: TanStack Router/Query/Table, shadcn/ui, RTL
├── backend/     NestJS API base: Prisma + PostgreSQL, Zod, Swagger, rate limiting
└── portfolio/   Next.js personal site: SEO-ready, responsive, content-driven
```

Each one is an **empty base**: the plumbing a real project needs, with no example content
and no connection to the others. None includes authentication, sessions or permissions. The
dashboard and backend each ship a generator that adds complete pages or resources (with their
own tests) when you need them.

## Table of contents

- [Copy one app](#copy-one-app)
- [Why one repository, zero coupling](#why-one-repository-zero-coupling)
- [Dashboard](#dashboard)
- [Backend](#backend)
- [Portfolio](#portfolio)
- [Run all three together (local dev)](#run-all-three-together-local-dev)
- [Repository-wide conventions](#repository-wide-conventions)

## Copy one app

Each command pulls a single app with nothing else from this repository, and it runs
immediately:

```bash
# Dashboard: no .env, no API needed
npx degit amoree-code/SOLID/apps/dashboard my-dashboard
cd my-dashboard && pnpm install && pnpm dev
```

```bash
# Backend: database + migrations in one step (needs Docker)
npx degit amoree-code/SOLID/apps/backend my-backend
cd my-backend && pnpm install && pnpm quickstart && pnpm dev
```

```bash
# Portfolio: edit src/content/profile.ts
npx degit amoree-code/SOLID/apps/portfolio my-portfolio
cd my-portfolio && pnpm install && pnpm dev
```

Then grow them:

```bash
pnpm new:page user users            # dashboard: a complete list + detail page
pnpm new:resource product products  # backend: a complete CRUD resource + model
```

Or clone the whole repository and work inside one app's folder. Every command runs from there:

```bash
git clone https://github.com/amoree-code/SOLID.git
cd SOLID/apps/dashboard   # or apps/backend, or apps/portfolio
pnpm install
pnpm dev
```

## Why one repository, zero coupling

The apps are grouped here only so related work is easy to find. There is deliberately no
root `package.json`, no `pnpm-workspace.yaml`, no shared lockfile, no shared package and no
cross-app import. Copying one app never pulls in anything from the others.

The only shared location is `.github/workflows/`, because GitHub Actions reads workflows
only from there. Each `*-ci.yml` is path-filtered to its own app and installs only that
app's lockfile.

---

## Dashboard

`apps/dashboard` — an empty, domain-neutral React dashboard: TanStack Router (file-based,
typed URL state), TanStack Query, TanStack Table, shadcn/ui and Tailwind. Ships with **no
pages beyond Home** and calls **no API**, so it runs right after cloning. No authentication,
sessions, permissions, translation system or runtime mocks — add those per project.

### Stack

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

There is no global state library — server data lives in TanStack Query, filters/sorting/
paging live in the URL, form values live in React Hook Form.

### Setup

```bash
cd apps/dashboard
pnpm install
pnpm dev          # http://localhost:5173 — no .env needed
```

The base calls no API. Once you add a page that does:

```bash
cp .env.example .env        # then set VITE_API_BASE_URL
```

| Variable | Required | Meaning |
|---|---|---|
| `VITE_API_BASE_URL` | once a page calls an API | Absolute (`https://api.example.com`) or a same-origin path (`/api`) |
| `VITE_APP_NAME` | no | Shown in the sidebar and the tab title. Defaults to `Dashboard` |

Both are validated with Zod at startup (`app/config/env.ts`). Docker (static files served by
nginx):

```bash
docker build --build-arg VITE_API_BASE_URL=https://api.example.com -t dashboard .
```

### Folder structure

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

### Commands

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
| `pnpm size` / `pnpm size:first-load` | JS budget / real first-load JS after `pnpm build` |
| `pnpm verify` | Everything above, in CI order |

Full detail (adding a page, state ownership, API response contract, locale/RTL, testing,
bundle budget, optional starters): [`apps/dashboard/README.md`](apps/dashboard/README.md).

---

## Backend

`apps/backend` — an empty, domain-neutral NestJS API: PostgreSQL through Prisma, Zod
validation, one error shape for every failure, health/readiness probes, security headers,
rate limiting and Swagger. Ships with **no resources and no models**, only the plumbing. No
authentication, sessions, users, roles or permissions — add those per project.

### Stack

| Concern | Choice |
|---|---|
| Framework | NestJS 12 (ESM) |
| Database | PostgreSQL |
| ORM | Prisma 7 (`@prisma/adapter-pg` driver adapter) |
| Validation | Zod, via a small `ZodValidationPipe` bound per parameter |
| Config | `@nestjs/config`, validated with Zod at boot (`src/config/env.schema.ts`) |
| API docs | `@nestjs/swagger` at `/docs`, schemas generated from Zod |
| Security | `helmet` headers, `@nestjs/throttler` rate limiting |
| Quality | Biome, Vitest, Supertest |
| Runtime | Docker (multi-stage, non-root), `docker-compose.yml` |

### Setup

```bash
cd apps/backend
pnpm install
pnpm quickstart   # .env + local Postgres (Docker) + Prisma client + migrations
pnpm dev          # http://localhost:3000, docs at http://localhost:3000/docs
```

`pnpm quickstart` is safe to re-run and never overwrites an existing `.env`. If port 5432 is
taken, set `POSTGRES_PORT` in `.env` and use the same port in `DATABASE_URL`. To use your own
Postgres instead of Docker: `pnpm quickstart --no-docker` (after setting `DATABASE_URL`).

Everything in containers, nothing installed locally:

```bash
docker compose --profile full up -d --wait   # API on http://localhost:3000
```

| Variable | Required | Meaning |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `PORT` | no | Defaults to `3000` |
| `CORS_ORIGIN` | no | Comma-separated allowed browser origins. Empty (default) disables CORS |
| `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` | no | Requests per client per window. Defaults `100` / `60000` |
| `POSTGRES_PORT` / `API_PORT` | no | Host ports for Docker Postgres / the API container. Defaults `5432` / `3000` |

### Folder structure

```text
src/
├── main.ts                    # bootstrap: read config, configureApp(), listen
├── app.setup.ts                # helmet, CORS, error filter, Swagger — shared with the tests
├── app.module.ts                # config, rate limiting (global guard), modules
├── config/                        # env schema, validated at boot
├── common/
│   ├── filters/                     # HttpExceptionFilter: one error shape for everything
│   ├── openapi/                      # Swagger decorators generated from Zod schemas
│   └── pipes/                         # ZodValidationPipe
├── database/                            # PrismaModule (global), PrismaService
├── health/                                # GET /health (liveness), GET /health/ready (database)
├── generated/prisma/                        # Prisma client output (gitignored)
└── modules/                                  # created by `pnpm new:resource`

prisma/
└── schema.prisma              # datasource + generator, no models yet

scripts/templates/resource/    # the resource `pnpm new:resource` copies (with its spec + model)
```

### Commands

| Command | What it does |
|---|---|
| `pnpm quickstart` | First-run setup: env, database, Prisma client, migrations |
| `pnpm dev` | Watch mode |
| `pnpm build` / `pnpm start:prod` | Compile to `dist/` / run it |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` / `pnpm lint:ci` | Biome with / without autofix |
| `pnpm test` | Unit and HTTP tests (no database needed) |
| `pnpm test:e2e` | End-to-end against the real database in `DATABASE_URL` |
| `pnpm db:generate` | Generate the Prisma client (needed before typecheck/build) |
| `pnpm db:migrate` / `pnpm db:deploy` | Create+apply migrations (dev) / apply them (deploy) |
| `pnpm db:studio` | Browse data |
| `pnpm new:resource <singular> <plural>` | Generate a complete resource from the template |
| `pnpm check:templates` | Generate a throwaway resource, typecheck it, run its tests, remove it |
| `pnpm verify` | typecheck, lint, test, template check, build |

Full detail (adding a resource, API/error conventions, testing layers, Docker, optional
starters): [`apps/backend/README.md`](apps/backend/README.md).

---

## Portfolio

`apps/portfolio` — a lean Next.js foundation for a personal portfolio/site: not a finished
portfolio, a starting point with the structure already right, content-driven and SEO-ready.

### Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS 4 + shadcn/ui-style primitives (Radix Slot, CVA) — theme source: [tweakcn.com/community](https://tweakcn.com/community) |
| Lint/format | Biome |
| Unit tests | Vitest + Testing Library |
| E2E | Playwright |

### Setup

```bash
cd apps/portfolio
pnpm install
cp .env.example .env
pnpm dev
```

| Variable | Meaning |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | The deployed origin, e.g. `https://yourname.dev`. Every absolute URL (canonical, share card, sitemap, robots, structured data) is built from it. A malformed value fails the build |

Then edit **one file**: `src/content/profile.ts`. Every section reads from it — name, role,
bio, projects and contact links — nothing is hardcoded into a component.

### Folder structure

```text
src/
├── app/
│   ├── layout.tsx    # metadata, fonts, <html>/<body>
│   ├── page.tsx      # composes the sections below
│   ├── sitemap.ts    # /sitemap.xml
│   └── robots.ts     # /robots.txt
├── components/
│   ├── layout/       # header/footer — site chrome
│   ├── sections/     # hero/projects/contact — page content
│   └── ui/           # Section: the one place that owns spacing/width
└── content/
    └── profile.ts    # all copy — name, bio, projects, links
```

Content lives separately from presentation on purpose: a section component only knows how to
render a `Profile`/`Project`/`Link`, never the literal text.

### SEO (built in)

- Title, description, canonical URL, Open Graph and Twitter card tags (`app/layout.tsx`)
- A 1200×630 share image rendered at build time (`app/opengraph-image.tsx`)
- schema.org `Person` structured data (`lib/structured-data.ts`)
- `/sitemap.xml` and `/robots.txt`

### Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build (static-prerendered) |
| `pnpm typecheck` / `pnpm lint` / `pnpm lint:ci` | As in the other apps |
| `pnpm test` | Vitest (`e2e/unit/`) |
| `pnpm e2e` | Playwright (`e2e/flows/`) — builds and serves the app first |
| `pnpm verify` | typecheck → lint → test → build → e2e |

Full detail (adding a section, testing split): [`apps/portfolio/README.md`](apps/portfolio/README.md).

---

## Run all three together (local dev)

The apps share nothing, so there is no single "start everything" command — start each in its
own terminal, from the repo root:

```bash
# 1. Backend — API + Postgres
cd apps/backend && pnpm install && pnpm quickstart && pnpm dev
```

```bash
# 2. Dashboard — point it at the backend above
cd apps/dashboard && pnpm install
echo 'VITE_API_BASE_URL=http://localhost:3000' > .env
pnpm dev
```

```bash
# 3. Portfolio — standalone, no backend needed
cd apps/portfolio && pnpm install
cp .env.example .env   # set NEXT_PUBLIC_SITE_URL=http://localhost:3002
pnpm dev
```

| App | URL | Depends on |
|---|---|---|
| Backend | http://localhost:3000 (docs at `/docs`) | PostgreSQL (via `pnpm quickstart` or Docker) |
| Dashboard | http://localhost:5173 | Backend, only once a generated page calls it |
| Portfolio | http://localhost:3002 | Nothing |

## Repository-wide conventions

- **Package manager:** pnpm, one lockfile per app (no root lockfile, no workspaces).
- **Lint/format:** Biome everywhere — `pnpm lint` autofixes, `pnpm lint:ci` only checks.
- **Testing split:** Vitest + Testing Library for unit/integration, Playwright for e2e, in
  every app.
- **`pnpm verify`:** each app's full CI sequence, runnable locally before pushing.
- **Generators, not boilerplate to copy by hand:** `pnpm new:page` (dashboard) and
  `pnpm new:resource` (backend) produce a complete, tested feature slice; CI's
  `check:templates` step keeps the generator itself from silently breaking.
- **No auth in the core:** authentication, sessions and permissions are deliberately left out
  of every base — see each app's "Optional starters" section for where to add them.
- **CI:** `.github/workflows/*-ci.yml`, one workflow per app, path-filtered so a change to one
  app never runs another app's pipeline.
