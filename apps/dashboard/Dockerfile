# Build context is this repo's root:
#   docker build -t dashboard apps/dashboard

FROM node:22-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
# VITE_API_BASE_URL is baked into the static bundle at build time — pass it
# with --build-arg to point this image at the right backend.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN pnpm build

# ---- runtime: a static file server, nothing else ----
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
# SPA routing: unknown paths fall back to index.html, TanStack Router takes it from there.
RUN printf 'server { listen 80; root /usr/share/nginx/html; location / { try_files $uri /index.html; } }' \
  > /etc/nginx/conf.d/default.conf
EXPOSE 80
