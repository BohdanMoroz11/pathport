import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import type { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { assertDatabaseReady, createDatabaseClient, createDatabasePool } from "./client";

describe("database foundation", () => {
  let container: StartedPostgreSqlContainer;
  let pool: Pool;

  beforeAll(async () => {
    container = await new PostgreSqlContainer("postgres:16-alpine").start();
    pool = createDatabasePool(container.getConnectionUri());

    const migration = await readFile(
      resolve(__dirname, "../migrations/0000_initial_foundation.sql"),
      "utf8",
    );

    await pool.query(migration);
  }, 120_000);

  afterAll(async () => {
    await pool.end();
    await container.stop();
  });

  it("connects to a real Postgres database", async () => {
    await expect(assertDatabaseReady(pool)).resolves.toBeUndefined();
  });

  it("creates a Drizzle client", () => {
    expect(createDatabaseClient(pool)).toBeDefined();
  });

  it("creates the foundation tables", async () => {
    const result = await pool.query<{ table_name: string }>(
      `
        select table_name
        from information_schema.tables
        where table_schema = 'public'
        order by table_name
      `,
    );

    expect(result.rows.map((row) => row.table_name)).toEqual([
      "citizenships",
      "destination_countries",
      "route_sources",
      "routes",
    ]);
  });
});
