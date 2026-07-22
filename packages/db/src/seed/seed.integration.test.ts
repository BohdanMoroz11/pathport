import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { and, eq } from "drizzle-orm";
import type { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDatabaseClient, createDatabasePool, type DatabaseClient } from "../client";
import { resetSchema } from "../migrate";
import {
  citizenships,
  contentCitations,
  destinationContentBlocks,
  destinationCountries,
  routeApplicability,
  routes,
  sourceDocuments,
} from "../schema";
import { demoSeedData } from "./data";
import { seedDatabase } from "./seed";

/** Routes a given citizenship can see, via the applicability join. */
async function routesForCitizenship(db: DatabaseClient, citizenshipCode: string) {
  return db
    .select({ id: routes.id, type: routes.type, title: routes.title })
    .from(routes)
    .innerJoin(routeApplicability, eq(routeApplicability.routeId, routes.id))
    .innerJoin(citizenships, eq(citizenships.id, routeApplicability.citizenshipId))
    .where(eq(citizenships.code, citizenshipCode));
}

describe("demo seed", () => {
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: DatabaseClient;

  beforeAll(async () => {
    container = await new PostgreSqlContainer("postgres:16-alpine").start();
    pool = createDatabasePool(container.getConnectionUri());
    db = createDatabaseClient(pool);

    await resetSchema(pool);
    await seedDatabase(db);
  }, 120_000);

  afterAll(async () => {
    await pool?.end();
    await container?.stop();
  });

  it("seeds the expected citizenships and destinations", async () => {
    const seededCitizenships = await db.select().from(citizenships);
    const seededDestinations = await db.select().from(destinationCountries);

    expect(seededCitizenships.map((row) => row.code).sort()).toEqual(["UKR", "USA"]);
    expect(seededDestinations.map((row) => row.code).sort()).toEqual(["DE", "ES", "PT"]);
  });

  it("exercises every route type in the taxonomy", async () => {
    const seededRoutes = await db.select({ type: routes.type }).from(routes);
    const seededTypes = new Set(seededRoutes.map((row) => row.type));

    const expectedTypes = new Set(demoSeedData.routes.map((route) => route.type));
    expect(seededTypes).toEqual(expectedTypes);
    // Sanity: the demo data should cover the full enum, not a subset.
    expect(seededTypes.size).toBe(9);
  });

  it("marks all seeded content as demo data", async () => {
    const seededRoutes = await db.select({ isDemo: routes.isDemo }).from(routes);
    const seededBlocks = await db
      .select({ isDemo: destinationContentBlocks.isDemo })
      .from(destinationContentBlocks);

    expect(seededRoutes.every((row) => row.isDemo)).toBe(true);
    expect(seededBlocks.every((row) => row.isDemo)).toBe(true);
  });

  it("differentiates results between the two citizenships", async () => {
    const usRoutes = await routesForCitizenship(db, "USA");
    const ukrRoutes = await routesForCitizenship(db, "UKR");

    // Ukraine sees strictly more routes than the US: the humanitarian
    // (Temporary Protection) routes are Ukraine-only.
    expect(ukrRoutes.length).toBeGreaterThan(usRoutes.length);

    const usHasHumanitarian = usRoutes.some((route) => route.type === "humanitarian");
    const ukrHasHumanitarian = ukrRoutes.some((route) => route.type === "humanitarian");
    expect(usHasHumanitarian).toBe(false);
    expect(ukrHasHumanitarian).toBe(true);
  });

  it("stores arrival context for every demo citizenship x destination pair", async () => {
    const seededArrival = await db
      .select()
      .from(destinationContentBlocks)
      .where(eq(destinationContentBlocks.blockKey, "arrivalSummary"));
    expect(seededArrival).toHaveLength(demoSeedData.arrivalContext.length);

    const [usGermany] = await db
      .select()
      .from(destinationContentBlocks)
      .innerJoin(citizenships, eq(citizenships.id, destinationContentBlocks.citizenshipId))
      .innerJoin(
        destinationCountries,
        eq(destinationCountries.id, destinationContentBlocks.destinationCountryId),
      )
      .where(
        and(
          eq(citizenships.code, "USA"),
          eq(destinationCountries.code, "DE"),
          eq(destinationContentBlocks.blockKey, "arrivalSummary"),
        ),
      );

    expect(usGermany?.destination_content_blocks.content).toMatchObject({ visaFreeDays: 90 });
  });

  it("seeds scoped destination blocks and general route citations", async () => {
    const blocks = await db.select().from(destinationContentBlocks);
    expect(blocks.some((block) => block.targetPath === "DE.country")).toBe(true);
    expect(blocks.some((block) => block.targetPath === "USA→DE.entry")).toBe(true);
    expect(blocks.some((block) => block.scope === "route_citizenship")).toBe(true);

    const sources = await db.select().from(sourceDocuments);
    const citations = await db.select().from(contentCitations);
    expect(sources.length).toBeGreaterThan(0);
    expect(citations.length).toBeGreaterThan(0);
  });
});
