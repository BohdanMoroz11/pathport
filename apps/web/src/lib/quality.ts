import type { ContentMetadata, SourceType } from "@pathport/contracts";

export type QualityTone =
  | "demo"
  | "review"
  | "outdated"
  | "estimate"
  | "official"
  | "community"
  | "ai";

export type QualityLabel = {
  label: string;
  tone: QualityTone;
  description: string;
};

/**
 * Derive the user-facing content-quality labels from the raw signals. The labels
 * are never stored or returned pre-computed — they are derived here so they can
 * never drift from the underlying data. Labels stack: a demo route with low
 * confidence shows both "Estimate" and "Demo". Source-dependent labels (official,
 * community, AI-assisted) only appear where the caller has the route's sources;
 * summary cards pass none. See docs/domain-model.md.
 */
export function deriveQualityLabels(
  metadata: ContentMetadata,
  sourceTypes: readonly SourceType[] = [],
): QualityLabel[] {
  const labels: QualityLabel[] = [];
  const { reviewStatus, confidence, isDemo } = metadata;

  if (reviewStatus === "outdated") {
    labels.push({
      label: "Outdated",
      tone: "outdated",
      description: "This information may be out of date and needs re-checking.",
    });
  } else if (reviewStatus === "draft" || reviewStatus === "needs_review") {
    labels.push({
      label: "Needs review",
      tone: "review",
      description: "This entry has not been reviewed yet.",
    });
  } else if (reviewStatus === "reviewed" && sourceTypes.includes("official")) {
    labels.push({
      label: "Official source",
      tone: "official",
      description: "Backed by an official government source.",
    });
  }

  if (confidence === "low") {
    labels.push({
      label: "Estimate",
      tone: "estimate",
      description: "These figures are rough estimates, not confirmed values.",
    });
  }

  if (sourceTypes.includes("community")) {
    labels.push({
      label: "Community note",
      tone: "community",
      description: "Includes community-contributed information.",
    });
  }

  if (sourceTypes.includes("ai_assisted")) {
    labels.push({
      label: "AI-assisted draft",
      tone: "ai",
      description: "Drafted with AI assistance and still needs human review.",
    });
  }

  if (isDemo) {
    labels.push({
      label: "Demo",
      tone: "demo",
      description: "Placeholder demo data, not real immigration guidance.",
    });
  }

  return labels;
}
