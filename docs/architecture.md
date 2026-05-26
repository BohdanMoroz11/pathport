# Architecture

Status: Draft decision record

This document captures the initial technical direction for Pathport. It should evolve as implementation reveals better details, but the high-level constraints are intentional.

## Core Shape

Pathport should use a separate frontend and backend.

Initial monorepo shape:

- `apps/web`: Next.js frontend
- `apps/api`: NestJS backend API
- `packages/db`: database schema, migrations, and data-access primitives
- `packages/contracts`: shared API contracts, schemas, and DTO types where useful
- `packages/config`: shared environment/config helpers
- `packages/testing`: shared test utilities when repetition appears

The frontend should communicate with the backend over HTTP. Avoid hiding core product behavior inside Next.js route handlers unless there is a narrow frontend-specific reason.

## Chosen Stack

- Monorepo/package manager: pnpm workspaces
- Frontend: Next.js App Router
- Backend: NestJS
- Database: Postgres
- ORM/schema tooling: Drizzle
- Styling: Tailwind CSS with local component primitives
- Lint/format: Biome, unless a framework constraint forces a narrow exception
- Unit/component tests: Vitest and React Testing Library
- Browser/E2E tests: Playwright
- Accessibility tests: axe-core integration
- Performance/SEO audits: Lighthouse CI
- CI: GitHub Actions
- Deployment: self-hosted later, deployed through CI

## Why NestJS

NestJS is chosen for backend showcase value. It gives the backend a recognizable production-style structure with modules, controllers, providers, dependency injection, validation, and testable boundaries.

Tradeoffs:

- More boilerplate than Fastify or Hono.
- Decorators and metadata may need careful Biome/framework configuration.
- The structure is worth it here because Pathport is portfolio-first and should demonstrate backend architecture clearly.

## Horizontal Scaling Principles

Pathport should be compatible with multiple web and API replicas from day one, even before orchestration such as Kubernetes or Docker Swarm exists.

Rules:

- Keep the API stateless.
- Do not store sessions, user state, caches, locks, or background job state in process memory.
- Store persistent state in Postgres or a dedicated external service.
- Use environment variables for runtime configuration.
- Add health and readiness endpoints.
- Make database migrations explicit and repeatable.
- Use structured logs and request IDs.
- Support graceful shutdown.
- Design background work, if added later, around an external queue.
- Avoid assuming a single running API instance.

Phase 0 does not need real multi-replica deployment. It needs architecture and local setup that will not require a rewrite when multi-replica deployment is introduced.

## Testing Strategy

Testing is a first-class project feature, not an afterthought. Use test-driven development where practical, especially for business logic, data modeling, API behavior, and reusable UI components.

Coverage target for v1:

- Minimum global coverage: 60%
- Higher coverage expected for critical domain logic, API services, contracts, and data mappers
- Exclude generated files, build artifacts, framework bootstrap, and pure styling glue from coverage thresholds

Frontend testing layers:

- Unit tests for utilities, mappers, hooks, validators, and small pure functions.
- Component tests for reusable interactive UI with React Testing Library.
- Integration tests for frontend flows that combine state, routing, API calls, and UI behavior.
- E2E tests with Playwright for core user journeys.
- Accessibility checks with axe-core for key pages/components.
- Lighthouse CI audits for performance, accessibility, best practices, SEO, and PWA-relevant checks where applicable.

Frontend quality targets:

- Lighthouse score target for v1: 90 or higher for relevant categories.
- Prefer user-visible behavior tests over implementation-detail tests.
- Prefer role/name selectors and accessible queries.

Backend testing layers:

- Unit tests for services, validators, mappers, and domain logic.
- Integration tests for modules and controllers.
- API/e2e tests against the NestJS HTTP server.
- Database integration tests against a real Postgres database.

Backend testing rules:

- Do not mock the database for integration/API tests.
- Use isolated test database setup and repeatable migrations/seeding.
- Keep mocks for true external services only.
- Validate real request/response behavior and error handling.

## CI Expectations

GitHub Actions should eventually run:

- install
- typecheck
- Biome check
- unit/integration tests
- coverage
- build
- Playwright E2E tests
- accessibility checks
- Lighthouse CI

The exact CI split can evolve, but Phase 0 should establish the foundation for this pipeline.

