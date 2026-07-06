import type {
  DestinationProfile,
  DestinationSummary,
  RouteDetail,
  RouteSummary,
} from "@pathport/contracts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type ApiTestContext, startApiTestContext, stopApiTestContext } from "./testing/test-app";

describe("Read API", () => {
  let ctx: ApiTestContext;
  const http = () => ctx.http();

  beforeAll(async () => {
    ctx = await startApiTestContext();
  }, 120_000);

  afterAll(async () => {
    await stopApiTestContext(ctx);
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

      // routeCount must be a real number, not the string Postgres COUNT returns.
      const germany = destinations.find((d) => d.code === "DE");
      expect(typeof germany?.routeCount).toBe("number");
      expect(germany?.routeCount).toBe(5);
      expect(germany?.arrivalContext?.visaFreeDays).toBe(90);
      expect(germany?.arrivalContext?.isDemo).toBe(true);
    });

    it("is case-insensitive on the citizenship code", async () => {
      await http().get("/citizenships/usa/destinations").expect(200);
    });

    it("404s for an unknown citizenship", async () => {
      await http().get("/citizenships/ZZZ/destinations").expect(404);
    });

    it("400s for a malformed citizenship code", async () => {
      await http().get("/citizenships/this-is-not-a-code/destinations").expect(400);
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

    it("404s when the destination is unknown for a known citizenship", async () => {
      await http().get("/citizenships/USA/destinations/ZZ/routes").expect(404);
    });

    it("400s for a malformed destination code", async () => {
      await http().get("/citizenships/USA/destinations/not-a-code/routes").expect(400);
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

  describe("GET /citizenships/:code/destinations/:code/profile", () => {
    it("assembles the authored Germany shell with destination + pairing content", async () => {
      const response = await http().get("/citizenships/UKR/destinations/DE/profile").expect(200);
      const profile = response.body as DestinationProfile;

      expect(profile.destination).toMatchObject({ code: "DE", name: "Germany" });
      expect(profile.destination.tagline).not.toBe("");
      expect(profile.citizenship.code).toBe("UKR");
      expect(profile.quickFacts.length).toBeGreaterThan(0);
      // Destination-level sections are present…
      expect(profile.country).toBeDefined();
      expect(profile.living).toBeDefined();
      expect(profile.work).toBeDefined();
      expect(profile.family).toBeDefined();
      // …and the reader-specific pairing (UKR → DE is the fully authored one).
      expect(profile.country?.language.official).toContain("German");
      expect(profile.entryDetail).toBeDefined();
      expect(profile.glance.length).toBeGreaterThan(0);
    });

    it("degrades a known pair with no authored pairing to the 'being gathered' stub", async () => {
      // Portugal has no destination-level profile and no pairing rows carry one.
      const response = await http().get("/citizenships/USA/destinations/PT/profile").expect(200);
      const profile = response.body as DestinationProfile;

      expect(profile.destination.code).toBe("PT");
      expect(profile.country).toBeUndefined();
      expect(profile.entry.summary).toMatch(/being gathered/i);
      expect(profile.fitsYouIf.length).toBeGreaterThan(0);
    });

    it("is case-insensitive on both codes", async () => {
      await http().get("/citizenships/ukr/destinations/de/profile").expect(200);
    });

    it("404s for an unknown citizenship or destination", async () => {
      await http().get("/citizenships/ZZZ/destinations/DE/profile").expect(404);
      await http().get("/citizenships/USA/destinations/ZZ/profile").expect(404);
    });

    it("400s for a malformed code", async () => {
      await http().get("/citizenships/USA/destinations/not-a-code/profile").expect(400);
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
