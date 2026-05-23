# Agent Notes

These notes preserve context for future Codex or AI assistant sessions working on Pathport.

## Project Summary

Pathport is a public immigration options explorer. A user should be able to select their citizenship and see relevant migration paths: visas, permits, work routes, study routes, family routes, costs, timelines, requirements, tradeoffs, cultural caveats, and links to official sources.

The project is currently in early concept/setup phase.

## Primary Success Criteria

Pathport is primarily a portfolio project. The main goal is to build a polished, usable, well-structured application that demonstrates product thinking, UI craft, clean architecture, and strong TypeScript/JavaScript engineering. But if it grows into a genuinely useful public product, that is a welcome outcome.

Prefer decisions that make the codebase impressive, understandable, maintainable, and easy to demo.

## User Context

Optional maintainer-specific context may exist in `docs/user-context.md`.

That file is intentionally gitignored. It can contain private or local notes about the person currently driving the project, their preferences, constraints, background, and reasons for building Pathport. Use it as helpful context when it exists, but do not assume it is present in every clone or fork.

Do not copy private details from `docs/user-context.md` into tracked files unless the user explicitly asks for that.

## Docs As Knowledge Base

Use the `docs/` directory as the project's lightweight knowledge base. Product decisions, research notes, content rules, architecture decisions, data-model sketches, and future planning should live there instead of being buried in chat history.

When new durable context appears, update or add a focused doc in `docs/`. Keep `AGENTS.md` general: it should summarize how to work with the project and point to the docs, not duplicate every detail.

Start with `docs/README.md` to understand the current documentation map.

## Phase Planning

Use `docs/plans/` for living project plans. The project should move through named phases, from initial project setup through the first MVP production rollout. Each phase should have its own document with stages, tasks, status, notes, and exit criteria.

Treat plan documents as active project state. When work is completed, update the relevant phase plan in the same branch or commit series so future sessions can see what is done, what changed, and what remains.

Workflow conventions:

- each phase should happen on a separate branch
- major features or meaningful todo groups should become their own commits
- completing a phase should result in a larger phase PR
- phase and stage details can change as the project becomes clearer
- keep plan docs honest rather than aspirational; update them when scope changes

## Product Inspiration

The project is inspired by simple relocation databases, especially the way they make options easy to scan and compare. Pathport should target a wider audience and avoid being tied to one nationality or language community.

The goal is not to copy another product directly. The goal is to build a clean, practical, trustworthy immigration research interface.

## Product Principles

- Portfolio quality comes first.
- Make immigration options comparable at a glance.
- Prefer structured data over article-only content.
- Keep UI calm, fast, and simple.
- Be honest about uncertainty.
- Cite official sources where possible.
- Avoid legal-advice framing.
- Start narrow and useful before trying to be comprehensive.

## Technical Preferences To Remember

- Prefer a stack that supports a polished demo and clean code over one optimized for premature scale.
- Prioritize maintainability and clear data modeling, because content freshness and source tracking will matter.
