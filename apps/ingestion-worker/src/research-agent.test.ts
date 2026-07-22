import { describe, expect, it } from "vitest";
import {
  parseJsonPayload,
  rentExtractionSchema,
  validateExtractionCitations,
} from "./research-agent";

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

describe("parseJsonPayload", () => {
  it("parses fenced JSON and prose-prefixed arrays", () => {
    expect(parseJsonPayload('```json\n[{"url":"https://example.test"}]\n```')).toEqual([
      { url: "https://example.test" },
    ]);
    expect(parseJsonPayload('I\'ll search first.\n[{"url":"https://example.test"}]')).toEqual([
      { url: "https://example.test" },
    ]);
  });

  it("rejects responses without JSON", () => {
    expect(() => parseJsonPayload("I'll search the web now.")).toThrow(
      "Model response did not contain valid JSON.",
    );
  });
});
