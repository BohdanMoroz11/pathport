# Phase 0: Project Foundation

Status: Draft

Branch: phase-0

## Goal

Establish the project foundation before application implementation begins.

Phase 0 should leave Pathport with a clear concept, documented planning approach, initial product scope, technical direction, and enough structure to begin building the first usable application phase with confidence.

## Why This Phase Exists

Pathport is portfolio-first. Before code is generated, the project needs a clear shape so future work does not drift into a huge, vague immigration platform.

This phase should make the project easier to resume across sessions, easier to explain publicly, and easier to turn into a polished MVP.

## S1: Repository Context

Status: In progress

Tasks:

- [x] Create root `README.md` with project concept and portfolio-first goal.
- [x] Create `AGENTS.md` with general AI/session guidance.
- [x] Create `docs/` as the project knowledge base.
- [x] Add optional local-only `docs/user-context.md` convention.
- [x] Add `docs/README.md` as the documentation index.
- [x] Add `docs/plans/` for living phase plans.
- [ ] Review public docs for tone, clarity, and fork-friendliness.

## S2: Product Concept

Status: In progress

Tasks:

- [x] Draft project brief.
- [x] Document portfolio-first success criteria.
- [x] Document content principles and legal-advice boundaries.
- [x] Research similar products and competitive patterns.
- [ ] Refine the one-sentence positioning.
- [ ] Decide the first target user scenario.
- [ ] Decide which route types belong in the first MVP.
- [ ] Decide what should be explicitly out of scope for MVP.

## S3: MVP Scope

Status: Not started

Tasks:

- [ ] Define the first MVP user journey.
- [ ] Choose first supported citizenship or citizenship set.
- [ ] Choose first destination-country set.
- [ ] Define what counts as a "route" in the product.
- [ ] Define minimum route-card fields.
- [ ] Define minimum route-detail fields.
- [ ] Decide how source links and review status appear in the UI.
- [ ] Create or update a dedicated MVP scope doc if needed.

## S4: Data And Content Model

Status: Not started

Tasks:

- [ ] Draft initial data model.
- [ ] Decide whether MVP data starts as static files, database records, or a hybrid.
- [ ] Define source metadata shape.
- [ ] Define confidence / review status values.
- [ ] Define route-type taxonomy.
- [ ] Decide how mock or AI-assisted content should be labeled.
- [ ] Create or update a dedicated data model doc if needed.

## S5: Stack And Architecture Decision

Status: Not started

Tasks:

- [ ] Compare reasonable stack options for a portfolio-first MVP.
- [ ] Decide frontend framework and routing approach.
- [ ] Decide styling/UI approach.
- [ ] Decide hosting/deployment target.
- [ ] Decide testing baseline.
- [ ] Decide linting/formatting/tooling baseline.
- [ ] Create or update architecture decision docs.

## S6: Phase 1 Planning

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
- MVP scope is clear enough to start implementation
- initial stack and architecture direction are decided
- Phase 1 has a draft plan

## Open Questions

- What should the Phase 0 branch be called?
- Should Phase 0 end before or after stack scaffolding?
- Should MVP start with Ukrainian citizenship, another citizenship, or a fictional/demo dataset?
- Should early content be real, mocked, or a mix of real and clearly labeled draft data?
- How polished should the first design direction be before code begins?

## Notes

- Final phases are intentionally TBD until the MVP shape becomes clearer.
- Keep this document updated as tasks are completed or reframed.
