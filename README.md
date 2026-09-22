# SOLID

A personal collection of ready-to-clone project foundations, each independent and each built
around SOLID principles for its own domain. Every app under `apps/` is fully standalone — its
own `package.json`, its own lockfile, its own CI workflow, its own Docker build. Nothing here
links one app to another; there is no shared workspace, no shared lockfile, no shared tooling.

```text
apps/
├── dashboard/   Frontend template — TanStack Router/Query/Table, i18n+RTL, permissions
├── backend/     NestJS + SOLID — DI-first API foundation, paired 1:1 with dashboard's contract
└── portfolio/   Next.js — personal site foundation, content/presentation separated
```

Each app has its own README with its own architecture notes — start there once you're inside one.

## Using this repo

Every app is used the same way, on its own, from inside its own folder:

```bash
git clone https://github.com/amoree-code/SOLID.git
cd SOLID/apps/dashboard   # or apps/backend, or apps/portfolio
pnpm install
pnpm dev
```

Or pull just one app straight from GitHub, with nothing local beyond `npx` — no cloning the
full repo first:

```bash
npx degit amoree-code/SOLID/apps/backend my-backend
cd my-backend
pnpm install
pnpm dev
```

Swap `apps/backend` for `apps/dashboard` or `apps/portfolio` for the other two.

## Why apps live in one repo but stay decoupled

They're grouped here for convenience only — so related work is easy to find in one place. There
is deliberately no `pnpm-workspace.yaml`, no root `package.json`, no shared lockfile, and no
root-level git hooks: cloning or `degit`-ing a single app never pulls in anything from the
others, and nothing in one app's `package.json` or lockfile references another.

The only thing that has to live at the repo root is `.github/workflows/*-ci.yml` — GitHub
Actions only ever reads workflows from that exact path, no way around it. Each workflow is
still fully independent: it's path-filtered to its own app's folder and only ever installs and
runs that one app's own `package.json`/lockfile.
