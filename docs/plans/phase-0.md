# Phase 0: Project Foundation

Status: In progress

Branch: phase-0

## Goal

Establish the project foundation before application implementation begins.

Phase 0 should leave Pathport with a clear concept, documented planning approach, chosen stack, initial repository structure, development workflow, testing/quality pipeline, and database/schema foundation.

## Why This Phase Exists

Pathport is portfolio-first. Before feature work begins, the project needs a clean engineering foundation that is pleasant to build on and easy to explain.

This phase should make the project easier to resume across sessions, easier to explain publicly, and ready for focused feature phases.

## S1: Repository Context

Status: Done

Tasks:

- [x] Create root `README.md` with project concept and portfolio-first goal.
- [x] Create `AGENTS.md` with general AI/session guidance.
- [x] Create `docs/` as the project knowledge base.
- [x] Add optional local-only `docs/user-context.md` convention.
- [x] Add `docs/README.md` as the documentation index.
- [x] Add `docs/plans/` for living phase plans.
- [x] Review public docs for tone, clarity, and fork-friendliness.

## S2: Product Concept

Status: Done

Tasks:

- [x] Draft project brief.
- [x] Document portfolio-first success criteria.
- [x] Document content principles and legal-advice boundaries.
- [x] Research similar products and competitive patterns.
- [x] Refine the one-sentence positioning.
- [x] Move detailed MVP product-scope questions into a future phase plan.

## S3: Stack Decision

Status: Done

Tasks:

- [x] Compare reasonable stack options for a portfolio-first MVP.
- [x] Decide frontend framework and routing approach.
- [x] Decide styling/UI approach.
- [x] Decide backend/API approach.
- [x] Decide database/provider approach.
- [x] Decide hosting/deployment target.
- [x] Document the chosen stack and tradeoffs.
- [x] Document framework/tooling compatibility checks to validate during scaffold.

## S4: Repository And App Scaffold

Status: Done

Tasks:

- [x] Scaffold the application.
- [x] Define initial folder structure.
- [x] Validate Next.js, NestJS, Drizzle, Tailwind, and Biome compatibility in the scaffold.
- [x] Add baseline app routes/pages.
- [x] Add shared UI/component structure.
- [x] Add environment variable conventions.
- [x] Add project scripts for local development.
- [x] Update docs to describe how the repo is organized.

## S5: Development And Quality Pipeline

Status: Done

Tasks:

- [x] Configure TypeScript.
- [x] Configure linting.
- [x] Configure formatting.
- [x] Validate NestJS decorator support with the chosen TypeScript/Biome setup.
- [x] Decide testing baseline.
- [x] Add first unit/component test setup.
- [x] Add frontend unit/component/integration test setup.
- [x] Add backend unit/integration/API test setup.
- [x] Add real Postgres-backed test workflow.
- [x] Add Playwright E2E setup.
- [x] Add accessibility testing with axe-core.
- [x] Add Lighthouse CI with v1 score target of 90+.
- [x] Add GitHub Actions workflow.
- [x] Document local development and validation commands.

## S6: Database And Schema Foundation

Status: Done

Tasks:

- [x] Define initial database/schema approach.
- [x] Add migration or schema tooling if the chosen stack needs it.
- [x] Create initial placeholder schema for future citizenship, destination, route, and source concepts.
- [x] Decide how local development data will work.
- [x] Document database setup and reset workflow.

Note: detailed product questions such as supported citizenships, destination set, route taxonomy, and demo data belong to future feature phases. Phase 0 only needs enough schema foundation to avoid painting the codebase into a corner.

## S7: Phase 1 Planning

Status: Not started

Tasks:

- [ ] Define Phase 1 goal.
- [ ] Draft Phase 1 stages.
- [ ] Decide Phase 1 branch name.
- [ ] Identify first implementation commits.
- [ ] Confirm Phase 0 exit criteria are met.

## Exit Criteria

Phase 0 is done when:

- public docs clearly explain what Pathport is and why it exists
- docs clearly state that the project is portfolio-first
- planning workflow is documented in `AGENTS.md` and `docs/plans/`
- main stack is chosen and documented
- app scaffold and folder structure exist
- local development workflow works
- linting, formatting, TypeScript, and baseline tests are configured
- coverage threshold is configured at 60% for v1
- accessibility and Lighthouse CI foundations exist
- initial database/schema foundation exists
- Phase 1 has a draft plan

## Open Questions

- How much CI should exist in Phase 0 versus later?
- Should visual design foundations be limited to tokens/layout primitives now, with detailed product UI left for later feature phases?
- What should Phase 1 focus on after the foundation is ready?

## Notes

- Final phases are intentionally TBD until the MVP shape becomes clearer.
- Keep this document updated as tasks are completed or reframed.
