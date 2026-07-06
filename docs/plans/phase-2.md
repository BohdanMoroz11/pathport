# Phase 2: UI Foundation, Data-Gathering Concept, and Admin Slice

Status: In-progress

Branch: phase-2

> Collaborative draft. The major direction is decided (see
> [Resolved Decisions](#resolved-decisions)); task-level detail still firms up as
> each stage starts. Anything that does not belong in Phase 2 is parked in
> [phase-3.md](phase-3.md) (idea collection) rather than assumed here.

## Goal

Build the three things the MVP depends on, on top of the Phase 1 foundation:

1. **UI foundation** — replace the placeholder frontend with a real design system
   and rebuilt explorer screens.
2. **Data-gathering tool** — the basic structure of an AI-assisted tool that
   populates the DB: the concept plus a *walking skeleton* of the full
   architecture (write path + `ingestion_*` proposal layer + queue + one
   end-to-end orchestrator-worker flow).
3. **Admin panel** — a basic, from-scratch admin to manage data and drive the
   tool.

SEO, CI/CD, deployment, the full AI pipeline, and the public launch are
**Phase 3** ([phase-3.md](phase-3.md)).

## Current Status (what already exists)

- **Phase 0** ([phase-0.md](phase-0.md), done): pnpm monorepo, chosen stack,
  app scaffold, dev/quality pipeline (Biome, Vitest, Playwright, axe, Lighthouse,
  GitHub Actions), and a placeholder schema foundation.
- **Phase 1** ([phase-1.md](phase-1.md), wrapping up): the real domain schema
  behind a baseline migration, a repeatable demo seed, a read-only NestJS API,
  and a citizenship-first Next.js explorer over shared contracts — all on
  throwaway demo data.

So the product works end to end but is not yet *good* or *fillable*: the UI is
placeholder, the DB can only be populated by a hand-written seed, there is no way
to manage content, and there are no mutations or authentication yet. Phase 2
closes those gaps far enough that Phase 3 can be about polish, data volume, SEO,
and shipping.

Project-wide product principles, constraints, and scaling rules are not repeated
here — see [AGENTS.md](../../AGENTS.md) and [../architecture.md](../architecture.md).
Below are only the constraints Phase 2 actively introduces or stresses:

- First introduction of **mutations** and **authentication** (Phase 1 was
  read-only/unauthenticated) — get those boundaries right over breadth.
- The data-gathering layer must preserve provenance, review status, and
  confidence end to end; AI output cannot enter the DB as fact (it lands in a
  review queue).
- Demo data stays throwaway unless a stage explicitly says otherwise.
- The Phase 1 **domain/content schema is provisional**, not settled. It was built
  for the route-centric explorer; the rebuilt pages are a new data surface, so the
  schema **evolves alongside the UI stages (S3–S5)** as they reveal what the data
  must hold.

## Resolved Decisions

Settled in collaborative planning; the stages below build on these.

**UI**

- **Radix as the unstyled base**, with Pathport's own custom UI built on top —
  Radix for behavior/accessibility, our own design for everything visual.
- **Dark mode from the start.**
- **Brand identity stays minimal** in Phase 2; full brand focus is Phase 3.
- **The domain/content schema is designed alongside the UI, not before it.** The
  only place the real data requirements surface is the page itself, so the **UI
  stages (S3–S5) own evolving the domain schema** — the page reveals the shape, the
  schema (and demo seed) follow. The country/destination page is a new
  destination-level surface, and `destination_countries` (today just `code + name`)
  is a known stub to flesh out. The data-gathering tool (S6/S7) then consumes
  whatever the domain schema has become; it does not design it.

**Data-gathering** (full concept in [../data-gathering.md](../data-gathering.md); S2)

- Ingestion is a **separate module/worker boundary** — modular `apps/api`
  (read / write / ingestion) plus a **separate BullMQ worker** (Redis queue) that
  only ever writes a dedicated **`ingestion_*` proposal layer**, never canonical
  tables.
- AI output flows as **proposals → field-level claims (with evidence)** and reaches
  canonical only through a **single shared write use-case** behind a **claim-level
  gate**; provenance, confidence, and review status are preserved end to end.
- The research layer is an **orchestrator-worker agent** (lead agent decides its
  own fan-out; durable spawn via BullMQ) on the **provider-agnostic Vercel AI SDK**
  — AI model + guardrails/prompt **configurable, not hardcoded**.
- **Token/cost budgets and metering are first-class from the first build.**
- **Phase 2 builds a walking skeleton**, not the full pipeline: the complete
  architecture proven on **one real end-to-end flow**. Deep recursion at scale,
  scheduling/refresh/staleness, auto-approval, and the full eval harness are
  **Phase 3**.
- **Scope is the tool, not the content** — populating a production DB is a
  post-deploy Phase 3 activity. The tool (S6/S7) is built **against the domain
  schema as the UI stages leave it**; it *fills* the domain DB and owns only the
  `ingestion_*` proposal layer — it does **not** design the domain/content schema
  (that is the UI stages' job, see the UI decisions above).

**Admin**

- A **separate `apps/admin`** application (not a route group in `apps/web`).
- **Proper cookie-based auth.** (Redis is already in the stack for BullMQ, so
  server-side sessions can live there, keeping the API stateless.)
- Phase 2 builds a **basic admin panel** — enough to manage core data and drive
  the ingestion tool — not the full admin.

**Cross-cutting**

- **No deployment in Phase 2.** Local dev (and CI) only; publishing and anything
  deploy-related is Phase 3.
- Stages are **interleaved**, not strict pillar order, with the **UI rework
  starting first**. The UI approach is style-first: lock the look on one real
  page, then extract components from it, then rebuild the rest. Because the domain
  schema is shaped by this UI work, the data-tool stages (S6/S7) trail the UI
  enough for that schema to stabilize.

## Stages

Each stage is tagged with its pillar. Status is per-stage.

### S1 [UI]: Design Direction and Tokens

Status: Done

Decide the visual language before building components.

The direction was settled visually against a throwaway concept mockup and is
written up in [../design-direction.md](../design-direction.md) (the doc links to
the concept at `docs/ui-concepts/route-comparison-v3.html`). Remaining S1 work is
to formalize the tokens in code and confirm the Radix setup.

Tasks:

- [x] Define the design direction (mood, references, what "calm, modern, useful"
      means concretely for Pathport), kept minimal on brand —
      see [../design-direction.md](../design-direction.md).
- [x] Establish design tokens incl. a **dark mode** from the start: color system,
      typography scale, spacing, radius, elevation, motion. Build on the existing
      CSS-variable approach (`--foreground`, `--muted`, …) rather than replacing
      it wholesale. Implemented in `apps/web/src/app/globals.css` (dark default +
      light theme, both first-class), with the display/body fonts wired via
      `next/font`. Legacy aliases keep the placeholder UI working until S3–S5.
      A theme **toggle** (and persistence) comes with the component layer.
- [x] Confirm the Radix + custom-UI setup (dependencies, theming approach, how
      tokens drive Radix-based components). The system is documented later in S5,
      once components are settled. Uses the unified `radix-ui` package; the
      token-driven wrapping pattern is proven by
      `apps/web/src/components/ui/dialog.tsx` (+ test). See
      [../design-direction.md](../design-direction.md#radix--custom-ui).

### S2 [Data]: Data-Gathering Concept

Status: Done (Task 2 has residuals intentionally deferred to S7/Phase 3 — cron
split, recursion depth, refresh cadence)

Produce a design doc (`docs/data-gathering.md`) before building. Can run in
parallel with S1.

Concept areas to resolve:

- [x] The ingestion model: a target → AI agent (research + extract + self-validate)
      → proposal → gate → publish. AI does the whole research job (no homegrown
      crawler/parser); AI output lands in a dedicated proposal layer separate from
      canonical tables; publish goes through a single shared domain write use-case.
      How provenance (source + run tiers), confidence, and review status flow
      through. Written up in [../data-gathering.md](../data-gathering.md#the-ingestion-model-s2--task-1).
- [~] Job model (mostly resolved): BullMQ; manual trigger is fine for Phase 2;
      idempotency via evidence content-hash + proposal `dedup_key`/`supersedes`;
      "recursive fill/update" scoped as a durable orchestrator→sub-agent fan-out
      with per-run + per-cascade token/cost ceilings. Still open: cron-vs-manual
      split, how much "recursive" is implemented in S7 vs concept-only, and refresh
      cadence (leans Phase 3). See
      [../data-gathering.md](../data-gathering.md#job-model-s2--task-2).
- [x] The ingestion module / worker boundary: modular NestJS `apps/api`
      (read / write / ingestion modules) + a **separate BullMQ worker process**
      that runs the agent and writes proposals; one shared domain write use-case is
      the only writer of canonical data. Preserves the queue + horizontal-scaling
      principle. See
      [../data-gathering.md](../data-gathering.md#architecture--boundary-s2--task-3).
- [x] Human-in-the-loop boundary: AI output lands in a dedicated proposal layer and
      only reaches canonical after a gate. The gate is a **role** (`reviewer_kind`
      human | ai — AI seam wired for Phase 3). Review is **claim-level** (approve /
      reject / hold / edit per field) while the **proposal is the unit of publish**
      (partial-apply, with a required-field `blocked` guard); edits stored as a diff
      over the AI value. **Assisted-manual** for Phase 2: risk-ranked queue +
      bulk-clear of grounded claims, auto-approval built as a wired-OFF seam. Honest
      provenance surface (value + diff + confidence + judge score + cited
      source/snapshot). Reversible via `supersedes_id` + canonical back-link. Concrete
      UI is S9. See
      [../data-gathering.md](../data-gathering.md#human-in-the-loop-gate-s2--task-4).
- [x] Configurable model + guardrails/prompt: **BullMQ (durable spawn boundary) +
      the Vercel AI SDK agent loop**, wired as a **hybrid orchestrator-worker** —
      the lead agent decides its own fan-out (deep-research pattern), `spawn_subtarget`
      is a durable BullMQ-backed tool, extraction sub-agents run in-process on
      cheaper tiers with planning stratified one tier up. Provider-agnostic (Claude
      default, not locked in); AI does research via the provider's web tools;
      candidates validated against the Zod contracts (contract version recorded); a
      DIY groundedness/judge step guards against hallucinated facts. **Token/cost
      budgets and cost observability are built in from the first build (S6 ledger,
      S7 enforcement)** (per-run + per-cascade ceilings, a metering ledger on
      `ingestion_run`, surfaced in admin). Frameworks
      (Managed Agents, Mastra, LangGraph) and agent apps (OpenClaw, Hermes) evaluated
      and rejected for Phase 2. See
      [../data-gathering.md](../data-gathering.md#model--agent-layer-s2--task-5).
- [x] Testing strategy: shrink the nondeterministic surface to one seam (model
      behind a port) and assert on durable `ingestion_*` rows. **Ring 1** —
      deterministic machinery (unit pure-logic + integration pipeline with a fake
      model, real Postgres) gates CI; **Ring 2** — recorded fixtures (cassettes),
      also the contract-drift guard; **Ring 3** — a *small* live eval suite scored on
      coverage/groundedness/cost, scaffolded in S7 but run out-of-band (`test:eval` /
      scheduled), never gating. Full eval harness is Phase 3. See
      [../data-gathering.md](../data-gathering.md#testing-strategy-s2).

### S3 [UI]: Reference Page (Style Concept)

Status: Done — UI reference (the full destination shell) built, and the schema
fold-down landed: the shell now reads real data through the API, with the section
content stored as validated JSONB. Whole pipeline green (typecheck, Biome, unit,
db + api integration, Playwright + axe, Lighthouse ≥ 90).

Build **one** real, fully-styled explorer page end to end to establish the
overall visual style as a concrete concept — before extracting any reusable
parts. This page is the reference everything else is derived from. It is also the
first real test of the **domain schema**: a page is a data surface, so building it
is where the data this surface needs becomes concrete and the schema starts to
evolve (see the UI decision in [Resolved Decisions](#resolved-decisions)).

The reference work **over-delivered past a single page**: rather than one screen,
the whole destination shell was built to production quality — a persistent left
rail plus Overview, Country, Living, Work & income, Family & pets, Entry, and a
Routes comparison with an intercepting-route peek drawer. That is the concrete
style benchmark S4/S5 derive from. It is built **FE-first against in-repo
fixtures** (`apps/web/src/lib/destination/*`), so the remaining S3 work is the
schema fold-down: pushing that fixture-shaped surface down into
`@pathport/contracts` → the API → the Drizzle schema + demo seed.

Tasks:

- [x] Pick the reference page and build it to production UI quality against the S1
      tokens (real layout, typography, spacing, dark mode). *(Built the full
      destination shell, not just one page — see above.)*
- [x] Treat it as the style benchmark: this is where "calm, modern, useful" is
      proven visually before it is generalized.
- [x] Let the page drive the **domain schema**: as it reveals what the surface must
      hold, evolve the schema + demo seed to match (starting with the
      `destination_countries` stub if the country page is chosen). *(Done: folded the
      fixtures down into contracts → API → Drizzle + seed. Identity columns +
      validated-JSONB section profiles on `destination_countries`; the pairing
      profile broadens `arrival_context`; served at
      `/citizenships/:c/destinations/:d/profile` and consumed via the web API client,
      retiring the FE fixtures.)*
- [x] Record the resulting domain-schema changes and open questions in
      [../domain-model.md](../domain-model.md) so the shape is tracked, not implicit.
- [x] Keep it accessible and Lighthouse-clean from the start. *(Playwright + axe +
      Lighthouse ≥ 90 green.)*

### S4 [UI]: Component Extraction

Status: Not started

Pull the reusable component layer out of the reference page, on top of Radix, so
the rest of the app composes from it.

Tasks:

- [ ] Extract primitives and patterns implied by the reference page (button, link,
      card, badge, field, select, dialog, layout, etc.) as custom UI over Radix
      behavior, driven by the S1 tokens.
- [ ] Refactor the reference page to consume the extracted components (proving
      they reproduce its style).
- [ ] Keep components accessible (keyboard, focus, ARIA) and unit-tested with RTL
      + axe; establish loading/empty/error patterns.

### S5 [UI]: Rebuild the Remaining Explorer

Status: Not started

Recreate the rest of the citizenship-first flow (`/` → `/explore/[citizenship]` →
`/explore/[citizenship]/[destination]` → `/routes/[id]`) from the extracted
components, matching the reference style. As each remaining surface is rebuilt it
keeps **evolving the domain schema** (and demo seed) the same way S3 did — by S5's
end the schema should reflect what the whole rebuilt flow actually needs.

Tasks:

- [ ] Rebuild the remaining explorer screens with the extracted components.
- [ ] Make route comparison genuinely scannable (the core product promise).
- [ ] Strengthen responsive + keyboard + a11y across the flow.
- [ ] Settle the domain schema for the rebuilt flow: fold the per-page changes into
      coherent migrations + updated shared contracts, and update
      [../domain-model.md](../domain-model.md). This is the schema the tool stages
      (S6/S7) build against.
- [ ] Keep Playwright + axe green on the rebuilt flow; keep Lighthouse ≥ 90.
- [ ] Document the design system in `docs/design-system.md` (tokens + components,
      now that they are settled).

### S6 [Data]: Write Path, Queue & Ingestion Schema

Status: Not started

The deterministic foundation of the tool: mutations (new for Phase 2), the
queue/worker, the full `ingestion_*` schema, and the single canonical writer —
**no AI yet**, so all of it is provable with the deterministic machinery (Ring 1).
This stage builds **against the domain schema as the UI stages (S3–S5) left it** —
it owns the `ingestion_*` layer, not the domain/content schema.

Tasks:

- [ ] Add a write API surface in NestJS (mutation module(s), validation, the
      authn/authz boundary). Keep the read API intact.
- [ ] Stand up BullMQ + Redis and a separate ingestion worker process; add Redis
      to local dev (compose) and config.
- [ ] Model the full `ingestion_*` layer as new migrations — the run tree
      (`ingestion_run` incl. the cost ledger + `budget_exceeded`),
      `ingestion_proposal`, `ingestion_claim` (with decision state), and
      `ingestion_evidence`. The domain schema is taken as the UI stages left it;
      close only the narrow gaps publish needs, don't redesign it here.
- [ ] Implement the **single canonical writer + publish mapper** (claims →
      canonical, partial-apply, the required-field `blocked` guard, supersession),
      shared by human admin CRUD and proposal publish.
- [ ] Ring 1 deterministic tests: unit pure-logic (publish mapper, status machine,
      budget math, dedup) + integration of the write/publish path against real
      Postgres. No live model.

### S7 [Data]: Research Agent & One End-to-End Flow

Status: Not started

The AI layer: the orchestrator-worker agent behind a provider port, producing real
proposals/claims/evidence through to the gate on **one** target — the walking
skeleton that proves the architecture. Needs S6.

Tasks:

- [ ] Wire the **agent behind a port** on the Vercel AI SDK (provider-agnostic,
      configurable model/prompt/guardrails, mockable for tests).
- [ ] Implement the **hybrid orchestrator-worker** flow: a discovery run, a durable
      `spawn_subtarget` (BullMQ-backed), and an extraction sub-agent that researches
      one entity via provider web tools and emits structured, contract-validated
      proposals + field-level claims + evidence.
- [ ] Add the **groundedness/judge step** (claims scored against cited evidence,
      feeding confidence + the risk roll-up) and enforce **per-run + per-cascade
      token/cost ceilings** via the metering ledger.
- [ ] Prove **one end-to-end flow** (manual trigger): target → proposals in the
      gate, with provenance, confidence, and budgets recorded.
- [ ] Ring 2 cassette tests (real-shaped output replay + contract-drift guard) and a
      **small Ring 3 eval suite** (golden targets scored on coverage/groundedness/
      cost), run out-of-band (`test:eval`), never gating.

### S8 [Admin]: Admin App and Auth

Status: Not started

Stand up the separate admin application and its authentication boundary. Needs S4
(extracted components); can start alongside the data stages (S6/S7).

Tasks:

- [ ] Scaffold a separate `apps/admin` application reusing the UI components.
- [ ] Implement proper cookie-based auth with server-side sessions (Redis-backed),
      keeping the API stateless; protect all admin routes.
- [ ] Establish the admin shell, navigation, and protected-route pattern.

### S9 [Admin]: Basic Data and Ingestion Management

Status: Not started

The basic admin: enough to manage core data and drive the ingestion tool. Needs
S6, S7, and S8.

Tasks:

- [ ] CRUD over the core domain (citizenships, destinations, routes, sources,
      applicability) through the write API.
- [ ] Trigger and observe ingestion runs (manual run + status + the cost/metering
      surface).
- [ ] **Claim-level review queue**: a risk-ranked queue with per-claim
      approve/reject/hold/edit and bulk-clear, surfacing honest provenance (value +
      diff + confidence + judge score + cited source/snapshot).
- [ ] Tests for the admin slice (component + e2e on the critical admin path).

## Exit Criteria (draft)

Phase 2 is done when:

- the placeholder UI is replaced by a documented design system (Radix-based custom
  UI, dark mode) and the explorer flow is rebuilt to production UI quality, with the
  domain/content schema evolved alongside it to match what the rebuilt pages need;
- the data-gathering tool has a written concept (`docs/data-gathering.md`) **and**
  a walking-skeleton implementation: a write path + single canonical writer, a
  BullMQ/Redis worker, the `ingestion_*` proposal layer, and one end-to-end
  orchestrator-worker flow that produces reviewable, provenance- and
  confidence-tracked **proposals/claims** via a configurable AI model + prompt,
  within enforced token/cost budgets, guarded by Ring 1/2 tests (+ a small Ring 3
  eval);
- a separate `apps/admin` exists with proper cookie auth and can manage the core
  domain, drive an ingestion run, and review its proposals **at the claim level**;
- the API stays stateless and the Phase 1 read API still works;
- tests, coverage, e2e, accessibility, Lighthouse, typecheck, and build still
  pass (local + CI; no deployment);
- Phase 3 continues to have a parked idea collection.

## Notes / Change Log

- Created as a collaborative draft; major direction resolved in planning
  (see Resolved Decisions).
- Phase 2 = UI foundation + data-gathering tool (basic) + basic admin. SEO,
  CI/CD, deployment, the full AI pipeline, and the public MVP launch are Phase 3
  ([phase-3.md](phase-3.md)).
- First introduction of mutations, authentication, and a queue/worker (Redis) to
  the system.
- S2 collaborative session resolved the ingestion model (Task 1) and the core
  architecture: AI does the whole research job; output lands in a dedicated
  `ingestion_*` proposal layer (run → proposals fan-out → field-level claims +
  evidence); two-phase discovery→extraction fan-out on BullMQ; modular `apps/api`
  + separate worker with one canonical writer (Task 3); provider-agnostic in-job
  agent on the **Vercel AI SDK** with a DIY groundedness guard (Task 5). Job model
  (Task 2) and the gate UX (Task 4) are partly resolved. Heavier frameworks and
  agent apps (Managed Agents, Mastra, LangGraph, OpenClaw, Hermes) were evaluated
  and rejected for Phase 2 scope, with Mastra kept as an upgrade path.
- Follow-up session (researched current deep-research practice) refined Task 5:
  the fan-out is an **orchestrator-worker** model where the lead agent decides its
  own spawning (a sub-agent is a tool), realized as a **hybrid (durable by phase)**
  — `spawn_subtarget` is a BullMQ-backed durable tool, extraction sub-agents run
  in-process on cheaper model tiers with planning stratified one tier up. Added
  **token/cost budgets + cost observability as first-class from S6**: per-run and
  per-cascade ceilings (`budget_exceeded`), a metering ledger on `ingestion_run`,
  dedup as a cost lever, surfaced in admin. This mostly closes Task 2 as well.
- Task 4 (gate) resolved: gate as a role (`reviewer_kind`, AI seam off);
  **claim-level review** (approve/reject/hold/edit per field) with the proposal as
  the publish unit (partial-apply + required-field `blocked` guard); assisted-manual
  (risk-ranked queue + bulk-clear, auto-approval wired off); honest provenance
  surface; reversibility via supersession + back-link. Decision state moves onto
  `ingestion_claim`. **S2 marked Done**, with Task 2 residuals deferred to S6/Phase 3.
- Added a **testing strategy** for the layer: shrink nondeterminism to one mocked
  seam (model behind a port) and assert on durable `ingestion_*` rows. Ring 1
  (deterministic machinery) + Ring 2 (cassettes / contract-drift guard) gate CI;
  Ring 3 (a small live eval suite, scored on coverage/groundedness/cost) is
  scaffolded in S6 but runs out-of-band and never gates. Full eval harness → Phase 3.
- **Re-scoped the data build to match the locked S2 design.** The old single S6
  ("basic ingestion tool", draft-record vocabulary) is split along its natural
  seam: **S6 = Write Path, Queue & Ingestion Schema** (deterministic plumbing — no
  AI, Ring 1) and **S7 = Research Agent & One End-to-End Flow** (the AI layer +
  judge + budgets + Ring 2/3); admin renumbers to **S8** (app + auth) and **S9**
  (data + claim-level ingestion management). The Phase 2 cut is a **walking
  skeleton**: the full architecture proven on one real flow, with deep recursion,
  scheduling/refresh, auto-approval, the full eval harness, and rich cost
  dashboards deferred to Phase 3. Resolved Decisions and Exit Criteria updated to
  the proposals/claims + budgets + canonical-writer framing.
- **Clarified where the domain schema is designed.** The Phase 1 domain/content
  schema was built for the route-centric explorer and is treated as provisional, not
  settled. Because the data requirements only surface in the pages, the **UI stages
  (S3–S5) own evolving the domain schema** (the country/destination page is a new
  data surface; `destination_countries` is a known stub). The data-gathering stages
  (S6/S7) build the tool and the `ingestion_*` layer **against** that schema and do
  not design it. Stage text, Resolved Decisions, constraints, and Exit Criteria
  updated accordingly.
