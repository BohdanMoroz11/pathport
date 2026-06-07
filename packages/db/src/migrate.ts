import { join } from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { Pool } from "pg";
import { createDatabaseClient } from "./client.js";

// The committed baseline migration lives at <package>/migrations, one level up
// from both src/ (tests, tsx seed) and dist/ (built output), so this resolves
// the same way whichever entry point runs.
const migrationsFolder = join(__dirname, "../migrations");

/**
 * Apply all committed migrations to the target database, creating the schema if
 * it does not exist yet and recording applied migrations in drizzle's tracking
 * table. Tests and the seeder run the real migration files this way, so they
 * exercise exactly what `pnpm db:migrate` ships to a real database.
 *
 * Depends on the checked-in `migrations/` folder; dev/test contexts and the
 * one-shot seeder use it, never a long-running production request path.
 */
export async function migrateToLatest(pool: Pool): Promise<void> {
  await migrate(createDatabaseClient(pool), { migrationsFolder });
}

/**
 * Drop everything and rebuild the schema from the committed migrations. This is
 * the repeatable "drop and recreate the dev DB" workflow used by the seeder and
 * by tests that want a guaranteed-clean slate. The `drizzle` schema holding the
 * migration-tracking table is dropped too, so migrations re-apply from scratch.
 *
 * Same constraints as {@link migrateToLatest}: dev/test only, never production.
 */
export async function resetSchema(pool: Pool): Promise<void> {
  await pool.query("drop schema if exists public cascade");
  await pool.query("drop schema if exists drizzle cascade");
  await pool.query("create schema public");
  await migrateToLatest(pool);
}
