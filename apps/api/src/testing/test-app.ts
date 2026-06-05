import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { createDatabaseClient, createDatabasePool } from "@pathport/db";
import { resetSchema, seedDatabase } from "@pathport/db/testing";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import request from "supertest";
import { AppModule } from "../app.module";

/**
 * Shared harness for the API integration tests (`*.integration.test.ts`): it
 * starts a real Postgres in a container, resets the schema, optionally seeds the
 * demo data, then boots the full Nest application against it. Both integration
 * files use this so the Testcontainers + Nest bootstrap lives in one place.
 *
 * This file is excluded from the production build (tsconfig.build.json) and from
 * coverage (vitest.config.ts), so the test-only deps never reach the image.
 */
export interface ApiTestContext {
  app: INestApplication;
  pool: ReturnType<typeof createDatabasePool>;
  container: StartedPostgreSqlContainer;
  /** Issue a request against the running app. */
  http: () => ReturnType<typeof request>;
}

/**
 * Start a container, prepare the schema, and boot the app. Pass `seed: false`
 * when a test only needs the schema to exist (e.g. readiness checks) rather than
 * the demo rows.
 */
export async function startApiTestContext(options?: { seed?: boolean }): Promise<ApiTestContext> {
  const container = await new PostgreSqlContainer("postgres:16-alpine").start();
  process.env.DATABASE_URL = container.getConnectionUri();
  const pool = createDatabasePool(container.getConnectionUri());

  await resetSchema(pool);
  if (options?.seed ?? true) {
    await seedDatabase(createDatabaseClient(pool));
  }

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  await app.init();

  return {
    app,
    pool,
    container,
    http: () => request(app.getHttpAdapter().getInstance()),
  };
}

/** Tear down everything the harness started, tolerating partial setup. */
export async function stopApiTestContext(context: ApiTestContext | undefined): Promise<void> {
  await context?.app.close();
  await context?.pool.end();
  await context?.container.stop();
}
