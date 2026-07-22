import { describe, expect, it } from "vitest";
import { assembleReviewedClaims } from "./publish-mapper";

describe("assembleReviewedClaims", () => {
  it("blocks when a required claim has not cleared review", () => {
    expect(
      assembleReviewedClaims([
        {
          fieldPath: "content.summary",
          value: "x",
          required: true,
          decision: "held",
          editedValue: null,
        },
      ]),
    ).toEqual({ status: "blocked", missingRequiredFields: ["content.summary"] });
  });

  it("uses reviewer edits and marks a subset as partially applied", () => {
    expect(
      assembleReviewedClaims([
        {
          fieldPath: "content.amount",
          value: 1000,
          required: true,
          decision: "edited",
          editedValue: 900,
        },
        {
          fieldPath: "content.note",
          value: "uncertain",
          required: false,
          decision: "rejected",
          editedValue: null,
        },
      ]),
    ).toEqual({
      status: "partially_applied",
      payload: { content: { amount: 900 } },
      publishedFields: ["content.amount"],
    });
  });
});
