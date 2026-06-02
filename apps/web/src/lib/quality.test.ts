import type { ContentMetadata } from "@pathport/contracts";
import { describe, expect, it } from "vitest";
import { deriveQualityLabels } from "./quality";

const metadata = (overrides: Partial<ContentMetadata> = {}): ContentMetadata => ({
  reviewStatus: "reviewed",
  confidence: "high",
  isDemo: false,
  ...overrides,
});

const labelTexts = (...args: Parameters<typeof deriveQualityLabels>) =>
  deriveQualityLabels(...args).map((label) => label.label);

describe("deriveQualityLabels", () => {
  it("returns no labels for clean, reviewed, non-demo content", () => {
    expect(deriveQualityLabels(metadata())).toEqual([]);
  });

  it("marks outdated content over any other review state", () => {
    expect(labelTexts(metadata({ reviewStatus: "outdated" }))).toEqual(["Outdated"]);
  });

  it("flags draft and needs-review content as needing review", () => {
    expect(labelTexts(metadata({ reviewStatus: "draft" }))).toEqual(["Needs review"]);
    expect(labelTexts(metadata({ reviewStatus: "needs_review" }))).toEqual(["Needs review"]);
  });

  it("shows an official-source label only when reviewed and an official source exists", () => {
    expect(labelTexts(metadata({ reviewStatus: "reviewed" }), ["official"])).toEqual([
      "Official source",
    ]);
    // Reviewed but without an official source: no review label at all.
    expect(labelTexts(metadata({ reviewStatus: "reviewed" }), ["community"])).toEqual([
      "Community note",
    ]);
  });

  it("treats low confidence as an estimate", () => {
    expect(labelTexts(metadata({ confidence: "low" }))).toContain("Estimate");
  });

  it("surfaces community and AI-assisted sources", () => {
    expect(labelTexts(metadata(), ["community", "ai_assisted"])).toEqual(
      expect.arrayContaining(["Community note", "AI-assisted draft"]),
    );
  });

  it("ignores source-dependent labels when no sources are supplied", () => {
    expect(labelTexts(metadata({ reviewStatus: "reviewed" }))).toEqual([]);
  });

  it("stacks labels — a low-confidence demo route shows both", () => {
    expect(labelTexts(metadata({ confidence: "low", isDemo: true }))).toEqual(["Estimate", "Demo"]);
  });

  it("carries a description for each label", () => {
    const labels = deriveQualityLabels(metadata({ reviewStatus: "outdated", isDemo: true }));
    expect(labels.every((label) => label.description.length > 0)).toBe(true);
  });
});
