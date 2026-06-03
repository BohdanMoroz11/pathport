# Testing

Status: Draft

Testing is a first-class part of Pathport because the project is meant to demonstrate production-quality engineering.

## Targets

- v1 global coverage target: 60%
- Lighthouse CI target for v1: 90 or higher for performance, accessibility, best practices, and SEO
- E2E coverage for core user journeys
- Backend integration/API tests use real Postgres for database-backed behavior

## Commands

- `pnpm test`: run unit/component/integration tests across workspaces.
- `pnpm test:coverage`: run coverage across workspaces.
- `pnpm test:e2e`: run Playwright browser tests.
- `pnpm lighthouse`: build, seed the DB, then run Lighthouse CI end to end (the local one-shot).
- `pnpm lhci`: run Lighthouse CI alone, assuming a production build and a seeded DB already exist.
- `pnpm start:stack`: boot the production API + web stack (built API + `next start`) for manual testing, perf work, or any tooling that needs a live production app.

## Frontend Layers

- Unit tests for utilities and pure logic.
- Component tests with React Testing Library.
- Accessibility checks with `jest-axe` for component-level tests.
- E2E and page-level accessibility checks with Playwright and axe-core.
- Lighthouse CI for performance, accessibility, best practices, and SEO budgets.

### Running the production stack

The explorer pages are server-rendered and fetch from the API at request time,
so exercising the real production app means bringing up the whole chain: a
seeded DB, the built API, and `next start` — not the dev servers.

`scripts/start-stack.mjs` orchestrates that: it boots the built API (waiting on
`/ready`, which verifies the database), then `next start`, then prints a
`STACK READY` line and stays up until interrupted. Run it with `pnpm start:stack`
(after `pnpm build` and a seed) for manual or perf testing against production
behavior.

Lighthouse is one consumer of that script. It only produces meaningful numbers
against a production build — never `next dev` (unminified bundles, the dev React
runtime) — so `lighthouserc.cjs` drives the stack via `start-stack.mjs`, waits
on the `STACK READY` line, audits, and tears it down. CI seeds the DB and passes
`DATABASE_URL` to the same flow; locally, `pnpm lighthouse` builds and seeds
first, then runs it.

## Backend Layers

- Unit tests for services and domain logic.
- Module/controller tests with NestJS testing utilities.
- API tests against the Nest application HTTP server.
- Real Postgres-backed tests once database-backed behavior is introduced.

## Notes

- Prefer user-visible behavior over implementation details.
- Keep generated files, framework bootstrap, and styling-only glue out of coverage pressure.
- Mock true external services only. Do not mock the database for backend integration/API tests.
