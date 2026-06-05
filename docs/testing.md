# Testing

Testing is a first-class part of Pathport because the project is meant to demonstrate production-quality engineering.

## Targets

- v1 global coverage target: 60%
- Lighthouse CI target for v1: 90 or higher for performance, accessibility, best practices, and SEO
- E2E coverage for core user journeys
- Backend integration/API tests use real Postgres for database-backed behavior

See the [README scripts table](../README.md#scripts) for the test and Lighthouse
commands.

## Test Tiers

Tests are split into three tiers by how heavy they are. **Keep them separate** —
the fast tier must stay runnable without Docker.

| Tier | Needs Docker? | File name | Runner | Command |
| --- | --- | --- | --- |
| Unit | no | `*.test.ts(x)` | Vitest | `pnpm test` |
| Integration | yes (real Postgres) | `*.integration.test.ts` | Vitest + Testcontainers | `pnpm test:integration` |
| E2E | yes (full app stack) | `tests/e2e/*.spec.ts` | Playwright | `pnpm test:e2e` |

Rules that keep the split honest:

- **A DB-backed test MUST be named `*.integration.test.ts`, never plain
  `*.test.ts`.** The unit tier excludes the integration glob, so a misnamed
  Testcontainers test would silently make `pnpm test` require Docker — exactly
  the mess this convention prevents.
- The unit/integration split is implemented with Vitest
  [projects](../packages/db/vitest.config.ts): `pnpm test` runs `--project unit`,
  `pnpm test:integration` runs `--project integration`.
- `pnpm test:coverage` runs **both** projects, because the 60% thresholds depend
  on the integration tests covering the API's DB-backed services. So coverage
  needs Docker; the plain `pnpm test` does not.
- `pnpm test:all` runs all three tiers in order.
- Integration tests share one bootstrap. The API harness
  ([apps/api/src/testing/test-app.ts](../apps/api/src/testing/test-app.ts))
  starts the container, prepares the schema, and boots Nest; the db tier uses the
  helpers exported from [`@pathport/db/testing`](../packages/db/src/testing.ts).
  Add new DB setup there rather than re-rolling container boilerplate per file.

## Frontend Layers

- Unit tests for utilities and pure logic.
- Component tests with React Testing Library.
- Accessibility checks with `jest-axe` for component-level tests.
- E2E and page-level accessibility checks with Playwright and axe-core.
- Lighthouse CI for performance, accessibility, best practices, and SEO budgets.

### Running the production stack

Lighthouse only produces meaningful numbers against a production build, never the
dev server. So it audits the Docker Compose production stack (database, built API,
Next.js server) rather than `next dev`. The stack is brought up by Compose gated
on container healthchecks, then `lhci` audits the running app. See the
[production stack section in the README](../README.md#production-stack).

## Backend Layers

Test at the altitude where the behavior actually lives — don't mirror every class
with a test file:

- **Unit-test pure logic**: mappers, pipes, formatters, and domain helpers
  (e.g. [route.mapper.ts](../apps/api/src/routes/route.mapper.ts),
  [country-code.pipe.ts](../apps/api/src/common/country-code.pipe.ts)). These have
  branches and edge cases (null handling, coercion) that seed data won't exercise,
  and they need no database.
- **Integration-test DB-backed endpoints**: services that are mostly Drizzle
  queries, and the controllers/routing, are covered through real HTTP against a
  real Postgres (the `*.integration.test.ts` files), not by mocking the client.

Two anti-patterns this avoids:

- **Don't unit-test a thin service/controller by mocking the database** — it only
  asserts which query-builder methods were called, which is brittle and proves
  nothing. Cover it with an integration test instead.
- **Don't write tests that only assert constants or framework wiring** (e.g. a
  controller delegating to its service). If removing the test wouldn't fail on any
  real regression, it is not pulling its weight.

So a piece of pure logic without a unit test is a gap; a thin DB-backed service
without its own unit test is correct by design.

## Notes

- Prefer user-visible behavior over implementation details.
- Keep generated files, framework bootstrap, and styling-only glue out of coverage pressure.
- Mock true external services only. Do not mock the database for backend integration/API tests.
