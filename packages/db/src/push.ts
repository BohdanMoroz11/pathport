import { generateDrizzleJson, generateMigration } from "drizzle-kit/api";
import type { Pool } from "pg";
import * as schema from "./schema.js";

/**
 * Create the full current schema on an empty database by generating the DDL
 * from the Drizzle schema and executing it.
 *
 * This is the "push" path used during Phase 1 by tests and the seeder so they
 * do not depend on migration files while the schema is still being designed.
 * It assumes an empty target (no diffing against existing objects). A single
 * baseline migration replaces this once the schema stabilizes (plan S6).
 *
 * Depends on drizzle-kit (a dev dependency) and must only be used in
 * development/test contexts, never on a production runtime path.
 */
export async function pushSchema(pool: Pool): Promise<void> {
  const empty = generateDrizzleJson({});
  const current = generateDrizzleJson(schema, empty.id);
  const statements = await generateMigration(empty, current);

  for (const statement of statements) {
    await pool.query(statement);
  }
}

/**
 * Drop everything in the public schema and rebuild it from the current Drizzle
 * schema. This is the repeatable "drop and recreate the dev DB" workflow used
 * by the seeder and by tests that want a guaranteed-clean slate.
 *
 * Same constraints as {@link pushSchema}: dev/test only, never production.
 */
export async function resetSchema(pool: Pool): Promise<void> {
  await pool.query("drop schema if exists public cascade");
  await pool.query("create schema public");
  await pushSchema(pool);
}
