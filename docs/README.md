# Docs

This directory is the project knowledge base for Pathport: durable product
context, research, content rules, architecture notes, and decisions kept out of
chat history.

> Pathport is in early development. Everything here describes current intent and
> may still change.

## Current Docs

- [project-brief.md](project-brief.md): product concept, problem, target user, and MVP shape.
- [domain-model.md](domain-model.md): the citizenship-first domain — entities, route fields, and metadata.
- [architecture.md](architecture.md): technical direction, stack, and scaling principles.
- [repository-structure.md](repository-structure.md): monorepo layout and app/package responsibilities.
- [testing.md](testing.md): testing strategy, quality targets, and layers.
- [database.md](database.md): Postgres/Drizzle setup, schema, and seeding.
- [api.md](api.md): read-only API endpoints and shared contracts.
- [data-gathering.md](data-gathering.md): the AI-assisted data-gathering layer concept — ingestion model, proposals, review gate, and the publish boundary.
- [web.md](web.md): the web explorer — page flow, data boundary, and derived labels.
- [design-direction.md](design-direction.md): the frontend visual/structural direction (mood, layout, tokens) with a working concept mockup.
- [design-system.md](design-system.md): the settled design system — tokens, primitives, composed patterns, and a11y conventions.
- [competitive-landscape.md](competitive-landscape.md): patterns and gaps from adjacent products.
- [content-principles.md](content-principles.md): source hierarchy, uncertainty, and legal guardrails.
- [plans/](plans/README.md): living phase plans for execution.

## Local-Only Docs

- `user-context.md`: optional private maintainer context, gitignored on purpose
  and may not exist in every clone. Personal background or preferences that help
  local AI sessions but should not be committed.

## How To Add Docs

Add a focused doc when a topic becomes durable enough to outlive a chat session;
prefer small, clearly named docs over one giant notes file, and add a one-line
summary to the index above.
