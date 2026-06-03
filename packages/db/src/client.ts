import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as schema from "./schema.js";

export function createDatabasePool(connectionString: string, options: PoolConfig = {}) {
  return new Pool({
    connectionString,
    max: 10,
    ...options,
  });
}

export function createDatabaseClient(pool: Pool) {
  return drizzle(pool, { schema });
}

/**
 * Readiness probe for the API's `/ready` endpoint. Touches a known table rather
 * than `select 1`, so readiness reflects an actually-migrated, usable database
 * (an empty/un-migrated DB fails) — important under horizontal scaling where a
 * replica must not accept traffic before its schema exists.
 */
export async function assertDatabaseReady(pool: Pool) {
  await pool.query("select 1 from citizenships limit 1");
}

export type DatabaseClient = ReturnType<typeof createDatabaseClient>;
