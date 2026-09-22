# Build context is the REPO ROOT (this is a pnpm workspace):
#   docker build -f apps/backend/Dockerfile -t solid-backend .

FROM node:22-alpine AS base
RUN corepack enable

# ---- deps: install only what apps/backend needs, at the workspace root ----
FROM base AS deps
WORKDIR /repo
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/dashboard/package.json apps/dashboard/package.json
COPY apps/portfolio/package.json apps/portfolio/package.json
RUN pnpm install --frozen-lockfile --filter backend...

# ---- build: compile TS, generate the Prisma client ----
FROM deps AS build
COPY apps/backend apps/backend
RUN pnpm --filter backend db:generate
RUN pnpm --filter backend build

# ---- deploy: prune to a standalone, production-only app folder ----
FROM build AS deploy
RUN pnpm --filter backend deploy --prod --legacy /app

# ---- runtime: nothing but the pruned app ----
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=deploy --chown=app:app /app ./
USER app
EXPOSE 3000
CMD ["node", "dist/main.js"]
