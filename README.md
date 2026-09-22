# SOLID

A personal collection of ready-to-clone project foundations, each independent and each built
around SOLID principles for its own domain. This repo is a `pnpm` workspace so the apps can be
developed together, but every app under `apps/` is a fully standalone project — its own
`package.json`, its own tooling, nothing it needs living only at the workspace root.

```text
apps/
├── dashboard/   Frontend template — TanStack Router/Query/Table, i18n+RTL, permissions
├── backend/     NestJS + SOLID — DI-first API foundation, paired 1:1 with dashboard's contract
└── portfolio/   Next.js — personal site foundation, content/presentation separated
```

Each app has its own README with its own architecture notes — start there once you're inside one.

## Using this repo

**Working on everything together** (this workspace, on this machine):

```bash
git clone <this-repo>
cd SOLID
pnpm install
pnpm --filter dashboard dev
pnpm --filter backend dev
```

**Starting a new project from just one app** (no workspace, no history, no other apps):

```bash
npx degit <this-repo>/apps/dashboard my-project
cd my-project
pnpm install
```

Swap `apps/dashboard` for `apps/backend` or `apps/portfolio`. `degit` needs this repo to be
pushed somewhere reachable (GitHub, a private git host) — it can't pull from a purely local
clone.

## Shared at the root, on purpose

Only things that make sense repo-wide live here, and every one of them is a convenience for
working across apps — never something an individual app depends on to function:

| File | Purpose |
|---|---|
| `pnpm-workspace.yaml` | Links `apps/*` into one workspace |
| `package.json` | Root dev tooling only (`biome`, `lefthook`) — no app code |
| `lefthook.yml` | Git hooks: lints staged files repo-wide on commit, runs every app's `verify` on push |
| `.github/workflows/*-ci.yml` | One workflow per app, path-filtered — a change in `apps/dashboard/**` only runs `dashboard-ci.yml` |

Each app keeps its own `biome.json`, its own lint/test/build scripts, and its own CI workflow.
Nothing here is required for an app to work once it's `degit`'d out on its own.
