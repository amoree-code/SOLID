# Build context is this repo's root:
#   docker build -t backend apps/backend

FROM node:22-alpine AS base
RUN corepack enable

# ---- deps ----
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---- build: compile TS, generate the Prisma client, prune to prod deps ----
FROM deps AS build
COPY . .
RUN pnpm db:generate
RUN pnpm build
RUN pnpm prune --prod

# ---- runtime: the pruned app as-is (dist + generated Prisma client + prod deps) ----
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app ./
USER app
EXPOSE 3000
CMD ["node", "dist/main.js"]
