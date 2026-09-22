# SOLID Portfolio

A lean Next.js foundation for a personal portfolio/site — not a finished portfolio, a starting
point with the structure already right.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS 4 |
| Lint/format | Biome |
| Unit tests | Vitest + Testing Library |
| E2E | Playwright |

## Getting started

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Then edit **one file**: `src/content/profile.ts`. Every section reads from it — the name,
role, bio, projects, and contact links shown on the page all come from there, nothing is
hardcoded into a component.

## Structure

```text
src/
├── app/
│   ├── layout.tsx    # metadata, fonts, <html>/<body>
│   ├── page.tsx        # composes the sections below
│   ├── sitemap.ts        # /sitemap.xml
│   └── robots.ts          # /robots.txt
├── components/
│   ├── layout/              # header/footer — site chrome
│   ├── sections/             # hero/projects/contact — page content
│   └── ui/                    # Section: the one place that owns spacing/width
└── content/
    └── profile.ts               # all copy — name, bio, projects, links
```

Content lives separately from presentation on purpose: a section component only knows how
to render a `Profile`/`Project`/`Link`, never the literal text — so updating your bio,
adding a project, or changing a link never touches a component file.

## Adding a new section

1. Add whatever data it needs to `src/content/profile.ts` (and its type).
2. Add `src/components/sections/<name>-section.tsx`, taking that data as props — follow
   `hero-section.tsx` as the simplest example.
3. Render it from `src/app/page.tsx`.

## Testing

Same split as the other apps in this repo: `e2e/unit/` (Vitest + Testing Library, mirrors
`src/`) for component-level tests, `e2e/flows/` (Playwright) for the one thing worth
checking end-to-end here — that the page actually renders its sections.

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build (static-prerendered) |
| `pnpm typecheck` / `pnpm lint` / `pnpm lint:ci` | As in the other apps |
| `pnpm test` | Vitest (`e2e/unit/`) |
| `pnpm e2e` | Playwright (`e2e/flows/`) — builds and serves the app first |
| `pnpm verify` | typecheck → lint → test → build → e2e |
