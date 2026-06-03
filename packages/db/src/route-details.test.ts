import { describe, expect, it } from "vitest";
import { parseRouteDetails } from "./route-details.js";

describe("parseRouteDetails", () => {
  it("normalizes a partial blob to all-present arrays", () => {
    const result = parseRouteDetails({
      requirementGroups: [{ title: "Core", items: ["A degree"] }],
    });

    expect(result).toEqual({
      requirementGroups: [{ title: "Core", items: ["A degree"] }],
      documentList: [],
      eligibilityNotes: [],
      stepNotes: [],
      caveats: [],
    });
  });

  it("normalizes an empty object to empty arrays", () => {
    expect(parseRouteDetails({})).toEqual({
      requirementGroups: [],
      documentList: [],
      eligibilityNotes: [],
      stepNotes: [],
      caveats: [],
    });
  });

  it("rejects a malformed requirement group (validation actually runs)", () => {
    expect(() => parseRouteDetails({ requirementGroups: [{ title: "Missing items" }] })).toThrow();
  });

  it("rejects wrong-typed fields", () => {
    expect(() => parseRouteDetails({ documentList: "passport" })).toThrow();
    expect(() => parseRouteDetails(null)).toThrow();
  });
});
