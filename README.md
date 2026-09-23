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

Each app's README covers its architecture, environment variables and commands.

## Why one repository, zero coupling

The apps are grouped here only so related work is easy to find. There is deliberately no
root `package.json`, no `pnpm-workspace.yaml`, no shared lockfile, no shared package and no
cross-app import. Copying one app never pulls in anything from the others.

The only shared location is `.github/workflows/`, because GitHub Actions reads workflows
only from there. Each `*-ci.yml` is path-filtered to its own app and installs only that
app's lockfile.
