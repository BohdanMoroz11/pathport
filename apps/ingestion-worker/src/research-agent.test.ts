import { describe, expect, it } from "vitest";
import { rentExtractionSchema, validateExtractionCitations } from "./research-agent";

const extraction = {
  rent: {
    note: "Monthly asking rents in representative German cities.",
    rows: [{ city: "Berlin", centre: 1500, outer: 1100, family: 2300 }],
  },
  evidence: [
    {
      url: "https://example.test/statistics",
      title: "Rent statistics",
      publisher: "Statistical office",
      sourceType: "official" as const,
      trustTier: "primary" as const,
      excerpt: "Representative asking-rent figures.",
    },
  ],
  citations: { note: [0], rows: [0] },
};

describe("rent research contract", () => {
  it("accepts a grounded rent profile", () => {
    expect(validateExtractionCitations(rentExtractionSchema.parse(extraction))).toEqual(extraction);
  });

  it("rejects malformed rent rows", () => {
    expect(() =>
      rentExtractionSchema.parse({
        ...extraction,
        rent: { note: "Missing rows", rows: [] },
      }),
    ).toThrow();
  });

  it("rejects citations without evidence", () => {
    expect(() =>
      validateExtractionCitations(
        rentExtractionSchema.parse({ ...extraction, citations: { note: [1], rows: [0] } }),
      ),
    ).toThrow("Citation index 1 has no corresponding evidence.");
  });
});
