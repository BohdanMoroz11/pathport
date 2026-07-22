import type { routes } from "@pathport/db";
import { describe, expect, it } from "vitest";
import { toRouteDetail, toRouteSummary } from "./route.mapper";

type RouteRow = typeof routes.$inferSelect;
type RouteSourceRow = {
  type: "official" | "legal" | "community" | "ai_assisted" | "other";
  label: string;
  url: string;
  lastReviewedAt: Date | null;
};

// A fully-populated row; individual tests override just the fields they exercise.
// The seed data always has complete ranges, so the null branches below are only
// reachable through unit tests like these (integration tests never hit them).
const baseRoute: RouteRow = {
  id: "11111111-1111-1111-1111-111111111111",
  destinationCountryId: "22222222-2222-2222-2222-222222222222",
  type: "work",
  title: "Skilled Worker Visa",
  summary: "Work route.",
  costMin: 75,
  costMax: 100,
  costCurrency: "EUR",
  timelineMinMonths: 2,
  timelineMaxMonths: 4,
  workPermission: "full",
  familyInclusion: true,
  familyInclusionNote: "Spouse and children.",
  pathToPermanentResidence: "eventual",
  pathToPermanentResidenceNote: "After 5 years.",
  renewable: true,
  renewableNote: "Renewable once.",
  details: {},
  reviewStatus: "reviewed",
  confidence: "medium",
  isDemo: true,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

describe("toRouteSummary", () => {
  it("emits cost and timeline ranges when every part is present", () => {
    const summary = toRouteSummary(baseRoute);

    expect(summary.cost).toEqual({ min: 75, max: 100, currency: "EUR" });
    expect(summary.timeline).toEqual({ minMonths: 2, maxMonths: 4 });
  });

  it("passes the scalar comparison fields and metadata straight through", () => {
    expect(toRouteSummary(baseRoute)).toMatchObject({
      id: baseRoute.id,
      type: "work",
      title: "Skilled Worker Visa",
      workPermission: "full",
      familyInclusion: true,
      familyInclusionNote: "Spouse and children.",
      pathToPermanentResidence: "eventual",
      renewable: true,
      reviewStatus: "reviewed",
      confidence: "medium",
      isDemo: true,
    });
  });

  it.each([
    ["costMin", { costMin: null }],
    ["costMax", { costMax: null }],
    ["costCurrency", { costCurrency: null }],
  ])("returns a null cost when %s is missing", (_field, override) => {
    expect(toRouteSummary({ ...baseRoute, ...override }).cost).toBeNull();
  });

  it.each([
    ["timelineMinMonths", { timelineMinMonths: null }],
    ["timelineMaxMonths", { timelineMaxMonths: null }],
  ])("returns a null timeline when %s is missing", (_field, override) => {
    expect(toRouteSummary({ ...baseRoute, ...override }).timeline).toBeNull();
  });

  it("defaults the card signals when the JSONB omits them", () => {
    const summary = toRouteSummary(baseRoute);

    expect(summary.complexity).toBe("moderate");
    expect(summary.stepsOverview).toBe("");
    expect(summary.keyRisks).toEqual([]);
  });

  it("lifts authored complexity, steps overview, and key risks from the JSONB", () => {
    const summary = toRouteSummary({
      ...baseRoute,
      details: {
        complexity: "high",
        stepsOverview: "Get a job offer, then apply from abroad.",
        keyRisks: ["Qualification recognition is slow."],
      },
    });

    expect(summary.complexity).toBe("high");
    expect(summary.stepsOverview).toBe("Get a job offer, then apply from abroad.");
    expect(summary.keyRisks).toEqual(["Qualification recognition is slow."]);
  });
});

describe("toRouteDetail", () => {
  const destination = { code: "DE", name: "Germany" };

  const baseSource: RouteSourceRow = {
    type: "official",
    label: "Official page",
    url: "https://example.gov",
    lastReviewedAt: new Date("2026-02-03T00:00:00Z"),
  };

  it("includes the destination and normalizes the JSONB details to arrays", () => {
    const detail = toRouteDetail(baseRoute, destination, []);

    expect(detail.destination).toEqual(destination);
    expect(detail.details.requirementGroups).toEqual([]);
    expect(detail.details.documentList).toEqual([]);
    expect(detail.sources).toEqual([]);
  });

  it("serializes a source's lastReviewedAt to an ISO string", () => {
    const [source] = toRouteDetail(baseRoute, destination, [baseSource]).sources;

    expect(source?.lastReviewedAt).toBe("2026-02-03T00:00:00.000Z");
  });

  it("maps a missing lastReviewedAt to null", () => {
    const [source] = toRouteDetail(baseRoute, destination, [
      { ...baseSource, lastReviewedAt: null },
    ]).sources;

    expect(source?.lastReviewedAt).toBeNull();
  });
});
