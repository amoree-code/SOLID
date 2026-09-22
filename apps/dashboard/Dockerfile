# Build context is the REPO ROOT (this is a pnpm workspace):
#   docker build -f apps/dashboard/Dockerfile -t solid-dashboard .

FROM node:22-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /repo
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/dashboard/package.json apps/dashboard/package.json
COPY apps/portfolio/package.json apps/portfolio/package.json
RUN pnpm install --frozen-lockfile --filter dashboard...

FROM deps AS build
COPY apps/dashboard apps/dashboard
# VITE_API_BASE_URL is baked into the static bundle at build time — pass it
# with --build-arg to point this image at the right backend.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN pnpm --filter dashboard build

# ---- runtime: a static file server, nothing else ----
FROM nginx:1.27-alpine AS runtime
COPY --from=build /repo/apps/dashboard/dist /usr/share/nginx/html
# SPA routing: unknown paths fall back to index.html, TanStack Router takes it from there.
RUN printf 'server { listen 80; root /usr/share/nginx/html; location / { try_files $uri /index.html; } }' \
  > /etc/nginx/conf.d/default.conf
EXPOSE 80
