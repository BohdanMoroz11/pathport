# Database

Pathport uses Postgres with Drizzle for schema definition and migrations.

## Package

Database code lives in `packages/db`.

- `src/schema.ts`: Drizzle schema definitions.
- `src/client.ts`: Postgres pool, Drizzle client, and readiness helpers.
- `migrations/`: SQL migrations.
- `drizzle.config.ts`: Drizzle Kit configuration.

## Schema

### Current implementation before S6

The code currently implements the Phase-1/S3 demo schema:

- `citizenships` — passport/nationality (code + name + flag).
- `destination_countries` — destination identity plus a coarse `profile` JSONB
  for destination-level sections.
- `routes` — one immigration path into a destination, with comparison fields and
  route-detail JSONB.
- `route_applicability` — the route ↔ citizenship join.
- `arrival_context` — originally visa-free/visitor facts, later broadened into a
  citizenship × destination profile blob.
- `route_sources` — route-only source links.

This worked for the demo explorer but is not a good S6 foundation: the page is
filled in smaller pieces, some content is reader-/route-/assumption-scoped, and
sources must support any content piece rather than routes only.

### S6 target schema direction

S6 should rework canonical storage around the destination page aggregate described
in [domain-model.md](domain-model.md):

- `citizenships` — starting passport/origin identities.
- `destinations` — renamed/superseding `destination_countries`; stable identity
  and high-level page fields.
- `destination_content_blocks` — validated JSONB content pieces keyed by
  `destination_id`, `section_key`, `block_key`, `scope_kind`, and optional scope
  refs (`citizenship_id`, `route_id`, `assumptions`). These are the fillable,
  reviewable units for Country/Living/Work/Family/Entry/Overview pieces.
- `destination_routes` — renamed/superseding `routes`; destination-owned child
  records with normalized comparison fields and route detail content.
- `route_applicability` — scoped applicability/interpretation for a route and a
  citizenship/profile.
- `source_documents` — canonical sources/evidence documents, independent of
  which UI surface cites them.
- `content_citations` — links from source documents to the exact block/field/route
  fact they support, via a target reference and `field_path`/JSON pointer.
- `ingestion_*` tables — the proposal layer added by S6: run tree + cost ledger,
  proposals, claims, evidence, decisions, supersession, and publish backlinks.

Enums should keep existing content signals (`review_status`, `confidence`,
`source_type`) and add content-scope / section / block / ingestion status enums
where useful. Prefer real foreign keys for known targets over an entirely opaque
polymorphic target, but keep citations flexible enough to point at block fields and
route/applicability fields.

Validated JSONB remains intentional, but the unit changes: JSONB should be scoped
to a content block or route detail, not one giant destination profile. This keeps
schema churn manageable while making the AI/admin workflow able to fill and cite
one piece at a time.

### Migration Strategy

The Phase 1 baseline lives behind committed migrations
([packages/db/migrations/](../packages/db/migrations/)), generated with
`drizzle-kit generate`. S6 is still pre-MVP and may make a substantial/destructive
schema rework, but it should still land as committed migrations rather than
ad-hoc `push` state. Everything applies migrations rather than pushing the schema
object directly:

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
Everything is flagged `is_demo`. During S6 the seed should be migrated to the
scoped content-block/source-citation model while preserving the same public demo
flow. The seeder is dev/test-only (it applies the migrations through dev tooling).

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
