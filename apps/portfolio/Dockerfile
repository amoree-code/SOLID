# Build context is the REPO ROOT (this is a pnpm workspace):
#   docker build -f apps/portfolio/Dockerfile -t solid-portfolio .

FROM node:22-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /repo
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/dashboard/package.json apps/dashboard/package.json
COPY apps/portfolio/package.json apps/portfolio/package.json
RUN pnpm install --frozen-lockfile --filter portfolio...

FROM deps AS build
COPY apps/portfolio apps/portfolio
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN pnpm --filter portfolio build

# ---- runtime: Next's standalone output only — no node_modules copy needed ----
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /repo/apps/portfolio/.next/standalone ./
COPY --from=build --chown=app:app /repo/apps/portfolio/.next/static ./apps/portfolio/.next/static
COPY --from=build --chown=app:app /repo/apps/portfolio/public ./apps/portfolio/public
USER app
EXPOSE 3000
CMD ["node", "apps/portfolio/server.js"]
