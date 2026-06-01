import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { eq } from "drizzle-orm";
import type { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  assertDatabaseReady,
  createDatabaseClient,
  createDatabasePool,
  type DatabaseClient,
} from "./client";
import { pushSchema } from "./push";
import {
  arrivalContext,
  citizenships,
  destinationCountries,
  routeApplicability,
  routes,
} from "./schema";

describe("database foundation", () => {
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: DatabaseClient;

  beforeAll(async () => {
    container = await new PostgreSqlContainer("postgres:16-alpine").start();
    pool = createDatabasePool(container.getConnectionUri());
    db = createDatabaseClient(pool);

    await pushSchema(pool);
  }, 120_000);

  afterAll(async () => {
    await pool?.end();
    await container?.stop();
  });

  it("connects to a real Postgres database", async () => {
    await expect(assertDatabaseReady(pool)).resolves.toBeUndefined();
  });

  it("creates a Drizzle client", () => {
    expect(createDatabaseClient(pool)).toBeDefined();
  });

  it("creates the Phase 1 domain tables", async () => {
    const result = await pool.query<{ table_name: string }>(
      `
        select table_name
        from information_schema.tables
        where table_schema = 'public'
        order by table_name
      `,
    );

    expect(result.rows.map((row) => row.table_name)).toEqual([
      "arrival_context",
      "citizenships",
      "destination_countries",
      "route_applicability",
      "route_sources",
      "routes",
    ]);
  });

  it("persists a route with comparison fields, JSONB details, and applicability", async () => {
    const [citizenship] = await db
      .insert(citizenships)
      .values({ code: "USA", name: "United States" })
      .returning();
    const [destination] = await db
      .insert(destinationCountries)
      .values({ code: "DE", name: "Germany" })
      .returning();

    const [route] = await db
      .insert(routes)
      .values({
        destinationCountryId: destination.id,
        type: "work",
        title: "Skilled Worker Visa",
        summary: "Work route for qualified professionals.",
        costMin: 75,
        costMax: 150,
        costCurrency: "EUR",
        timelineMinMonths: 2,
        timelineMaxMonths: 4,
        workPermission: "full",
        familyInclusion: true,
        pathToPermanentResidence: "eventual",
        renewable: true,
        details: {
          requirementGroups: [{ title: "Eligibility", items: ["Recognized qualification"] }],
          caveats: ["Demo data; verify before applying."],
        },
        reviewStatus: "needs_review",
        confidence: "low",
        isDemo: true,
      })
      .returning();

    await db
      .insert(routeApplicability)
      .values({ routeId: route.id, citizenshipId: citizenship.id });

    const stored = await db.query.routes.findFirst({ where: eq(routes.id, route.id) });
    expect(stored?.details.requirementGroups?.[0]?.items).toEqual(["Recognized qualification"]);
    expect(stored?.workPermission).toBe("full");
    expect(stored?.isDemo).toBe(true);

    const applicable = await db
      .select()
      .from(routeApplicability)
      .where(eq(routeApplicability.citizenshipId, citizenship.id));
    expect(applicable).toHaveLength(1);
  });

  it("stores arrival context for a citizenship x destination pair", async () => {
    const [citizenship] = await db
      .insert(citizenships)
      .values({ code: "UKR", name: "Ukraine" })
      .returning();
    const [destination] = await db
      .insert(destinationCountries)
      .values({ code: "PT", name: "Portugal" })
      .returning();

    const [context] = await db
      .insert(arrivalContext)
      .values({
        citizenshipId: citizenship.id,
        destinationCountryId: destination.id,
        visaFreeDays: 90,
        summary: "Visa-free short stays in the Schengen area.",
        isDemo: true,
      })
      .returning();

    expect(context.visaFreeDays).toBe(90);
  });
});
