import { createDatabaseClient, createDatabasePool } from "../client.js";
import { resetSchema } from "../migrate.js";
import { seedDatabase } from "./seed.js";

/**
 * Repeatable seed entry point: drops and recreates the schema, then loads the
 * demo data. Run against the configured `DATABASE_URL` (defaults to the local
 * docker-compose Postgres). Dev/test only — depends on the drizzle-kit push path.
 */
async function main(): Promise<void> {
  const connectionString =
    process.env.DATABASE_URL ?? "postgres://pathport:pathport@localhost:5433/pathport";
  const pool = createDatabasePool(connectionString);

  try {
    console.info("Resetting schema...");
    await resetSchema(pool);

    console.info("Seeding demo data...");
    const db = createDatabaseClient(pool);
    await seedDatabase(db);

    console.info("Seed complete.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
