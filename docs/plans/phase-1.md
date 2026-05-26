# Phase 1: First Product Slice

Status: Draft

Branch: phase-1

## Goal

Build the first usable Pathport product slice on top of the Phase 0 foundation.

Phase 1 should turn the scaffold into a small working explorer: a narrow, source-aware dataset; read-only API endpoints; and a polished frontend flow that demonstrates the core product idea without trying to become a complete immigration database.

## Why This Phase Exists

Phase 0 proves the engineering foundation. Phase 1 should prove the product experience.

The goal is not broad coverage. The goal is a vertical slice that feels real enough to demo: structured migration route data flowing from Postgres, through the NestJS API, into a clean Next.js interface with tests around the important behavior.

## S1: MVP Slice Definition

Status: Not started

Decide the narrow product slice for Phase 1.

Likely tasks:

- [ ] Choose the first citizenship scenario or demo audience.
- [ ] Choose the first destination-country set.
- [ ] Choose route types for the first slice.
- [ ] Decide what data is real, demo, AI-assisted draft, or intentionally omitted.
- [ ] Move answered questions out of [future-product-scope.md](future-product-scope.md).
- [ ] Document the Phase 1 MVP scope.

## S2: Domain Schema And Seed Data

Status: Not started

Extend the Phase 0 database foundation into the minimum shape needed for the first product slice.

Likely tasks:

- [ ] Refine schema fields for route cards and route details.
- [ ] Add migrations for any schema changes.
- [ ] Add seed workflow.
- [ ] Add small curated seed dataset.
- [ ] Add real Postgres-backed tests for schema and seed behavior.

## S3: Read API

Status: Not started

Expose the first read-only API endpoints from NestJS.

Likely tasks:

- [ ] Add API contracts for country and route summaries.
- [ ] Add route listing endpoint.
- [ ] Add route detail endpoint.
- [ ] Add source/review metadata to responses.
- [ ] Add API integration tests against real Postgres.

## S4: Web Explorer UI

Status: Not started

Build the first frontend experience around the read API.

Likely tasks:

- [ ] Add application shell and navigation.
- [ ] Add citizenship/destination/route browsing flow.
- [ ] Add route cards.
- [ ] Add route detail view.
- [ ] Add visible source/review metadata.
- [ ] Preserve responsive layout and accessibility from the start.

## S5: Quality Pass

Status: Not started

Keep the showcase quality bar high while the first product slice lands.

Likely tasks:

- [ ] Keep coverage at or above the v1 60% threshold.
- [ ] Add frontend component/integration tests for the explorer flow.
- [ ] Add Playwright coverage for the primary user journey.
- [ ] Keep axe checks passing.
- [ ] Keep Lighthouse CI at 90+ for relevant categories.
- [ ] Update docs and plan status as scope changes.

## Exit Criteria

Phase 1 is done when:

- the first product slice is documented
- the database contains a small curated dataset
- the API exposes read-only route/country data
- the web app renders the first explorer flow from API data
- route cards and details include source/review metadata
- tests, coverage, E2E, accessibility, Lighthouse, typecheck, and build pass
- Phase 2 has a draft plan

## Open Questions

- What exact citizenship scenario should Phase 1 start with?
- Should Phase 1 use only real sourced data, or allow clearly labeled demo/AI-assisted draft data?
- How many destination countries are enough for a compelling demo?
- Should the first UI be destination-first, route-first, or citizenship-first?

## Notes

- Keep Phase 1 small enough to finish.
- Prefer a narrow polished experience over broad shallow coverage.
- Any product decision that affects future phases should be written into docs, not only discussed in chat.
