# Phase 1: Product Foundation Slice

Status: In progress

Branch: phase-1

## Goal

Turn the Phase 0 scaffold into the first working Pathport application foundation.

Phase 1 should establish the main domain database structure, read API, and citizenship-first web explorer UI. It should include a small amount of clearly demo-grade data so the full flow can be developed, tested, and shown end to end, but real content coverage is not the goal of this phase.

## Why This Phase Exists

Phase 0 proves the engineering foundation. Phase 1 should prove that the core Pathport system shape works.

The priority is a unified foundation that can be filled with real immigration data over time: structured tables, source/review metadata, API contracts, route browsing, route details, and a polished frontend flow. Demo data exists to exercise the system, not to make Phase 1 comprehensive or authoritative.

## Scope Decisions

Phase 1 uses these decisions unless later implementation reveals a better adjustment:

- Primary flow: citizenship-first.
- Demo citizenship: United States.
- Demo destinations: Germany, Portugal, and Spain.
- Route taxonomy: start with work, study, family, freelance/self-employed, business/investment, humanitarian/protection, long-term residence, and other; keep the model open to additional categories as real immigration paths are explored.
- Arrival context: include visa-free stay, visitor, or initial arrival information when useful, but treat it as supporting context rather than the main organizing purpose.
- Data quality: use realistic-ish local placeholder data that is good enough to build and test the foundation, with clear demo or needs-review labels.
- Product priority: main database structure, API, and UI foundation.
- Secondary priority: polished enough frontend and testing to remain portfolio-quality.
- Not a Phase 1 goal: deep official-source research, complete country coverage, or production-ready immigration guidance.

## Initial Schema Direction

Use a hybrid model for Phase 1.

Normalize the concepts that are stable, queryable, and central to the UI:

- citizenships
- destination countries
- immigration routes
- route types
- route-to-citizenship applicability
- route sources
- review/status metadata
- high-level comparison fields such as work permission, family inclusion, estimated cost, estimated timeline, renewability, and path-to-permanent-residence signals

Keep route-specific details flexible at first:

- requirement groups
- document lists
- caveats
- step-by-step process notes
- eligibility notes
- initial-arrival or visa-free-stay context

Those flexible fields should start as structured JSON or a small related block table, depending on what is easiest to validate and render cleanly. Avoid over-normalizing requirements before the project has enough real routes to show which fields repeat consistently.

The Phase 1 schema should be easy to query for the citizenship-first UI while staying flexible enough to absorb real data later without a redesign.

## S1: Domain Scope And Taxonomy

Status: Not started

Define the durable domain concepts Phase 1 needs before schema work begins.

Tasks:

- [ ] Define the citizenship-first explorer flow in product terms.
- [ ] Define Germany, Portugal, and Spain as the 3 European demo destinations.
- [ ] Define the initial extensible immigration route taxonomy for the foundation.
- [ ] Decide how visa-free stay and initial arrival context attach to immigration routes.
- [ ] Define the minimum route summary and route detail fields.
- [ ] Define source, review, confidence, and demo-data metadata.
- [ ] Apply the hybrid schema approach to route details, normalizing stable fields and keeping route-specific details flexible.
- [ ] Validate the initial hybrid schema direction against the first demo records before committing migrations.
- [ ] Document explicit Phase 1 non-goals.
- [ ] Move resolved items out of [future-product-scope.md](future-product-scope.md).

## S2: Main Database Structure

Status: Not started

Replace the placeholder database foundation with the first real domain schema.

Tasks:

- [ ] Model citizenships, destinations, route types, immigration routes, requirements, costs, timelines, caveats, and sources.
- [ ] Add source/review/confidence metadata in a way that can survive real content work later.
- [ ] Add migrations for the Phase 1 schema.
- [ ] Add database constraints and indexes for the expected read paths.
- [ ] Add real Postgres-backed schema tests where useful.
- [ ] Update database documentation with the Phase 1 model.

## S3: Seed And Demo Data

Status: Not started

Create enough demo data to exercise the full product foundation.

Tasks:

- [ ] Add a repeatable seed workflow.
- [ ] Seed United States as the first citizenship.
- [ ] Seed Germany, Portugal, and Spain as the first destination countries.
- [ ] Seed realistic-ish placeholder records across all major immigration route types.
- [ ] Mark demo, estimated, or needs-review fields explicitly.
- [ ] Add seed tests or smoke checks against real Postgres.

## S4: Read API Foundation

Status: Not started

Expose read-only API endpoints from NestJS for the explorer UI.

Tasks:

- [ ] Define shared response contracts for citizenships, destinations, route summaries, and route details.
- [ ] Add endpoint for available citizenships.
- [ ] Add endpoint for destinations available to a citizenship.
- [ ] Add endpoint for route summaries filtered by citizenship and destination.
- [ ] Add endpoint for route details.
- [ ] Include source/review/demo metadata in API responses.
- [ ] Add API integration tests against real Postgres.

## S5: Citizenship-First Web Explorer

Status: Not started

Build the first usable Next.js explorer experience on top of the API.

Tasks:

- [ ] Add the application shell for the product experience.
- [ ] Add citizenship selection with United States seeded as the first usable option.
- [ ] Add destination browsing for the selected citizenship.
- [ ] Add route cards grouped or filtered by route type.
- [ ] Add route detail view with requirements, costs, timelines, caveats, and sources.
- [ ] Show demo/review/source metadata clearly without overwhelming the UI.
- [ ] Preserve responsive layout, keyboard usability, and accessibility from the start.

## S6: Quality And Documentation Pass

Status: Not started

Keep Phase 1 shippable as a portfolio foundation, not only technically working.

Tasks:

- [ ] Keep coverage at or above the v1 60% threshold.
- [ ] Add frontend component/integration tests for the explorer flow.
- [ ] Add Playwright coverage for the primary citizenship-first journey.
- [ ] Keep axe checks passing.
- [ ] Keep Lighthouse CI at 90+ for relevant categories.
- [ ] Keep typecheck, lint, format, tests, build, and CI passing.
- [ ] Update docs and plan status as scope changes.
- [ ] Draft the Phase 2 plan.

## Exit Criteria

Phase 1 is done when:

- the Phase 1 domain scope and non-goals are documented
- the main database structure supports the core Pathport concepts
- a repeatable seed workflow creates basic demo data
- United States citizenship and Germany, Portugal, and Spain are usable in demo data
- all major immigration route types are represented in the schema and at least lightly exercised in demo data
- the API exposes read-only citizenship, destination, route summary, and route detail data
- the web app renders a citizenship-first explorer flow from API data
- route cards and details include source/review/demo metadata
- tests, coverage, E2E, accessibility, Lighthouse, typecheck, and build pass
- Phase 2 has a draft plan

## Open Questions

No active Phase 1 planning questions.

## Notes

- Phase 1 is a foundation phase, not a content-depth phase.
- The schema should be broad enough to support future real data, but the seed data should stay intentionally small.
- Demo data is for local development and foundation testing; Phase 1 is not expected to deploy or publish authoritative content.
- Prefer boring, durable data modeling over clever eligibility logic.
- Any product or schema decision that affects future phases should be written into docs, not only discussed in chat.
