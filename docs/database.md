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

The Phase 1 schema is stable, so it lives behind a single clean baseline
migration ([packages/db/migrations/](../packages/db/migrations/)), generated with
`drizzle-kit generate`. Everything applies that migration rather than pushing the
schema object directly:

- A real database (dev or prod) runs `pnpm db:migrate` (`drizzle-kit migrate`).
- Tests and the seeder use the programmatic `migrateToLatest(pool)` helper
  ([packages/db/src/migrate.ts](../packages/db/src/migrate.ts)), which runs the
  committed migration files via Drizzle's migrator, so they exercise exactly what
  ships. It is dev/test-only and must never run on a production request path.

During earlier Phase 1 design the schema was iterated with `drizzle-kit push` on a
throwaway DB; that is no longer used. New schema changes now add a migration with
`pnpm --filter @pathport/db db:generate`.

### Seeding Demo Data

`pnpm db:seed` ([packages/db/src/seed/](../packages/db/src/seed/)) loads throwaway
demo data so the full flow can be developed and demoed end to end. It is
repeatable: it calls `resetSchema` (drop + recreate the schema, then apply the
migrations) before inserting, so re-running always produces the same clean state.

The data ([data.ts](../packages/db/src/seed/data.ts)) covers the two demo
citizenships (US, Ukraine), three destinations (Germany, Portugal, Spain), and at
least one route of every `route_type`. The humanitarian (Temporary Protection)
routes are Ukraine-only, so the citizenship filter provably differentiates results.
Everything is flagged `is_demo`. The seeder is dev/test-only (it applies the
migrations through dev tooling).

## Commands

The `db:*` scripts are listed in the [README scripts table](../README.md#scripts).
`db:migrate` applies the committed migrations; `db:seed` resets and reloads the
demo data; `db:generate` creates a new migration after a schema change.

The local dev database is a Postgres 16 container (`docker-compose.yml`) with
credentials matching `.env.example`:

```text
postgres://pathport:pathport@localhost:4312/pathport
```

## Testing

Database integration tests use Testcontainers and a real Postgres container. They do not mock database behavior.

API integration tests also use a real Postgres container for readiness checks.
