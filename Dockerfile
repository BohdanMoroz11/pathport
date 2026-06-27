# syntax=docker/dockerfile:1

# Production images for the Pathport stack. A single multi-stage build shares
# one dependency install and one compile across the API, the web app, and the
# one-shot database seeder, so the three runtime images stay in lockstep.
#
# Targets:
#   api   - NestJS server (node dist/main.js)
#   web   - Next.js standalone server
#   seed  - one-shot: resets + seeds the database, then exits
#
# Dev still runs on the host (pnpm dev + pnpm db:up); these images are the
# production stack that docker-compose.prod.yml and Lighthouse exercise.

# Shared base: pinned Node plus pnpm via corepack.
FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo

# deps: install the whole workspace (dev deps included, needed to build) from
# manifests only, so this layer caches until a package.json or the lockfile
# changes rather than on every source edit.
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/config/package.json packages/config/
COPY packages/contracts/package.json packages/contracts/
COPY packages/db/package.json packages/db/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# build: compile the shared packages, the API, and the web standalone bundle.
FROM deps AS build
COPY . .
RUN pnpm build:packages \
  && pnpm --filter @pathport/api build \
  && pnpm --filter @pathport/web build

# api-deploy: pnpm deploy flattens the API plus its workspace packages into a
# self-contained tree carrying only production dependencies.
FROM build AS api-deploy
RUN pnpm --filter @pathport/api deploy --prod --legacy /deploy/api

# api: minimal NestJS runtime. API_HOST/API_PORT/DATABASE_URL come from compose.
FROM base AS api
ENV NODE_ENV=production
WORKDIR /app
COPY --from=api-deploy /deploy/api ./
USER node
EXPOSE 4311
CMD ["node", "dist/main.js"]

# web: Next.js standalone output. The server reads PORT/HOSTNAME from the env;
# static assets and public/ are not part of standalone, so copy them alongside.
FROM base AS web
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /repo/apps/web/public ./apps/web/public
USER node
EXPOSE 4310
CMD ["node", "apps/web/server.js"]

# seed: one-shot data load. Seeding runs through tsx + drizzle-kit (dev tooling),
# so it reuses the full build stage rather than a pruned runtime.
FROM build AS seed
CMD ["pnpm", "--filter", "@pathport/db", "db:seed"]
