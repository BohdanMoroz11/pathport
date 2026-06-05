# Database

Pathport uses Postgres with Drizzle for schema definition and migrations.

## Package

Database code lives in `packages/db`.

- `src/schema.ts`: Drizzle schema definitions.
- `src/client.ts`: Postgres pool, Drizzle client, and readiness helpers.
- `migrations/`: SQL migrations.
- `drizzle.config.ts`: Drizzle Kit configuration.

## Schema

The schema implements the [domain model](domain-model.md).

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

### Migration Strategy

The schema is still being designed, so for now there is **no** migration per
change. Instead it pushes the schema onto an empty database:

- The dev workflow uses `drizzle-kit push` (drop and recreate the dev DB freely).
- Tests and the seeder use the programmatic `pushSchema(pool)` helper
  ([packages/db/src/push.ts](../packages/db/src/push.ts)), which generates the DDL
  from the schema and applies it. It depends on `drizzle-kit` and is dev/test-only —
  it must never run on a production path.

A single clean baseline migration replaces this once the schema stabilizes, after
which the seeder, tests, and CI switch back to `db:migrate`.

### Seeding Demo Data

`pnpm db:seed` ([packages/db/src/seed/](../packages/db/src/seed/)) loads throwaway
demo data so the full flow can be developed and demoed end to end. It is
repeatable: it calls `resetSchema` (drop + recreate `public`, then push) before
inserting, so re-running always produces the same clean state.

The data ([data.ts](../packages/db/src/seed/data.ts)) covers the two demo
citizenships (US, Ukraine), three destinations (Germany, Portugal, Spain), and at
least one route of every `route_type`. The humanitarian (Temporary Protection)
routes are Ukraine-only, so the citizenship filter provably differentiates results.
Everything is flagged `is_demo`. The seeder is dev/test-only (it depends on the
push path).

## Commands

The `db:*` scripts are listed in the [README scripts table](../README.md#scripts).
Two notes specific to the current push-based workflow: `db:push` and `db:seed`
drive the schema directly, while `db:migrate` is dormant until the baseline
migration exists. Generate a Drizzle migration with
`pnpm --filter @pathport/db db:generate`.

The local dev database is a Postgres 16 container (`docker-compose.yml`) with
credentials matching `.env.example`:

```text
postgres://pathport:pathport@localhost:5433/pathport
```

## Testing

Database integration tests use Testcontainers and a real Postgres container. They do not mock database behavior.

API integration tests also use a real Postgres container for readiness checks.
