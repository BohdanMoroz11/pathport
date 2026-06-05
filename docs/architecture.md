# Architecture

This document captures the technical direction for Pathport — the high-level
constraints are intentional, but details evolve as implementation reveals better
ones.

## Core Shape

Pathport is a pnpm workspace monorepo with a separate frontend and backend that
communicate over HTTP. Core product behavior lives in the API, not in Next.js
route handlers, so the data and contracts stay framework-agnostic.

- `apps/web`: Next.js App Router frontend.
- `apps/api`: NestJS backend API.
- `packages/db`: schema, migrations, and data-access primitives (Drizzle).
- `packages/contracts`: shared request/response types, independent of the db layer.
- `packages/config`: shared environment/config helpers.

See [repository-structure.md](repository-structure.md) for the layout in detail.

## Chosen Stack

- Frontend: Next.js App Router, Tailwind CSS with local component primitives.
- Backend: NestJS.
- Database: Postgres with Drizzle for schema and migrations.
- Lint/format: Biome.
- Tests: Vitest + React Testing Library, Playwright (E2E), axe-core (a11y),
  Lighthouse CI (perf/SEO). See [testing.md](testing.md).
- CI: GitHub Actions. Deployment: self-hosted, through CI.

## Why NestJS

NestJS is chosen for backend showcase value: a recognizable production-style
structure with modules, controllers, providers, dependency injection, and
validation, with testable boundaries. The tradeoff is more boilerplate than
Fastify or Hono, which is acceptable because Pathport is portfolio-first and
should demonstrate backend architecture clearly.

The main thing to keep in mind: NestJS relies on TypeScript decorators and
emitted metadata, so the backend `tsconfig` keeps `experimentalDecorators` and
`emitDecoratorMetadata` on, and Biome may need narrow exceptions for
decorator-heavy code — added only where the code proves they are necessary.

## Horizontal Scaling Principles

Pathport should be compatible with multiple web and API replicas from day one,
even before any orchestration exists. This is about not needing a rewrite later,
not about deploying replicas now.

- Keep the API stateless: no sessions, caches, locks, or job state in process memory.
- Store persistent state in Postgres or a dedicated external service.
- Configure at runtime via environment variables.
- Expose health and readiness endpoints, and support graceful shutdown.
- Keep migrations explicit and repeatable; design any later background work
  around an external queue.
- Use structured logs and request IDs.

## Testing

Testing is a first-class feature, covered in [testing.md](testing.md): the
layers, coverage targets, the Lighthouse budget, and the rule that backend
integration tests run against a real Postgres rather than mocks.

If implementation shows one of these assumptions is wrong, update this document
in the same change.
