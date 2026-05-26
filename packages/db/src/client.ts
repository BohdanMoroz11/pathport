import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as schema from "./schema";

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

export async function assertDatabaseReady(pool: Pool) {
  await pool.query("select 1");
}

export type DatabaseClient = ReturnType<typeof createDatabaseClient>;
