/**
 * Content-quality signals shared by anything that holds migration content.
 * These mirror the database enums but are declared independently so the web app
 * can depend on the contracts package without pulling in the database layer.
 * The API mappers assign database rows into these types, which makes the
 * compiler reject any drift where the database could return an unlisted value.
 * See docs/domain-model.md.
 */
export type ReviewStatus = "draft" | "needs_review" | "reviewed" | "outdated";

export type Confidence = "low" | "medium" | "high";

export type SourceType = "official" | "legal" | "community" | "ai_assisted" | "other";

/** The three independent metadata signals carried by content records. */
export type ContentMetadata = {
  reviewStatus: ReviewStatus;
  confidence: Confidence;
  isDemo: boolean;
};

/** A single citation attached to a route. */
export type RouteSource = {
  type: SourceType;
  label: string;
  url: string;
  /** ISO-8601 timestamp, or null when the source has not been reviewed. */
  lastReviewedAt: string | null;
};
