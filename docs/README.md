# Docs

This directory is the project knowledge base for Pathport. Use it to keep durable product context, research, content rules, architecture notes, and decisions out of chat history.

## Current Docs

- [project-brief.md](project-brief.md): Core product concept, problem statement, target user, portfolio-first goal, MVP shape, and open product questions.
- [domain-model.md](domain-model.md): Phase 1 domain vocabulary — citizenship-first flow, entities and relationships, route summary/detail fields, and source/review/confidence/demo metadata.
- [architecture.md](architecture.md): Initial technical direction, stack decisions, scaling principles, and testing strategy.
- [repository-structure.md](repository-structure.md): Monorepo layout, app/package responsibilities, and planned local development commands.
- [testing.md](testing.md): Testing strategy, quality targets, and validation commands.
- [database.md](database.md): Postgres/Drizzle setup, initial schema, migrations, and real-database testing approach.
- [api.md](api.md): Read-only API endpoints for the citizenship-first explorer, shared response contracts, and metadata handling.
- [web.md](web.md): Citizenship-first web explorer — page flow, the contracts/data boundary, derived quality labels, and frontend testing.
- [competitive-landscape.md](competitive-landscape.md): Notes from similar relocation, immigration, expat, and digital-nomad products, including patterns to borrow and gaps Pathport can explore.
- [content-principles.md](content-principles.md): Source hierarchy, uncertainty handling, metadata expectations, AI-use boundaries, and legal-advice guardrails.
- [plans/](plans/README.md): Living phase plans for project execution, from initial setup through the first MVP rollout.

## Local-Only Docs

- `user-context.md`: Optional private maintainer context. This file is gitignored on purpose and may not exist in every clone. Use it for personal background, preferences, constraints, or motivation that should help local AI sessions but should not be committed to the public repo.

## How To Add Docs

Add a new focused document when a topic becomes durable enough to outlive a chat session. Prefer small docs with clear names over one giant notes file.

Good future candidates:

- `architecture.md`
- `data-model.md`
- `mvp-scope.md`
- `design-principles.md`
- `research-method.md`
- `decisions.md`

When adding a tracked doc, update this index with a one-line summary.
