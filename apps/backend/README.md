# Backend Template

An empty, domain-neutral NestJS API base: PostgreSQL through Prisma, Zod validation, one
error shape for every failure, health and readiness probes, security headers, rate limiting
and Swagger. It ships with **no resources and no models**, only the plumbing. A generator
adds complete resources when you need them. It assumes no particular client.

The core has **no** authentication, sessions, users, roles or permissions. Those belong to
a real project and are listed under [Optional starters](#optional-starters).

## Stack

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

## Getting started

```bash
pnpm install
pnpm quickstart   # .env + local Postgres (Docker) + Prisma client + migrations
pnpm dev          # http://localhost:3000, docs at http://localhost:3000/docs
```

`pnpm quickstart` is safe to re-run, and it never overwrites an existing `.env`. If port 5432
is taken, set `POSTGRES_PORT` in `.env` and use the same port in `DATABASE_URL`. To use your
own Postgres instead of Docker, set `DATABASE_URL` and run `pnpm quickstart --no-docker`.

Everything in containers (database, migrations, then the API), with nothing installed locally:

```bash
docker compose --profile full up -d --wait   # API on http://localhost:3000
```

| Variable | Required | Meaning |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `PORT` | no | Defaults to `3000` |
| `CORS_ORIGIN` | no | Comma-separated allowed browser origins. Empty (default) disables CORS |
| `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` | no | Requests allowed per client per window. Defaults `100` / `60000` |
| `POSTGRES_PORT` / `API_PORT` | no | Host ports for Docker Postgres / the API container. Defaults `5432` / `3000` |

## Commands

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

## Structure

```text
src/
├── main.ts                    # bootstrap: read config, configureApp(), listen
├── app.setup.ts               # helmet, CORS, error filter, Swagger — shared with the tests
├── app.module.ts              # config, rate limiting (global guard), modules
├── config/                    # env schema, validated at boot
├── common/
│   ├── filters/               # HttpExceptionFilter: one error shape for everything
│   ├── openapi/               # Swagger decorators generated from Zod schemas
│   └── pipes/                 # ZodValidationPipe
├── database/                  # PrismaModule (global), PrismaService
├── health/                    # GET /health (liveness), GET /health/ready (database)
├── generated/prisma/          # Prisma client output (gitignored)
└── modules/                   # created by `pnpm new:resource`

prisma/
└── schema.prisma              # datasource + generator, no models yet

scripts/templates/resource/    # the resource `pnpm new:resource` copies (with its spec + model)
```

Add `common/guards/`, `common/interceptors/` or `common/decorators/` when the first real one
exists. The template doesn't ship empty abstractions.

## Adding a resource

```bash
pnpm new:resource product products     # → src/modules/product/, GET /products
```

The generator copies `scripts/templates/resource` (controller, service, repository, module,
Zod schemas and an HTTP spec), renames every identifier, the route and the table, and appends
the model to `prisma/schema.prisma`. Multi-word names work (`order-line order-lines`). It
generates backend code only, with no frontend files, auth or permissions. Then:

```bash
pnpm db:generate                       # client with the new model
# register ProductModule in src/app.module.ts (the generator prints the import)
pnpm db:migrate --name add_products    # creates and applies the migration
```

The generated resource follows the conventions below: list endpoints return
`{ items, total, page, pageSize }` and accept `?page&pageSize&search&status&sort&order`, and
a malformed query value falls back to its default instead of failing. Its repository is the
one place that maps database rows to the API shape. There is no interface or factory layer;
add one only when a second implementation exists.

CI runs `pnpm check:templates`, so the template can't silently break.

## API conventions

**Errors:** every error response is `{ message, code, errors }`:

```json
{ "message": "Validation failed", "code": "VALIDATION_ERROR", "errors": { "name": ["…"] } }
```

Validation failures carry per-field `errors`. Unexpected exceptions are logged and returned
as a generic `500` with `code: "INTERNAL_ERROR"`. Their internals never reach the client.

**Health:** `GET /health` never touches dependencies (liveness). `GET /health/ready`
returns `503` when the database does not answer (readiness). Neither is rate-limited.

**Security:** `helmet` sets security headers on every response. Every route is rate-limited
per client (`429` in the normal error shape); opt a controller out with `@SkipThrottle()`.

**Docs:** `/docs` (Swagger UI) and `/docs-json` (OpenAPI). Use `ApiZodBody`, `ApiZodQuery` and
`ApiZodResponse` from `common/openapi/` so the docs come from the same Zod schemas that
validate requests and can't drift from them.

## Testing

| Layer | Where | Needs a database |
|---|---|---|
| Unit | `src/**/*.spec.ts`, next to the code | no |
| App setup | `app.setup.spec.ts`: headers, CORS, validation, rate limit, Swagger | no |
| Generated resources | `<resource>.controller.spec.ts`, with an in-memory repository | no |
| End-to-end | `test/*.e2e-spec.ts`, the full `AppModule` | yes (migrated) |

## Docker

```bash
docker build -t backend .
docker compose --profile full up -d --wait   # Postgres → migrations → API (healthchecked)
```

## CI

`.github/workflows/backend-ci.yml` runs only when `apps/backend/**` changes: typecheck, lint,
unit tests, the template check, migrations against a throwaway Postgres, e2e, and build. It
installs only this app's own lockfile.

## Optional starters

Not implemented in the core, on purpose. Add them per project:

- **Authentication:** a `User` model, a hashing library, `@nestjs/jwt`, and a global guard
  with a `@Public()` escape hatch for `/health`.
- **Authorization:** a guard plus a metadata decorator on handlers, fed by your identity
  model.
- **Email verification / password reset:** on top of the authentication starter.
