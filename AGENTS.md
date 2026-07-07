# Agent Notes

These notes preserve context for AI assistant sessions working on Pathport.

## Project Summary

Pathport is a public immigration options explorer. A user should be able to select their citizenship and see relevant migration paths. The project is inspired by simple relocation databases, especially the way they make options easy to scan and compare. Pathport should target a wider audience and avoid being tied to one nationality or language community.

The project is currently in early concept/setup phase.

## Primary Success Criteria

Pathport is primarily a portfolio project. The main goal is to build a polished, usable, well-structured application that demonstrates product thinking, UI craft, clean architecture, and strong TypeScript/JavaScript engineering. If it grows into a genuinely useful public product, that is a welcome outcome.

## User Context

Optional current maintainer-specific context may exist in `docs/user-context.md`. That file is intentionally gitignored.

## Docs As Knowledge Base

Use the `docs/` directory as the project's lightweight knowledge base. Product decisions, research notes, content rules, architecture decisions, data-model sketches, and future planning should live there instead of being buried in chat history.

When new durable context appears, update or add a focused doc in `docs/`. Keep `AGENTS.md` general: it should summarize how to work with the project and point to the docs, not duplicate every detail.

Start with `docs/README.md` to understand the current documentation map.

## Phase Planning

Use `docs/plans/` for living project plans. The project should move through named phase. Each phase should have its own document with stages, tasks, status, notes, and exit criteria.

Treat plan documents as active project state. When work is completed, update the relevant phase plan in the same branch or commit series.

Workflow conventions:

- each phase should happen on a separate branch
- major features or meaningful todo groups should become their own commits
- completing a phase should result in a larger phase PR

Committing conventions:

- Separate commits by concern as much as is reasonable, but achieve the split by
  **staging selectively** (`git add <path>` / `git add -p`), never by rewriting,
  reformatting, or moving code to make the history look tidy. The diff in a
  commit must be the change you actually made — nothing more.
- Do NOT refactor or "clean up" untouched code while committing. If a tidy-up is
  worth doing, it is its own deliberate change, proposed separately — not a
  side effect of organizing commits.
- One file can legitimately span two commits (stage hunks with `git add -p`);
  that is fine and preferred over editing the file to force a clean boundary.

## Product Principles

- Portfolio quality comes first.
- Make immigration options comparable at a glance.
- Keep the product focused on people who want to immigrate or relocate long term. Short-stay or visitor information can appear when useful, but it is supporting context rather than the main product purpose.
- Prefer structured data over article-only content.
- Keep UI calm, fast, and simple.
- Be honest about uncertainty.
- Cite official sources where possible.
- Avoid legal-advice framing.
- Start narrow and useful before trying to be comprehensive.

## Technical Preferences To Remember

- Unless stated otherwise, commit each logical change along the way.
- Prefer a stack that supports a polished demo and clean code over one optimized for premature scale.
- Prioritize maintainability and clear data modeling, because content freshness and source tracking will matter.
- Current technical direction is documented in `docs/architecture.md`.
- Keep frontend and backend separate.
- Treat testing as a first-class showcase feature; prefer TDD where practical.
- Tests are tiered (see `docs/testing.md`): unit (`*.test.ts`, no Docker),
  integration (`*.integration.test.ts`, real Postgres via Testcontainers), and
  Playwright e2e (`tests/e2e/*.spec.ts`). Any DB- or container-backed test MUST
  be named `*.integration.test.ts` so `pnpm test` stays fast and Docker-free —
  never put one in a plain `*.test.ts`.
- Preserve horizontal-scaling readiness: stateless services, external persistent state, explicit config, health/readiness checks, and no single-replica assumptions.
