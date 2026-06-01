# Database

Status: Draft

Pathport uses Postgres with Drizzle for schema definition and migrations.

## Package

Database code lives in `packages/db`.

- `src/schema.ts`: Drizzle schema definitions.
- `src/client.ts`: Postgres pool, Drizzle client, and readiness helpers.
- `migrations/`: SQL migrations.
- `drizzle.config.ts`: Drizzle Kit configuration.

## Phase 1 Schema

The schema implements the Phase 1 domain model ([domain-model.md](domain-model.md)).

Tables:

- `citizenships` — passport/nationality (code + name).
- `destination_countries` — countries a person can migrate to (code + name).
- `routes` — one immigration path into a single destination. Holds the comparison
  fields (cost/timeline ranges, work permission, family inclusion, path-to-PR,
  renewable), flexible detail content as validated JSONB (`details`), and content
  metadata (`review_status`, `confidence`, `is_demo`).
- `route_applicability` — the `route ↔ citizenship` join the citizenship-first UI
  filters on. Unique on `(route_id, citizenship_id)`.
- `arrival_context` — visa-free / visitor / arrival facts for a
  `citizenship × destination` pair. Unique on `(citizenship_id, destination_country_id)`.
- `route_sources` — source links per route (type, label, url, last reviewed).

Enums: `review_status`, `route_type`, `source_type`, `confidence`, `work_permission`,
`path_to_pr`.

### Migration Strategy During Phase 1

The schema is still being designed, so Phase 1 does **not** generate a migration per
change. Instead it pushes the schema onto an empty database:

- The dev workflow uses `drizzle-kit push` (drop and recreate the dev DB freely).
- Tests and the seeder use the programmatic `pushSchema(pool)` helper
  ([packages/db/src/push.ts](../packages/db/src/push.ts)), which generates the DDL
  from the schema and applies it. It depends on `drizzle-kit` and is dev/test-only —
  it must never run on a production path.

A single clean baseline migration replaces this once the schema stabilizes (plan S6),
after which the seeder, tests, and CI switch back to `db:migrate`.

## Commands

From the repo root:

- `pnpm db:up`: start the local Postgres container.
- `pnpm db:down`: stop the local Postgres container.
- `pnpm db:logs`: follow local Postgres logs.
- `pnpm db:push`: push the current schema onto the configured `DATABASE_URL` (Phase 1 dev workflow).
- `pnpm db:migrate`: apply migrations to the configured `DATABASE_URL` (used once the baseline migration exists in S6).
- `pnpm --filter @pathport/db db:generate`: generate a Drizzle migration from schema changes.
- `pnpm --filter @pathport/db db:migrate`: apply migrations using `DATABASE_URL`.

## Local Development

Local development uses `docker-compose.yml` at the repo root. It starts a Postgres 16 container with credentials matching `.env.example`:

```text
postgres://pathport:pathport@localhost:5433/pathport
```

First local run:

```sh
cp .env.example .env
pnpm db:up
pnpm db:push
pnpm dev
```

## Testing

Database integration tests use Testcontainers and a real Postgres container. They do not mock database behavior.

API integration tests also use a real Postgres container for readiness checks.
