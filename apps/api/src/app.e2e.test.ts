import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { createDatabasePool } from "@pathport/db";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "./app.module";

describe("App API", () => {
  let container: StartedPostgreSqlContainer;
  let pool: ReturnType<typeof createDatabasePool>;
  let app: INestApplication;

  beforeAll(async () => {
    container = await new PostgreSqlContainer("postgres:16-alpine").start();
    process.env.DATABASE_URL = container.getConnectionUri();
    pool = createDatabasePool(container.getConnectionUri());

    const migration = await readFile(
      resolve(__dirname, "../../../packages/db/migrations/0000_initial_foundation.sql"),
      "utf8",
    );

    await pool.query(migration);

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
    await container.stop();
  });

  it("responds to /health", async () => {
    const response = await request(app.getHttpAdapter().getInstance()).get("/health").expect(200);

    expect(response.body).toEqual({
      ok: true,
      service: "api",
    });
  });

  it("responds to /ready", async () => {
    const response = await request(app.getHttpAdapter().getInstance()).get("/ready").expect(200);

    expect(response.body).toEqual({
      ok: true,
      service: "api",
    });
  });
});
