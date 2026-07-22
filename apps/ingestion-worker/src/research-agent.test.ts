import { describe, expect, it } from "vitest";
import { extractWebSearchHits, truncateEvidenceArray } from "./minimax-research-agent";
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

describe("extractWebSearchHits", () => {
  it("collects web_search_result blocks from MiniMax tool payloads", () => {
    expect(
      extractWebSearchHits([
        { type: "server_tool_use" },
        {
          type: "web_search_tool_result",
          content: [
            {
              type: "web_search_result",
              url: "https://www.destatis.de/rent",
              title: "Destatis rents",
              content: "Average rent rose in 2023.",
            },
          ],
        },
        {
          type: "web_search_tool_result",
          content: JSON.stringify([
            {
              type: "web_search_result",
              url: "https://example.test/market",
              title: "Market note",
              content: "Berlin centre rents remain elevated.",
            },
          ]),
        },
      ]),
    ).toEqual([
      {
        url: "https://www.destatis.de/rent",
        title: "Destatis rents",
        excerpt: "Average rent rose in 2023.",
      },
      {
        url: "https://example.test/market",
        title: "Market note",
        excerpt: "Berlin centre rents remain elevated.",
      },
    ]);
  });

  it("keeps oversized model arrays within the evidence cap via parse+slice", () => {
    const oversized = Array.from({ length: 12 }, (_, index) => ({
      url: `https://example.test/${index}`,
      title: `Source ${index}`,
      sourceType: "other" as const,
      trustTier: "unknown" as const,
      excerpt: `Excerpt ${index}`,
    }));
    expect(truncateEvidenceArray(oversized)).toHaveLength(8);
    expect(truncateEvidenceArray({ not: "array" })).toEqual({ not: "array" });
  });
});
