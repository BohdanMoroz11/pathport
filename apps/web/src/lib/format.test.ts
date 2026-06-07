import { describe, expect, it } from "vitest";
import {
  booleanLabel,
  formatCost,
  formatReviewDate,
  formatTimeline,
  NOT_SPECIFIED,
  pathToPrLabel,
  ROUTE_TYPE_LABELS,
  workPermissionLabel,
} from "./format";

describe("formatCost", () => {
  it("formats a range with the currency", () => {
    expect(formatCost({ min: 75, max: 100, currency: "EUR" })).toBe("€75 – €100");
  });

  it("collapses an equal min and max to a single value", () => {
    expect(formatCost({ min: 100, max: 100, currency: "EUR" })).toBe("€100");
  });

  it("falls back when there is no cost", () => {
    expect(formatCost(null)).toBe(NOT_SPECIFIED);
  });
});

describe("formatTimeline", () => {
  it("formats a month range", () => {
    expect(formatTimeline({ minMonths: 2, maxMonths: 4 })).toBe("2–4 months");
  });

  it("uses the singular for a single month", () => {
    expect(formatTimeline({ minMonths: 1, maxMonths: 1 })).toBe("1 month");
  });

  it("uses the plural for an equal multi-month value", () => {
    expect(formatTimeline({ minMonths: 6, maxMonths: 6 })).toBe("6 months");
  });

  it("falls back when there is no timeline", () => {
    expect(formatTimeline(null)).toBe(NOT_SPECIFIED);
  });
});

describe("label maps", () => {
  it("labels work permission levels", () => {
    expect(workPermissionLabel("full")).toBe("Full work rights");
    expect(workPermissionLabel("limited")).toBe("Limited work rights");
    expect(workPermissionLabel("none")).toBe("No work rights");
  });

  it("labels permanent-residence paths", () => {
    expect(pathToPrLabel("direct")).toBe("Direct to permanent residence");
    expect(pathToPrLabel("eventual")).toBe("Path to permanent residence");
    expect(pathToPrLabel("none")).toBe("No permanent-residence path");
  });

  it("has a label for every route type", () => {
    expect(ROUTE_TYPE_LABELS.digital_nomad).toBe("Digital nomad");
    expect(ROUTE_TYPE_LABELS.humanitarian).toBe("Humanitarian");
  });
});

describe("booleanLabel", () => {
  it("renders yes/no with an optional note", () => {
    expect(booleanLabel(true, null)).toBe("Yes");
    expect(booleanLabel(false, null)).toBe("No");
    expect(booleanLabel(true, "spouse and children")).toBe("Yes — spouse and children");
  });
});

describe("formatReviewDate", () => {
  it("formats a valid ISO date as YYYY-MM-DD", () => {
    // Exact day is timezone-dependent; assert the shape, not a fixed date.
    expect(formatReviewDate("2025-03-14T12:00:00.000Z")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns null when missing", () => {
    expect(formatReviewDate(null)).toBeNull();
  });

  it("returns null for an unparseable value instead of 'Invalid Date'", () => {
    expect(formatReviewDate("not-a-date")).toBeNull();
  });
});
