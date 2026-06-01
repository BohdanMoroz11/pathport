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
- Demo citizenships: United States (primary) and Ukraine (second). Two citizenships exist so the citizenship-based filter provably differentiates results instead of trivially applying to everything.
- Demo destinations: Germany, Portugal, and Spain.
- Route taxonomy: start with the categories already in the schema enum — work, study, family, freelance, digital_nomad, business, humanitarian, long_stay, and other; keep the model open to additional categories as real immigration paths are explored.
- Arrival context: include visa-free stay, visitor, or initial arrival information when useful, but treat it as supporting context rather than the main organizing purpose. Arrival context is a property of a citizenship × destination pair, not of a route (see Initial Schema Direction).
- Data quality: demo data is throwaway local placeholder data, good enough to build and test the foundation, with clear demo or needs-review labels. Phase 1 is not a real-data phase; real data collection and refresh are deferred to a later phase, where the frontend will likely move to SSG.
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

Those flexible fields should start as validated JSONB columns rather than block tables. The fields are still volatile, so JSONB lets the shape move freely during Phase 1 while a schema (Zod/Drizzle) keeps the data validated and the API contract honest. Revisit normalization into tables once enough real routes show which fields repeat consistently. Avoid over-normalizing requirements before that signal exists.

The Phase 1 schema should be easy to query for the citizenship-first UI while staying flexible enough to absorb real data later without a redesign.

### Resolved Modeling Decisions

- **Citizenship applicability:** model as an explicit `route ↔ citizenship` applicability join, not a column on `routes`. A route is applicable to a citizenship when a row exists. This is the join the citizenship-first UI filters on, and the reason two demo citizenships exist is to prove it actually differentiates results.
- **Arrival context:** lives on the citizenship × destination pair (e.g. a separate `arrival_context` concept keyed on both), not on `routes`. "US citizens get 90-day visa-free Schengen entry" is a fact about the pair, not a migration route, and does not fit the route shape.
- **Route detail fields:** validated JSONB (requirement groups, document lists, caveats, step notes, eligibility notes), per the hybrid approach above.
- **Comparison fields:** keep them structured enough to compare and sort, not free text — that is the point of "comparable at a glance." Exact types (e.g. cost as min/max + currency, timeline as min/max months, renewability and path-to-PR as enums or boolean-with-note) are decided as the seed records are written and the UI needs them, then recorded in [../database.md](../database.md).

## S1: Domain Scope And Taxonomy

Status: Done

Define the durable domain concepts Phase 1 needs before schema work begins. Output: [../domain-model.md](../domain-model.md).

Tasks:

- [x] Define the citizenship-first explorer flow in product terms (destination drill-down).
- [x] Confirm United States and Ukraine as the 2 demo citizenships.
- [x] Define Germany, Portugal, and Spain as the 3 European demo destinations.
- [x] Confirm the route taxonomy matches the schema enum.
- [x] Confirm the `route ↔ citizenship` applicability join as the citizenship-first filter.
- [x] Confirm arrival context attaches to the citizenship × destination pair, not to routes.
- [x] Define the minimum route summary and route detail fields.
- [x] Define source, review, confidence, and demo-data metadata (review_status + confidence + is_demo; labels derived).
- [x] Apply the hybrid schema approach (validated JSONB for flexible route details).
- [ ] Validate the schema direction against the first demo records before stabilizing it. (Deferred to S2/S3 when records are written.)
- [x] Document explicit Phase 1 non-goals.
- [x] Move resolved items out of [future-product-scope.md](future-product-scope.md).

## S2: Main Database Structure

Status: Done

Replace the placeholder database foundation with the first real domain schema.

During Phase 1 the schema is still being designed, so iterate with `drizzle-kit push` against a throwaway dev DB (drop and recreate freely) instead of generating a migration per change. Delete the Phase 0 baseline migration. Postgres-backed tests also `push` the schema so they do not depend on migration files mid-design. A single clean baseline migration is generated later, in S6, once the schema is stable.

Tasks:

- [x] Model citizenships, destinations, route types, immigration routes, requirements, costs, timelines, caveats, and sources.
- [x] Add the `route ↔ citizenship` applicability join.
- [x] Add arrival context keyed on citizenship × destination.
- [x] Add source/review/confidence metadata in a way that can survive real content work later.
- [x] Iterate the schema with `drizzle-kit push`; remove the Phase 0 baseline migration.
- [x] Add database constraints and indexes for the expected read paths.
- [x] Add real Postgres-backed schema tests where useful.
- [x] Update database documentation with the Phase 1 model.

## S3: Seed And Demo Data

Status: Not started

Create enough demo data to exercise the full product foundation.

Tasks:

- [ ] Add a repeatable seed workflow that drops and recreates the dev DB.
- [ ] Seed United States and Ukraine as the two demo citizenships.
- [ ] Seed Germany, Portugal, and Spain as the first destination countries.
- [ ] Seed route applicability so US and Ukraine differ on at least some routes (proving the filter).
- [ ] Seed realistic-ish placeholder records across all major immigration route types.
- [ ] Seed arrival context for the demo citizenship × destination pairs.
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

- [ ] Generate one clean baseline migration now that the schema is stable; switch seed/tests/CI from `push` to `migrate`.
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
- United States and Ukraine citizenships and Germany, Portugal, and Spain are usable in demo data
- the citizenship filter provably differentiates results between the two demo citizenships
- all major immigration route types are represented in the schema and at least lightly exercised in demo data
- the API exposes read-only citizenship, destination, route summary, and route detail data
- the web app renders a citizenship-first explorer flow from API data
- route cards and details include source/review/demo metadata
- the schema is stabilized behind one clean baseline migration with seed/tests/CI using `migrate`
- tests, coverage, E2E, accessibility, Lighthouse, typecheck, and build pass
- Phase 2 has a draft plan

## Resolved Decisions

- Two demo citizenships (United States + Ukraine) so the citizenship filter is provably exercised.
- Citizenship applicability is an explicit `route ↔ citizenship` join, not a route column.
- Arrival / visa-free context attaches to the citizenship × destination pair, not to routes.
- Flexible route detail fields are validated JSONB, not block tables, while the shape is still volatile.
- No per-change migrations during Phase 1: iterate with `drizzle-kit push` on a throwaway dev DB, then generate one baseline migration in S6 once the schema is stable.
- Comparison fields stay structured (not free text); exact types are pinned down as seed records and the UI demand them.

## Open Questions

No active Phase 1 planning questions.

## Notes

- Phase 1 is a foundation phase, not a content-depth phase.
- The schema should be broad enough to support future real data, but the seed data should stay intentionally small.
- Demo data is for local development and foundation testing; Phase 1 is not expected to deploy or publish authoritative content.
- Prefer boring, durable data modeling over clever eligibility logic.
- Any product or schema decision that affects future phases should be written into docs, not only discussed in chat.
