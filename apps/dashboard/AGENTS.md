# AI development rules

These rules apply only to this app.

## SOLID is mandatory

- **Single Responsibility:** keep UI, validation, data access, business rules, and
  infrastructure separate.
- **Open/Closed:** extend behavior through composition, strategies, adapters, or focused
  interfaces. Avoid growing large conditionals for every new case.
- **Liskov Substitution:** implementations must honor the complete contract of their
  abstraction and preserve its guarantees.
- **Interface Segregation:** keep component props, hooks, and interfaces focused. Do not
  force consumers to depend on unused fields or callbacks.
- **Dependency Inversion:** business logic depends on domain contracts, not React, Axios,
  browser APIs, or concrete infrastructure.

## Implementation rules

- Keep routes and components focused; move business rules into small, testable modules.
- Keep framework and HTTP wiring at the edge. Business logic must be testable without a
  browser or network.
- Inject external services instead of constructing them deep inside business logic.
- Do not add speculative abstractions, god components, god hooks, or duplicated logic.
- Preserve existing TypeScript, validation, state ownership, RTL, testing, and folder
  conventions.

## Folder structure

```text
src/
├── app/
│   ├── providers/
│   │   ├── app-providers.tsx
│   │   ├── query-provider.tsx
│   │   ├── theme-provider.tsx
│   │   └── locale-provider.tsx
│   ├── router/
│   │   ├── router.tsx
│   │   ├── router-context.ts
│   │   └── route-pending.tsx
│   ├── config/
│   │   ├── env.ts
│   │   └── app-config.ts
│   └── styles/
│       ├── globals.css
│       └── tokens.css
├── routes/
│   ├── __root.tsx
│   └── _app/
│       ├── route.tsx
│       └── index.tsx
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── query/
│   ├── services/
│   └── testing/
├── main.tsx
└── vite-env.d.ts
```

This is the base structure. Do not add `auth`, `permissions`, `i18n`, or other top-level
folders unless the feature is explicitly requested. Do not move feature code into `shared`.
Every generated page must use the feature structure below.

```text
route → queries → services → HTTP API
  ↓        ↓         ↓
schemas  cache    response schema
  ↓
components → user events → mutations → services
```

## SOLID workflow

1. Define the feature behavior and its single responsibility.
2. Choose the correct folder before writing code.
3. Define a small domain type or contract for external dependencies.
4. Implement the rule without React, Axios, or browser APIs.
5. Connect it through a route, hook, query, or component adapter.
6. Test the rule and the adapter boundary, then run typecheck, lint, and tests.

## Complete repository map

```text
apps/dashboard/
├── src/                    # production TypeScript and React code
├── e2e/                    # Playwright user journeys only
├── public/                 # files copied as-is to the web root
├── scripts/
│   └── templates/          # source for `pnpm new:page`; keep it production-valid
│       ├── page/            # generated route, UI, query, service, schema, tests
│       └── page-e2e/        # generated browser test
├── .changeset/             # release notes
├── package.json            # app-local commands and dependencies
└── vite.config.ts          # build/test/tool wiring
```

Never put application code in `scripts/`, `public/`, or `e2e/`. Never edit generated
`routeTree.gen.ts` by hand. Update the template when a generated page needs a new pattern,
then run `pnpm check:templates`.

## Mandatory logic/UI split

```text
URL + user event
      ↓
route (parse URL, preload, compose)
      ↓
query/mutation (cache policy, request lifecycle)
      ↓
service (HTTP only) → Zod schema (runtime boundary)
      ↓
query result → component (render state and emit user intent)
```

Rules:

- `routes/**` may compose dependencies, read route params, and choose loading/error
  boundaries. It must not contain Axios calls, table algorithms, business decisions, or
  toast calls.
- `components/**` may render props, collect input, and emit events. It must not fetch data,
  mutate the cache, read environment variables, or decide business policy.
- `services/**` may call HTTP and normalize transport failures. It must not import React,
  navigate, show toasts, or know cache policy.
- `queries/**` owns query keys, `queryOptions`, mutations, and invalidation. It must not
  render UI or contain domain rules.
- `schemas/**` owns runtime parsing and input/output contracts. It must not call APIs.
- `types.ts` owns feature types; do not duplicate the same type in route, service, and UI.
- Pure calculations belong in a named pure function inside the feature and must be unit
  tested. Do not place them inside JSX event handlers.

## Feature decision table

| Need | Put it in | Forbidden location |
|---|---|---|
| URL filter, sort, page | route search schema | component local state |
| Server data/cache | queries | `useEffect` + `useState` |
| Form input | component/form hook | service or route |
| API request | service | component or route |
| Cache invalidation | mutation/query module | service or component |
| Business rule | named pure feature function | JSX event handler |
| Success/error feedback | component | service |
| Reusable generic UI | `shared/components` | feature route file |

## AI enforcement gate

Before writing a feature, write a short responsibility map. Before finishing, reject the
change if any answer is false:

- Can the business rule run without React, Axios, or a browser?
- Does each module have one reason to change?
- Does every external dependency cross one explicit adapter boundary?
- Are URL state, server state, form state, and UI state owned by their defined owners?
- Are tests placed beside the rule or boundary they verify?

If a shortcut fails a gate, do not silently accept it. Split the module first or request a
documented exception.

## Required feature structure: example page

Every generated dashboard page must follow this structure. Replace `item` with the feature
name, but preserve the folders and responsibilities.

```text
src/routes/_app/example-page/
├── index.tsx
├── $itemId.tsx
├── components/
│   ├── item-table.tsx
│   ├── item-columns.tsx
│   ├── item-filter.tsx
│   ├── item-form.tsx
│   └── item-details.tsx
├── services/
│   ├── list-items.service.ts
│   ├── get-item.service.ts
│   ├── create-item.service.ts
│   ├── update-item.service.ts
│   └── delete-item.service.ts
├── queries/
│   ├── item.keys.ts
│   ├── item.queries.ts
│   └── item.mutations.ts
├── schemas/
│   ├── item-form.schema.ts
│   └── item-search.schema.ts
├── tests/
├── permissions.ts
└── types.ts
```

Do not add `item-page.tsx`, `item-actions.tsx`, or extra feature folders unless the feature
needs them and the responsibility cannot stay in the listed files. Do not put API calls in
components or route files.

## Example page flow

```text
URL /example-page?page=2&search=phone
  → index.tsx validates item-search.schema.ts
  → item.queries.ts loads list-items.service.ts
  → item-table.tsx renders server data
  → item-filter.tsx updates URL search params
  → item-form.tsx validates item-form.schema.ts
  → item.mutations.ts calls create/update/delete service
  → mutation invalidates item.keys.ts
  → UI displays success/error feedback
```

Detail flow:

```text
URL /example-page/:itemId
  → $itemId.tsx reads the typed route parameter
  → item.queries.ts calls get-item.service.ts
  → item-details.tsx renders the result
  → update/delete actions use item.mutations.ts
```

Responsibilities:

- `index.tsx` and `$itemId.tsx`: route params, search params, preload, and composition only.
- `components/`: UI rendering, form input, table interaction, and emitted user events.
- `services/`: HTTP requests only. No React, navigation, toasts, or cache invalidation.
- `queries/`: query keys, query options, mutations, and cache invalidation.
- `schemas/`: runtime validation for forms, search params, and API data.
- `permissions.ts`: feature permission declarations and checks only.
- `types.ts`: shared feature types; do not duplicate types in components or services.
- `tests/`: tests for each feature boundary.

Example route composition:

```tsx
export const Route = createFileRoute('/_app/example-page/')({
  validateSearch: itemSearchSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(itemListQuery(deps.search)),
  component: ExamplePage,
})

function ExamplePage() {
  return <ItemTable />
}
```

The route must not contain the fetch implementation, table sorting algorithm, form
submission rules, toast calls, or business decisions. Business rules must remain testable
without React, Axios, or a browser.

Feature tests belong in `tests/`, for example:

```text
tests/
├── item-form.test.tsx
├── item-search.schema.test.ts
├── item.queries.test.ts
├── item.mutations.test.tsx
└── item-details.test.tsx
```

The generator and its template must preserve this structure. After changing the template,
run `pnpm check:templates` and verify the generated route tree.

For every non-trivial change, identify responsibilities, dependency boundaries, and tests.
If the requested design violates SOLID, stop, explain the conflict, propose a compliant
design, and ask for an explicit local exception. Do not call work complete until relevant
type checks, lint, and tests pass.
