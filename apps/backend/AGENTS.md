# AI development rules

These rules apply only to this app.

## SOLID is mandatory

- **Single Responsibility:** keep controllers, validation, use cases, domain rules,
  persistence, and infrastructure separate.
- **Open/Closed:** extend behavior through composition, strategies, adapters, or focused
  interfaces. Avoid growing large conditionals for every new case.
- **Liskov Substitution:** implementations must honor the complete contract of their
  abstraction and preserve its guarantees.
- **Interface Segregation:** keep interfaces and service contracts focused. Do not force
  consumers to depend on unused methods or data.
- **Dependency Inversion:** domain and application logic depend on contracts, not NestJS,
  Prisma, PostgreSQL, HTTP, or concrete infrastructure.

## Implementation rules

- Keep controllers thin; place business rules in small, testable service functions.
- Keep NestJS, Prisma, database, and transport wiring at the edge.
- Inject repositories, clocks, external clients, and other services instead of constructing
  them inside business logic.
- Translate domain errors at the transport boundary; do not leak persistence details.
- Do not add speculative abstractions, god services, god modules, or duplicated logic.
- Preserve existing Zod validation, error envelopes, security, testing, and module patterns.

## Folder structure

```text
src/
├── config/                 # validated environment configuration
├── common/                 # reusable transport concerns only
│   ├── decorators/
│   ├── filters/            # HTTP error translation
│   ├── openapi/            # API documentation adapters
│   └── pipes/              # request validation adapters
├── database/               # Prisma wiring and infrastructure
├── health/                 # health feature and its controller
├── modules/                # one business capability per module
│   └── <feature>/
│       ├── <feature>.module.ts
│       ├── <feature>.controller.ts       # transport adapter
│       ├── <feature>.service.ts          # use-case orchestration
│       ├── <feature>.repository.ts       # persistence access
│       ├── dto/                          # transport types
│       ├── schemas/                      # Zod request/response contracts
│       ├── types/                        # shared feature types
│       └── tests/                        # feature tests
├── app.module.ts           # composition root
├── app.setup.ts            # framework/security setup
└── main.ts                 # bootstrap only
```

Every business module must use this internal structure. Keep the module simple: only the
four folders below are allowed inside it. The controller, service, repository, and module
files stay at the module root.

```text
src/modules/user/
├── user.module.ts                 # Nest composition root
├── user.controller.ts              # HTTP routes; no business logic
├── user.service.ts                 # use-case orchestration
├── user.repository.ts              # Prisma/persistence access
├── dto/
│   ├── create-user.dto.ts          # input/output transport types
│   ├── update-user.dto.ts
│   └── list-user.dto.ts            # query type
├── schemas/
│   ├── create-user.schema.ts       # Zod runtime validation
│   ├── update-user.schema.ts
│   ├── list-user.schema.ts
│   └── user-response.schema.ts
├── types/
│   └── user.types.ts               # inferred/shared feature types
└── tests/
    ├── user.service.spec.ts
    ├── user.repository.spec.ts
    └── user.controller.spec.ts
```

### Folder ownership and import direction

```text
controller → dto + schemas + service
service    → dto + schemas + types + repository
repository → dto + schemas + types + database
tests      → the layer under test
```

- `dto/` describes transport shapes. DTOs contain no Prisma models or business rules.
- `schemas/` performs runtime validation. Never use a DTO or `as` as a validation bypass.
- `types/` contains shared feature types inferred from schemas or needed by service/repository
  contracts. Do not duplicate the same type in multiple folders.
- `tests/` contains focused tests for controller, service, repository, and schemas.

Do not create `application/`, `domain/`, `infrastructure/`, `presentation/`, `mappers/`,
`utils/`, or `helpers/` folders inside a feature. Put feature logic in `user.service.ts`,
feature persistence in `user.repository.ts`, and transformations in clearly named methods.

Generated Prisma files are infrastructure. Controllers translate HTTP input/output; they
must not contain business rules or direct Prisma queries. Dependency direction:

```text
controller → service → repository → database
     ↓          ↓          ↓
   dto      schemas      types
```

## SOLID workflow

1. Define the business capability, endpoint behavior, and failure cases.
2. Create the feature module; do not place feature code in `common`.
3. Define DTOs, Zod schemas, and shared feature types.
4. Implement business logic in the service and persistence in the repository.
5. Keep the controller as a thin HTTP adapter.
6. Test schemas, service behavior, repository mapping, and routes, then run typecheck, lint,
   and tests.

## Complete repository map

```text
apps/backend/
├── src/
│   ├── config/             # startup configuration and environment validation
│   ├── common/             # cross-feature transport/infrastructure concerns only
│   ├── database/           # Prisma module and database adapter
│   ├── generated/prisma/   # generated client; never edit manually
│   ├── health/             # isolated health/readiness feature
│   └── modules/            # business features created by `pnpm new:resource`
├── prisma/
│   ├── schema.prisma       # source of database model truth
│   └── migrations/         # generated, reviewed migration history
├── scripts/templates/      # source for generated resources
├── test/                   # full AppModule e2e tests; database allowed
├── package.json            # app-local commands and dependencies
└── docker-compose.yml      # local infrastructure only
```

Never put a feature in `common`. Never edit `generated/prisma/`. Never put business logic
in `main.ts`, `app.setup.ts`, a controller, a Prisma repository, or a migration. Update
`scripts/templates/resource/` when the resource pattern changes, then run
`pnpm check:templates`.

## Mandatory logic/transport/UI split

```text
HTTP request
    ↓
controller + Zod pipe (transport validation)
    ↓
service (business logic and orchestration)
    ↓
repository (Prisma/persistence access)
    ↓
HTTP response/error shape
```

Rules:

- Controllers parse input, call one use case, and map output. No business decisions,
  Prisma calls, loops over domain records, or persistence error handling.
- Services contain business logic and orchestrate the repository. They must not know HTTP
  decorators, response objects, or Prisma query syntax.
- Keep complex business rules in small private/pure functions inside the service or in
  `types/` when they are shared. No NestJS, Prisma, PostgreSQL, or network calls in those
  pure functions.
- Repositories own Prisma query syntax and row-to-API mapping. Keep database details out of
  controllers and services.
- Zod schemas validate external data at the boundary. Do not use `as` to bypass validation.
- `common/` contains reusable infrastructure only; a feature-specific rule stays in its
  feature module.
- Errors translate once: database error → repository/application error → HTTP error shape.
  Do not expose SQL, Prisma, stack traces, or raw exception text.

## Resource implementation sequence

1. Define the endpoint behavior, input/output types, business rules, and failure cases.
2. Generate the resource with `pnpm new:resource <singular> <plural>`.
3. Add/update the Prisma model and migration only for persisted data.
4. Define Zod schemas at the HTTP boundary.
5. Put transport types in `dto/`, runtime validation in `schemas/`, and shared types in
   `types/`.
6. Implement business logic in a focused service method and persistence in the repository.
7. Keep the controller as a thin route adapter.
8. Register the module in `app.module.ts`.
9. Test schemas and service behavior with fakes; test Prisma mapping separately; run e2e for
   the real AppModule and database.

## AI enforcement gate

Reject the change until all answers are yes:

- Can the service logic be tested with an in-memory repository and no database?
- Is every controller method thin enough to explain in one sentence?
- Does the repository hide Prisma details from the service and controller?
- Are validation, persistence, transport, and domain errors distinct?
- Are only `dto/`, `schemas/`, `types/`, and `tests/` used as internal folders?

If not, split the logic before adding more code. Do not hide violations behind a generic
`utils`, `base service`, `any`, or catch-all module.

## Route example: backend resource

Example API route: `GET /users`.

```text
src/modules/user/
├── user.controller.ts
├── user.service.ts
├── user.repository.ts
├── dto/list-user.dto.ts
├── schemas/list-user.schema.ts
├── types/user.types.ts
└── tests/user.controller.spec.ts
```

Request flow:

```text
GET /users?page=2&status=active
  → ZodValidationPipe parses and defaults query values
  → UserController.list(query)
  → UserService.list(listUserDto)
  → UserRepository.findMany(query)
  → repository translates query to Prisma and maps rows
  → controller returns { items, total, page, pageSize }
```

Example responsibilities:

```ts
// user.controller.ts: transport only
@Get()
list(@Query(new ZodValidationPipe(userQuerySchema)) query: UserQuery) {
  return this.userService.list(query)
}

// user.service.ts: business orchestration
list(query: ListUserDto) {
  return this.repository.findMany(query)
}

// user.repository.ts: persistence boundary
class UserRepository {
  findMany(query: UserListQuery): Promise<Paginated<User>>
}
```

The controller must not call Prisma. The service must not use `@Req`, `@Res`, HTTP status
codes, or Prisma syntax. DTOs must not contain persistence fields that the API does not
expose. Schemas must validate every external input. Types must be shared instead of copied.
For `POST /users`, repeat the boundary: validate request → service enforces invariants →
repository persists → controller maps the result. For `GET /users/:id`, validate the route
parameter at the boundary and translate a missing domain record to the standard HTTP error.

For every non-trivial change, identify responsibilities, dependency boundaries, and tests.
If the requested design violates SOLID, stop, explain the conflict, propose a compliant
design, and ask for an explicit local exception. Do not call work complete until relevant
type checks, lint, and tests pass.
