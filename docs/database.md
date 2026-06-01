# Database

Status: Draft

Pathport uses Postgres with Drizzle for schema definition and migrations.

## Package

Database code lives in `packages/db`.

- `src/schema.ts`: Drizzle schema definitions.
- `src/client.ts`: Postgres pool, Drizzle client, and readiness helpers.
- `migrations/`: SQL migrations.
- `drizzle.config.ts`: Drizzle Kit configuration.

## Initial Schema

Phase 0 defines foundation tables only:

- `citizenships`
- `destination_countries`
- `routes`
- `route_sources`

These tables are intentionally minimal. Product decisions such as the first citizenship, destination set, route taxonomy details, and demo data belong to future phases.

## Commands

From the repo root:

- `pnpm db:up`: start the local Postgres container.
- `pnpm db:down`: stop the local Postgres container.
- `pnpm db:logs`: follow local Postgres logs.
- `pnpm db:migrate`: apply migrations to the configured `DATABASE_URL`.
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
pnpm db:migrate
pnpm dev
```

## Testing

Database integration tests use Testcontainers and a real Postgres container. They do not mock database behavior.

API integration tests also use a real Postgres container for readiness checks.
