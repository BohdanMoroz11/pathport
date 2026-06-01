import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { DestinationSummary, RouteDetail, RouteSummary } from "@pathport/contracts";
import { createDatabaseClient, createDatabasePool } from "@pathport/db";
import { resetSchema, seedDatabase } from "@pathport/db/testing";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "./app.module";

describe("Read API", () => {
  let container: StartedPostgreSqlContainer;
  let pool: ReturnType<typeof createDatabasePool>;
  let app: INestApplication;

  const http = () => request(app.getHttpAdapter().getInstance());

  beforeAll(async () => {
    container = await new PostgreSqlContainer("postgres:16-alpine").start();
    process.env.DATABASE_URL = container.getConnectionUri();
    pool = createDatabasePool(container.getConnectionUri());

    await resetSchema(pool);
    await seedDatabase(createDatabaseClient(pool));

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    await pool?.end();
    await container?.stop();
  });

  describe("GET /citizenships", () => {
    it("lists the demo citizenships alphabetically", async () => {
      const response = await http().get("/citizenships").expect(200);

      expect(response.body).toEqual([
        { code: "UKR", name: "Ukraine" },
        { code: "USA", name: "United States" },
      ]);
    });
  });

  describe("GET /citizenships/:code/destinations", () => {
    it("returns destinations with route counts and arrival context", async () => {
      const response = await http().get("/citizenships/USA/destinations").expect(200);
      const destinations = response.body as DestinationSummary[];

      // Ordered by destination name: Germany, Portugal, Spain.
      expect(destinations.map((d) => d.code)).toEqual(["DE", "PT", "ES"]);
      expect(destinations.every((d) => d.routeCount > 0)).toBe(true);

      const germany = destinations.find((d) => d.code === "DE");
      expect(germany?.arrivalContext?.visaFreeDays).toBe(90);
      expect(germany?.arrivalContext?.isDemo).toBe(true);
    });

    it("is case-insensitive on the citizenship code", async () => {
      await http().get("/citizenships/usa/destinations").expect(200);
    });

    it("404s for an unknown citizenship", async () => {
      await http().get("/citizenships/ZZZ/destinations").expect(404);
    });
  });

  describe("GET /citizenships/:code/destinations/:code/routes", () => {
    it("differentiates results between the two citizenships", async () => {
      const usResponse = await http().get("/citizenships/USA/destinations/DE/routes").expect(200);
      const ukrResponse = await http().get("/citizenships/UKR/destinations/DE/routes").expect(200);

      const usRoutes = usResponse.body as RouteSummary[];
      const ukrRoutes = ukrResponse.body as RouteSummary[];

      // The humanitarian (Temporary Protection) route is Ukraine-only.
      expect(ukrRoutes.length).toBeGreaterThan(usRoutes.length);
      expect(usRoutes.some((r) => r.type === "humanitarian")).toBe(false);
      expect(ukrRoutes.some((r) => r.type === "humanitarian")).toBe(true);
    });

    it("includes comparison fields and content metadata on each card", async () => {
      const response = await http().get("/citizenships/USA/destinations/DE/routes").expect(200);
      const routes = response.body as RouteSummary[];

      const skilledWorker = routes.find((r) => r.title === "Skilled Worker Visa");
      expect(skilledWorker).toMatchObject({
        type: "work",
        cost: { min: 75, max: 100, currency: "EUR" },
        timeline: { minMonths: 2, maxMonths: 4 },
        workPermission: "full",
        reviewStatus: "reviewed",
        confidence: "medium",
        isDemo: true,
      });
    });
  });

  describe("GET /routes/:id", () => {
    it("returns full detail with destination, details, and sources", async () => {
      const list = await http().get("/citizenships/USA/destinations/DE/routes").expect(200);
      const skilledWorker = (list.body as RouteSummary[]).find(
        (r) => r.title === "Skilled Worker Visa",
      );
      expect(skilledWorker).toBeDefined();

      const response = await http().get(`/routes/${skilledWorker?.id}`).expect(200);
      const detail = response.body as RouteDetail;

      expect(detail.destination).toEqual({ code: "DE", name: "Germany" });
      expect(detail.details.requirementGroups.length).toBeGreaterThan(0);
      expect(detail.sources.length).toBeGreaterThan(0);
      expect(detail.sources[0]?.type).toBe("official");
      expect(detail.isDemo).toBe(true);
    });

    it("404s for a well-formed but unknown id", async () => {
      await http().get("/routes/00000000-0000-0000-0000-000000000000").expect(404);
    });

    it("400s for a malformed id", async () => {
      await http().get("/routes/not-a-uuid").expect(400);
    });
  });
});
