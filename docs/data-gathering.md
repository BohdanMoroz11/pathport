# Data-Gathering Layer (Concept)

This document is the design concept for Pathport's AI-assisted data-gathering
layer — the tool that populates the database. It is the deliverable of Phase 2,
stage **S2** ([plans/phase-2.md](plans/phase-2.md)).

> Concept, not scope. Phase 2 builds the **basic structure** of this tool and
> proves it works (S6). The full, recursive, scheduled version is Phase 3
> ([plans/phase-3.md](plans/phase-3.md)). The schema keeps being refined as the
> tool and admin reveal what the model needs, so concrete tables here are
> intent — the demo-era domain schema will be reshaped to match (the rewrite
> lands in S6, not here).

## What This Layer Is

A bounded context that turns a **target** ("fill/refresh this slice of the
data") into **reviewable proposals**, which a gate approves into the canonical
domain.

The defining idea: **the AI does the whole research job.** We do not build our
own crawler, fetcher, or parser pipeline — modern models already have capable
research tools (web search/fetch). We hand a configurable agent a target and a
contract; it finds the sources, reads them, extracts structured data, and
self-validates. What *we* own is the target definition, the output contract, the
proposal store, the review gate, and the publish step — **not** the act of
researching.

## The Ingestion Model (S2 · Task 1)

### Run anatomy — a hierarchy, not a line

One run is **not** one change. A target — especially a broad one like "all
immigration options to Brazil for a US citizen" — is the whole point, and it
fans out into many canonical changes with near-zero human babysitting. Even
narrow targets ("the timeline of route X", "rent prices") produce multiple
create/update operations. So the pipeline is a hierarchy:

```
target        the request + scope (broad → narrow)
  └─ run      an autonomous agent execution
       ├─ evidence    sources the agent gathered during the run
       └─ proposals   FAN-OUT: many; each = one create/update to one canonical entity
             └─ claims  per-field value + confidence + citations to evidence
```

### Orchestrator-agent fan-out (durable spawn boundary)

The fan-out follows the **orchestrator-worker** pattern that powers modern
"deep research" features (Anthropic's Research, OpenAI/Gemini deep research): a
**lead/discovery agent decides its own fan-out** — it plans, judges target
complexity, and spawns focused sub-agents — rather than us hard-coding a fixed
pipeline. The key reconciliation: in current SDKs a **sub-agent is just a tool
the orchestrator calls**, so the agent keeps full orchestration freedom *within
a bounded, durable tool surface*. Our rails are the tool set, the per-agent
step/token budgets, the structured-output contract, and the gate — not a
scripted sequence.

We adopt the production-standard **hybrid (durable by phase)** realization:

1. A **discovery/lead run** interprets a (possibly broad) target, plans, and
   calls a `spawn_subtarget` tool. That tool is **durable-backed by BullMQ** —
   "spawn" means "enqueue a job," so the orchestrator and its sub-agents are
   decoupled and return through the `ingestion_*` store (mirroring Anthropic's
   shared-memory return), not a single long-lived context.
2. Each **extraction sub-agent** is an in-process agent loop (SDK `ToolLoopAgent`
   style) that researches **one** entity with a small scoped context and emits
   its proposals. It can itself call `spawn_subtarget` to recurse (new
   destination → queue its routes).

Durable at the expensive **spawn boundary**, simple **inside** each sub-agent's
short research loop. This is bounded, resumable, **idempotent per sub-target (so
a crash/retry never re-pays for completed work)**, parallel across workers
(horizontal-scaling principle), failure-isolated, and **hard-cappable on token
spend** — which is what makes the recursive "fill/update" cascade operable
hands-off *and* cost-safe. Why hybrid over fully-queued or in-process, and the
deep-research grounding, are in the model & agent layer (Task 5). How much of
"recursive" ships in S6 vs stays concept is Task 2.

### Pipeline

```
target ──► discovery run ──► (BullMQ) ──► extraction runs ──► proposals
                                              (AI research)        │ gate (approve/edit/reject)
                                                                   ▼
                                                        publish (write use-case)
                                                                   ▼
                                                        canonical domain tables
```

The proposal is the **atomic unit of review** — a reviewer (human now, possibly
AI later) can approve one and reject another from the same run, or bulk-approve a
whole run. The gate is modeled as a **role**, so an AI reviewer could fill it
later without re-architecting (Task 4). Review must scale to near-zero effort, so
proposals carry a confidence/risk roll-up (below) that lets well-grounded ones be
fast-pathed.

### How provenance, confidence, and review status flow through

The data-gathering layer owns its **own** signal model; the only place coupled to
the canonical schema is the **publish boundary** (the write use-case). This keeps
the ingestion concept stable while the domain schema is reshaped: a proposal is
validated against the canonical contract **as it exists at publish time** and
records the **contract version** it targeted, so contract drift is absorbed at the
boundary, never in the layer.

- **Provenance — two tiers.** *Evidence* (the URLs/sources the agent used) and
  *run* provenance (model id, prompt/guardrail version, run id, timestamp, raw
  research trace). On publish, evidence maps onto the canonical source records;
  run provenance stays in the proposal layer, linked, so "how did this fact get
  here" is never lost.
- **Confidence — field-level.** Each proposed field is a **claim** with its own
  value, confidence, and citations to specific evidence. Claims roll up into a
  proposal-level risk score that drives review triage / fast-path / future
  auto-approval — the thing that makes the layer operable solo. The reviewer sees
  exactly which fields are well-sourced vs shaky.
- **Review status.** A proposal has its **own** lifecycle
  (`pending → approved | rejected | applied | superseded`), distinct from any
  canonical review status. AI content enters canonical only **after** the gate,
  so it lands as reviewed/published — never as raw unreviewed content.

### Rough schema (`ingestion_*` namespace)

The layer owns its tables; only the publish mapper touches canonical. Columns are
intent, finalized in S6.

- **`ingestion_run`** — one execution. `type` (discovery | extraction | refresh),
  `parent_run_id` (the run tree), `target` scope (jsonb), `status` (incl.
  `budget_exceeded`), `trigger` (manual | scheduled), the config it ran with
  (`model_id`, `prompt_version`, `guardrail_version`, `agent_version`), timing,
  `idempotency_key`, error, raw-trace ref. **Cost ledger:** `tokens_in`,
  `tokens_out`, `call_count`, `cost_estimate` (+ the per-model price used),
  `token_budget` / `cost_ceiling` and the rolled-up child totals. *Run-tier
  provenance + the metering record.*
- **`ingestion_proposal`** — the core artifact. `run_id`, `entity_kind` (a plain
  string like `route` — schema-agnostic), `operation` (create | update),
  `target_ref` (canonical id when updating), `contract_version`, `payload`
  (assembled candidate, jsonb), `dedup_key`, `status`, `supersedes_id`, review
  fields (`reviewed_by`, `reviewed_at`, `decision_note`, `edited_payload`/diff so
  "what AI said" vs "what human changed" is preserved), `applied_record_ref`.
- **`ingestion_claim`** — field-level grounding. `proposal_id`, `field_path`,
  `value` (jsonb), `confidence`, `evidence_ids` (citations), note.
- **`ingestion_evidence`** — source-tier provenance. `run_id`, `url`,
  `source_type`, `title`, `retrieved_at`, `content_hash` (idempotency +
  change-detection), snapshot/excerpt ref, trust tier.

**Light canonical touch-points (intent now; the reshape lands in S6):** generalize
sources to a polymorphic `sources`; lift the content-quality signals so every
content entity shares them; add a back-link from each canonical record to the
proposal/run that last published it.

## Architecture & Boundary (S2 · Task 3)

### Topology — modular API + separate worker

A **modular NestJS `apps/api`** with internal modules — public **read**, domain
**write**, and **ingestion** (job control + proposals + review) — plus a
**separate BullMQ worker process** that runs the agent and writes proposals, and a
thin **`apps/admin`** frontend (cookie auth) that drives it all through the api.

The key invariant: **one writer of canonical data.** Both human admin CRUD and
proposal publish call the *same* domain write use-case, so invariants cannot
drift. The worker only ever writes proposals; it never touches canonical tables.
This keeps a real bounded context and a real separate process without standing up
a second HTTP/auth surface. Graduating to a fully separate ingestion *service*
later (Phase 3) is a migration this shape does not block.

### Model & agent layer (S2 · Task 5)

**Decision: BullMQ for the durable orchestration boundary + the Vercel AI SDK
agent loop (`ToolLoopAgent` style) as the in-job agent**, both inside the
separate worker, wired as the **hybrid orchestrator-worker** above.

- **Orchestrator is a real planning agent, not a script.** The lead agent decides
  its own fan-out (deep-research pattern); `spawn_subtarget` is one of its tools,
  made durable via BullMQ. We supply rails (tool surface, budgets, contract,
  gate), not a fixed sequence.
- **Why hybrid (not fully-queued or in-process).** Fully-queued checkpoints every
  trivial sub-step — pure overhead for a 3–5 step research loop. Pure in-process
  lets one fragile process own a whole broad run, so a late failure **re-pays for
  work already done** — the real cost leak. Hybrid is durable at the expensive
  spawn boundary (idempotent resume, hard caps, cancellation) and cheap inside the
  short loop. It is also the production-endorsed shape: ~80% of production agent
  systems use structured workflows around bounded agent autonomy, because pure
  agent chains compound errors downward — a constraint that bites *harder* on the
  cheap models we intend to run.
- **Provider-agnostic by design.** The Vercel AI SDK gives a unified API across
  many providers; Claude (`claude-opus-4-8`) is the **default, not a lock-in**.
  Research is assumed to run on **cheaper tiers** (Sonnet/Haiku-class, possibly
  non-Anthropic), selected per task via config/gateway.
- **Model stratification (a primary cost lever).** Run **extraction sub-agents on
  the cheapest viable tier**, but run **discovery/planning one tier up** —
  planning is a tiny share of total tokens, and a smarter planner is cheap
  insurance against the real cost bomb: bad fan-out spawning too many sub-agents.
- **AI does the research** via the provider's built-in **web search/fetch** tools
  — no homegrown crawler.
- **Structured output validated against our Zod contracts** (`generateObject` /
  Zod schema) produces the candidate payload; the contract version is recorded on
  the proposal.
- **Configurable model + guardrails/prompt** are plain params, DB/config-driven —
  satisfying the "configurable, not hardcoded" decision.
- **Guardrails against hallucinated facts** = a DIY **groundedness/judge step**
  (one extra cheap-model call scoring each claim against its cited evidence),
  feeding the field-level confidence and triage. This matters *more* with weak
  models, and is still far cheaper than a bad human-review cycle. It is the one
  capability a heavier framework (Mastra) would have bundled as "evals"; at
  Phase-2 scope it is cheaper to own.

### Token budgets & cost observability (built in from S6, not bolted on later)

Because research runs fan out and run on metered models, cost control and cost
visibility are **first-class from the first build**, not a Phase-3 afterthought:

- **Hard budgets at every level.** A **per-run token/cost ceiling** and a
  **per-target (whole-cascade) ceiling** are enforced at the durable boundary: the
  worker tracks spend and **refuses to spawn / stops the cascade** when a ceiling
  is hit, marking the run `budget_exceeded` rather than silently overrunning.
  Per-agent **step caps** (`stepCountIs`) and a **max fan-out width** bound a
  single agent. Cheap models make overruns likely, so the cap is the safety net.
- **Metering on every run.** Each `ingestion_run` records tokens (in/out), call
  count, model id + per-model price, and a derived cost estimate; a parent run
  rolls up its children, so a broad target reports a **single total cost**.
- **Observability surface.** Those numbers feed the **admin panel** (S8) — cost
  per target/run/model, running totals against budget, and the priciest
  targets — so the operator can see and tune spend without external tooling. This
  is also why we did not need a framework's bundled "observability": the
  `ingestion_run` ledger + admin *is* it.
- **Dedup as cost control.** `query_existing_data` (don't re-research what the DB
  already holds) and evidence `content_hash` (skip unchanged sources on refresh)
  are the biggest levers on a recursive system and are treated as cost features,
  not just correctness ones.

**What we build regardless of tooling** (our product, not orchestration): the
`ingestion_*` schema, the publish mapper, target definitions + BullMQ wiring, the
agent tools (`spawn_subtarget`, `query_existing_data`, `get_contract`,
`emit_proposal`), the prompts/guardrails, the budget/metering ledger, and the
review gate. No framework or out-of-box product removes this.

**Options considered and rejected:**

- *Anthropic Managed Agents (Claude Agent SDK)* — powerful (hosted multi-agent
  loop, built-in search, versioned agent configs, cron deployments) but a hosted
  dependency that hides the orchestration (counter to the portfolio goal of
  showing our architecture) and leans Anthropic-only.
- *Mastra* — out-of-box TS framework on the same Vercel AI SDK foundation
  (agents, workflows, memory, evals, observability, Studio). On honest review,
  only **evals** is a real win for us (≈ one judge call to DIY); **memory** is a
  poor fit (our `ingestion_*` tables are the memory), and **observability** is
  largely covered by the admin panel + `ingestion_run` provenance. Kept as a clean
  **upgrade path** (it is built on the Vercel AI SDK) if evals/DX later become
  central.
- *LangGraph.js* — deepest orchestration but Python-idiom drag, TS release lag,
  Postgres-checkpointer-centric, heaviest, and redundant with BullMQ.
- *OpenClaw / Hermes Agent* — impressive but **wrong shape**: personal-assistant /
  general-autonomous-agent *applications*, not embeddable extraction libraries.
  Their autonomy (esp. Hermes's self-rewriting skills) fights the auditable,
  contract-validated, gated pipeline we need; integrating one as a separate service
  adds glue while fighting its grain. (Worth stealing one idea: cache reusable
  extraction prompts/source-maps per citizenship × destination × route-type as a
  cost lever — as our own config, not a runtime.)

## Job Model (S2 · Task 2)

_Mostly resolved: BullMQ; manual trigger for Phase 2; idempotency via
content-hash on evidence + `dedup_key`/`supersedes` on proposals; the durable
orchestrator→sub-agent fan-out (above) is how "recursive fill/update" is scoped;
budgets/ceilings bound every run and the whole cascade (Task 5). Still to settle:
scheduled (cron) vs manual split, how much "recursive" is implemented in S6 vs
concept-only, and re-run/refresh cadence (refresh leans Phase 3)._

## Human-in-the-Loop Gate (S2 · Task 4)

_Partly resolved: the gate is a role (human now, AI-assisted later); the proposal
is the atomic review unit; field-level claims + confidence roll-up drive triage
and fast-path. Still to settle: the concrete approve/edit/reject UX and how the
review queue surfaces provenance, confidence, and sources honestly (admin, S8)._
