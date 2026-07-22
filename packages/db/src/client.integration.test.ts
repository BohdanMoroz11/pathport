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
import { migrateToLatest } from "./migrate";
import {
  citizenships,
  contentCitations,
  destinationContentBlocks,
  destinationCountries,
  routeApplicability,
  routes,
  sourceDocuments,
} from "./schema";

describe("database foundation", () => {
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: DatabaseClient;

  beforeAll(async () => {
    container = await new PostgreSqlContainer("postgres:16-alpine").start();
    pool = createDatabasePool(container.getConnectionUri());
    db = createDatabaseClient(pool);

    await migrateToLatest(pool);
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

  it("creates the canonical domain tables", async () => {
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
      "content_citations",
      "destination_content_blocks",
      "destination_countries",
      "route_applicability",
      "routes",
      "source_documents",
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

  it("persists scoped content blocks and general citations", async () => {
    const [destination] = await db
      .insert(destinationCountries)
      .values({ code: "ES", name: "Spain" })
      .returning();
    const [block] = await db
      .insert(destinationContentBlocks)
      .values({
        destinationCountryId: destination.id,
        sectionKey: "living",
        blockKey: "rent",
        scope: "assumption",
        assumptions: { household: "single renter" },
        content: { summary: "Demo rent note." },
        targetPath: "ES.living.rent",
        reviewStatus: "needs_review",
        confidence: "low",
      })
      .returning();
    const [source] = await db
      .insert(sourceDocuments)
      .values({ type: "official", label: "Official statistics", url: "https://example.test/es" })
      .returning();

    await db.insert(contentCitations).values({
      sourceDocumentId: source.id,
      targetType: "destination_content_block",
      targetId: block.id,
      fieldPath: "summary",
    });

    const citations = await db
      .select()
      .from(contentCitations)
      .where(eq(contentCitations.targetId, block.id));
    expect(citations).toHaveLength(1);
  });

  it("stores arrival context as a scoped citizenship x destination block", async () => {
    const [citizenship] = await db
      .insert(citizenships)
      .values({ code: "UKR", name: "Ukraine" })
      .returning();
    const [destination] = await db
      .insert(destinationCountries)
      .values({ code: "PT", name: "Portugal" })
      .returning();

    const [context] = await db
      .insert(destinationContentBlocks)
      .values({
        citizenshipId: citizenship.id,
        destinationCountryId: destination.id,
        sectionKey: "overview",
        blockKey: "arrivalSummary",
        scope: "citizenship_destination",
        targetPath: "UKR→PT.arrivalSummary",
        content: { visaFreeDays: 90, summary: "Visa-free short stays." },
        isDemo: true,
      })
      .returning();

    expect(context.content).toEqual({ visaFreeDays: 90, summary: "Visa-free short stays." });
  });
});
