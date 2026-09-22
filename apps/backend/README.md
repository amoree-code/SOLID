# SOLID Backend

A NestJS API foundation built the way NestJS already wants to be built — DI-first, modules
owning one responsibility — paired with a matching dashboard frontend template in the same
repo. If you use both, the contract between them needs zero adaptation layer.

## Stack

| Layer | Choice |
|---|---|
| Framework | NestJS 12 |
| Database | PostgreSQL |
| ORM | Prisma 7 (driver adapter: `@prisma/adapter-pg`) |
| Validation | Zod, via a small custom `ZodValidationPipe` — no wrapper library |
| Auth | `@nestjs/jwt` + `@nestjs/passport` — access token (body) + refresh token (httpOnly cookie) |
| Permissions | A custom `PermissionsGuard` reading `@RequirePermission('resource.action')` |
| API docs | `@nestjs/swagger`, served at `/docs` |
| Lint/format | Biome (matches the dashboard app; NestJS's default oxlint/prettier scaffold was removed) |
| Tests | Vitest (unit, colocated `*.spec.ts`) + Vitest e2e (`test/*.e2e-spec.ts`, via `supertest`) |

## Getting started

```bash
pnpm install
cp .env.example .env          # then edit DATABASE_URL, JWT secrets
pnpm db:migrate                # creates the schema (needs a reachable Postgres)
pnpm db:seed                   # creates demo@example.com / password123
pnpm dev
```

Swagger UI: `http://localhost:3000/docs`. Health check (no auth): `GET /health`.

## Why this pairs with the dashboard template with zero mapping

- `AuthUser` (`src/auth/types/auth-user.type.ts`) is field-for-field identical to the
  dashboard's `AuthUser` (`id`, `name`, `email`, `roles`, `permissions`).
- A permission is a plain `string` here too (`RequirePermission('items.read')`) — same
  reasoning as the dashboard's `Permission = string`: neither side hardcodes an assumption
  about the other's naming convention. The `items.*` names used by the reference `Items`
  resource match `permission-map.ts`'s example constants exactly, but nothing enforces that;
  they're just consistent by choice.
- `Item` (`src/items/schemas/item.schema.ts`) matches the dashboard's `Item` schema exactly
  (`id`, `name`, `status: 'active' | 'inactive'`, `createdAt`), and the list response shape
  (`{ items, total, page, pageSize }`) matches one of the shapes
  `response-envelope.ts` already recognizes on the frontend.
- Every error response is normalized to `{ message, code, errors }`
  (`src/common/filters/http-exception.filter.ts`) — the exact shape the dashboard's
  `error-normalizer.ts` already expects.

## Auth flow

```text
POST /auth/login    { email, password }  → { accessToken, refreshToken: null } + Set-Cookie
POST /auth/verify    { code }             → same shape (demo placeholder, see below)
POST /auth/refresh   (cookie only)        → same shape, rotates both tokens
POST /auth/logout                          → clears the cookie
GET  /auth/me        (Bearer token)       → AuthUser
```

The refresh token never appears in a JSON body — only in an `httpOnly`, `sameSite: strict`
cookie scoped to `/auth`. The access token still travels in the body and is the dashboard's
responsibility to store (see the dashboard README's "known trade-off" note on this).

**`/auth/verify` is a placeholder** (`AuthService.verify`, hardcoded 6-digit code
`"123456"` for the seeded demo user) — it exists to demonstrate the request/response
contract the dashboard's verify page expects, not as real 2FA/email verification. Replace
it with actual OTP/email/SMS delivery before using this for anything real.

## Adding a resource

```bash
pnpm new:resource product products
```

Copies `src/items/` (repository → service → controller → module, plus `schemas/`) to
`src/products/`, renaming every identifier — including the `@Controller` path, the
`@RequirePermission` strings, and the Prisma client accessor (`this.prisma.item` →
`this.prisma.product`) — and appends a matching `model`/`enum` to `prisma/schema.prisma`,
copied from `model Item`/`enum ItemStatus`. The one thing it protects on purpose: the
generic `{ items, total, page, pageSize }` field name in the paginated response type stays
`items` for every resource — that's the wire-format contract with the dashboard's
`response-envelope.ts`, not something to rename per entity.

It prints the same kind of "required next step" list as the dashboard's `pnpm new:page`:
registering the new module in `app.module.ts` and running `pnpm db:migrate` both fail loudly
(a missing import, a table that doesn't exist) rather than silently, so there's no way to
forget them and have the app "work" incorrectly.

Each layer has one reason to change:

```text
Controller   → HTTP surface: routes, permission requirements, request validation
Service      → business logic, orchestrates repositories
Repository   → the only place that talks to Prisma for that resource
Schemas      → Zod: request shape validation + the entity's own response shape
```

`ItemsService` depends on `ItemsRepository`'s methods, never on `PrismaService` directly —
swap the storage engine later without touching the service or controller.

## Testing

Unit tests are colocated (`*.spec.ts` next to the file they test) — standard Nest/Vitest
convention. `test/*.e2e-spec.ts` boots the real Nest application (via `@nestjs/testing`) and
hits it with `supertest`; the two included here (`/health` and an unauthenticated `/items`
rejection) don't require a reachable database. Add a Postgres instance (`docker run -p
5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16`, or update `DATABASE_URL`) before
writing e2e tests that actually query data.

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start with hot reload |
| `pnpm build` | Compile to `dist/` |
| `pnpm new:resource <singular> <plural>` | Scaffold a new resource from `items/` (see "Adding a resource") |
| `pnpm typecheck` / `pnpm lint` / `pnpm lint:ci` | As in the dashboard app |
| `pnpm test` / `pnpm test:e2e` | Unit / e2e (Vitest) |
| `pnpm db:migrate` | Apply Prisma migrations (dev) |
| `pnpm db:generate` | Regenerate the Prisma client after a schema change |
| `pnpm db:seed` | Seed the demo user + reference items |
| `pnpm db:studio` | Prisma Studio (visual DB browser) |
| `pnpm verify` | typecheck → lint → test → build |
