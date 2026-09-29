<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AI development rules

These rules apply only to this app.

## SOLID is mandatory

- **Single Responsibility:** keep presentation, content, SEO, data loading, and
  infrastructure separate.
- **Open/Closed:** extend behavior through composition and focused interfaces instead of
  growing large conditionals.
- **Liskov Substitution:** implementations must honor the complete contract of their
  abstraction and preserve its guarantees.
- **Interface Segregation:** keep component props and helpers focused; avoid unused
  dependencies.
- **Dependency Inversion:** application logic depends on contracts, not Next.js, browser
  APIs, or concrete infrastructure.

## Implementation rules

- Keep pages and components focused; move business rules into small, testable modules.
- Keep Next.js and browser wiring at the edge.
- Inject external services instead of constructing them deep inside business logic.
- Do not add speculative abstractions, god components, or duplicated logic.
- Preserve existing TypeScript, responsive, accessibility, SEO, and testing conventions.

## Folder structure

```text
src/
├── app/                    # Next.js routing, metadata, and global styles
├── components/
│   ├── layout/             # site-wide header and footer
│   ├── sections/           # page sections composed from smaller components
│   └── ui/                 # reusable visual primitives
├── content/                # portfolio content and typed data
└── lib/                    # pure helpers, SEO, class names, structured data
```

Keep content separate from rendering. Keep SEO and structured-data helpers in `lib`,
reusable visuals in `components/ui`, and page composition in `app` or `components/sections`.
Dependency direction:

```text
page → section → UI component
  ↓       ↓
content → pure lib helper
```

## SOLID workflow

1. Decide whether the change is content, presentation, page composition, SEO, or a pure
   helper.
2. Put it in the matching folder; do not place unrelated logic in `page.tsx`.
3. Keep components driven by focused props and typed content.
4. Keep helpers pure and independent from Next.js when possible.
5. Test accessibility, responsive behavior, metadata, and helper behavior as applicable.
6. Run typecheck, lint, and tests before completion.

## Complete repository map

```text
apps/portfolio/
├── src/
│   ├── app/                # Next.js routes, metadata, global CSS, static endpoints
│   ├── components/
│   │   ├── layout/         # site chrome shared by pages
│   │   ├── sections/       # page-level compositions
│   │   └── ui/             # reusable visual primitives
│   ├── content/            # typed portfolio data and copy
│   └── lib/                # pure helpers, SEO, structured data, class names
├── public/                 # static assets referenced by URL
├── e2e/
│   ├── unit/               # Vitest component/lib tests mirroring src
│   └── flows/              # Playwright user and SEO flows
├── package.json            # app-local commands and dependencies
└── next.config.ts          # Next.js build configuration
```

Do not put copy in JSX, business/data transformation in UI components, or browser-only
code in `lib`. Keep `public/` passive. Keep tests aligned with the layer they verify.

## Mandatory logic/UI split

```text
content/profile.ts (typed data)
             ↓
app/page.tsx (page composition only)
             ↓
section component (layout + semantic markup)
             ↓
UI primitive (visual behavior from props)
             ↓
lib helper (pure transformation/SEO utility)
```

Rules:

- `app/page.tsx` composes sections and passes data. It must not contain large markup blocks,
  copy, filtering logic, or reusable business decisions.
- `components/sections/**` owns section layout and accessibility structure. It receives typed
  props and must not import `profile.ts` directly when the page can pass the data.
- `components/ui/**` owns reusable visual behavior only. It must not know portfolio content,
  routes, SEO, or page-specific business rules.
- `content/**` owns copy and typed content models. It must not import React or Next.js.
- `lib/**` contains pure helpers. It must not read component state or mutate global state.
- `app/layout.tsx`, sitemap, robots, and Open Graph files own framework SEO boundaries;
  reusable structured-data generation belongs in `lib`.
- Event handlers may coordinate UI state, but repeated calculations belong in pure helpers.

## Section implementation sequence

1. Define the content type and add data to `content/profile.ts`.
2. Define the section responsibility and its focused props.
3. Add the smallest reusable UI primitive only if two consumers need it.
4. Implement semantic, responsive section markup with no hardcoded content.
5. Keep calculations in pure `lib` functions and test them separately.
6. Compose the section from `app/page.tsx`.
7. Test component behavior, accessibility, responsive states, and relevant SEO output.

## AI enforcement gate

Reject the change until all answers are yes:

- Can content change without editing the section component?
- Can the section render from props without importing global content or routing state?
- Can each UI primitive be reused with unrelated data?
- Are SEO transformations testable without rendering a page?
- Does each file have one clear reason to change?

If not, split content, composition, presentation, and pure logic before continuing. Do not
solve a component problem with a global helper, giant prop object, or duplicated markup.

## Route examples

Portfolio routes are Next.js App Router folders under `src/app/`:

```text
src/app/
├── layout.tsx              # root layout, metadata, fonts
├── page.tsx                # GET / homepage composition
├── sitemap.ts              # GET /sitemap.xml
├── robots.ts               # GET /robots.txt
└── opengraph-image.tsx     # generated social image route
```

Homepage flow:

```text
GET /
  → src/app/layout.tsx sets document and metadata
  → src/app/page.tsx reads typed profile content
  → page composes HeroSection, ProjectsSection, ContactSection
  → sections render focused UI primitives
  → lib helpers generate classes and structured data
```

Example:

```tsx
// src/app/page.tsx: composition only
import { profile } from '@/content/profile'

export default function HomePage() {
  return (
    <main>
      <HeroSection profile={profile} />
      <ProjectsSection projects={profile.projects} />
      <ContactSection contact={profile.contact} />
    </main>
  )
}
```

Adding `/about` means creating `src/app/about/page.tsx`, then composing existing sections
or adding a focused section component. Do not copy the entire homepage into the new route.
Route files choose content and composition; they do not own reusable markup, hardcoded copy,
SEO transformation logic, or unrelated state. A route-specific server data fetch belongs at
the route boundary and must pass typed data into components; rendering components stay
independent from the fetch mechanism.

For every non-trivial change, identify responsibilities, dependency boundaries, and tests.
If the requested design violates SOLID, stop, explain the conflict, propose a compliant
design, and ask for an explicit local exception. Do not call work complete until relevant
type checks, lint, and tests pass.
