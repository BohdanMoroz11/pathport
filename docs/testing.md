# Testing

Testing is a first-class part of Pathport because the project is meant to demonstrate production-quality engineering.

## Targets

- v1 global coverage target: 60%
- Lighthouse CI target for v1: 90 or higher for performance, accessibility, best practices, and SEO
- E2E coverage for core user journeys
- Backend integration/API tests use real Postgres for database-backed behavior

See the [README scripts table](../README.md#scripts) for the test and Lighthouse
commands.

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

- Unit tests for services and domain logic.
- Module/controller tests with NestJS testing utilities.
- API tests against the Nest application HTTP server.
- Real Postgres-backed tests once database-backed behavior is introduced.

## Notes

- Prefer user-visible behavior over implementation details.
- Keep generated files, framework bootstrap, and styling-only glue out of coverage pressure.
- Mock true external services only. Do not mock the database for backend integration/API tests.
