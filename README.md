# SOLID

A collection of **independent** project templates. Each app under `apps/` stands alone with
its own `package.json`, lockfile, README, environment configuration, tests, Docker build and
CI workflow. **No app depends on another app.** Copy only the one you need.

```text
apps/
├── dashboard/   React dashboard: TanStack Router/Query/Table, shadcn/ui, typed URL state
├── backend/     NestJS API: Prisma + PostgreSQL, Zod validation, health probes, generator
└── portfolio/   Next.js personal site: SEO-ready, responsive, content-driven
```

The dashboard and backend are both domain-neutral cores. Neither includes authentication,
sessions or permissions. The dashboard calls whatever API you configure, not necessarily
this repository's backend. The backend serves any client, not necessarily this dashboard.
They share no code, types or contracts.

## Copy one app

Each command pulls a single app with nothing else from this repository:

```bash
# Dashboard only
npx degit amoree-code/SOLID/apps/dashboard my-dashboard
cd my-dashboard && pnpm install && cp .env.example .env && pnpm dev
```

```bash
# Backend only
npx degit amoree-code/SOLID/apps/backend my-backend
cd my-backend && pnpm install && cp .env.example .env && pnpm db:migrate && pnpm dev
```

```bash
# Portfolio only
npx degit amoree-code/SOLID/apps/portfolio my-portfolio
cd my-portfolio && pnpm install && pnpm dev
```

Or clone the repository and work inside one app's folder. Every command runs from there:

```bash
git clone https://github.com/amoree-code/SOLID.git
cd SOLID/apps/dashboard   # or apps/backend, or apps/portfolio
pnpm install
pnpm dev
```

Each app's README covers its architecture, environment variables and commands.

## Why one repository, zero coupling

The apps are grouped here only so related work is easy to find. There is deliberately no
root `package.json`, no `pnpm-workspace.yaml`, no shared lockfile, no shared package and no
cross-app import. Copying one app never pulls in anything from the others.

The only shared location is `.github/workflows/`, because GitHub Actions reads workflows
only from there. Each `*-ci.yml` is path-filtered to its own app and installs only that
app's lockfile.
