import type { ContentMetadata, RouteSource } from "./metadata.js";

export type RouteType =
  | "work"
  | "study"
  | "family"
  | "freelance"
  | "digital_nomad"
  | "business"
  | "humanitarian"
  | "long_stay"
  | "other";

export type WorkPermission = "none" | "limited" | "full";

export type PathToPermanentResidence = "none" | "eventual" | "direct";

/**
 * How involved the route is to obtain, as an ordinal signal for the comparison
 * card — bureaucracy, prerequisites, and how much can go wrong, not just cost or
 * time. Ordered least-to-most demanding.
 */
export type RouteComplexity = "low" | "moderate" | "high" | "very_high";

/** Estimated cost range. Null when the route has no cost figures yet. */
export type CostRange = {
  min: number;
  max: number;
  currency: string;
};

/** Estimated processing time in months. Null when unknown. */
export type TimelineRange = {
  minMonths: number;
  maxMonths: number;
};

/**
 * The "comparable at a glance" route card. These are the normalized columns the
 * explorer sorts and compares on, plus the derived metadata signals.
 */
export type RouteSummary = ContentMetadata & {
  id: string;
  type: RouteType;
  title: string;
  summary: string;
  cost: CostRange | null;
  timeline: TimelineRange | null;
  workPermission: WorkPermission;
  familyInclusion: boolean;
  familyInclusionNote: string | null;
  pathToPermanentResidence: PathToPermanentResidence;
  pathToPermanentResidenceNote: string | null;
  renewable: boolean;
  renewableNote: string | null;
  /** How involved the route is to get — the headline comparison signal. */
  complexity: RouteComplexity;
  /** A one-line read of the steps involved, for the card. */
  stepsOverview: string;
  /** The main things that can go wrong / trip people up, for the card. */
  keyRisks: string[];
};

export type RouteRequirementGroup = {
  title: string;
  items: string[];
};

/** One titled stage in the end-to-end "how to actually get this permit" walkthrough. */
export type RoutePermitStep = {
  title: string;
  body: string;
};

/**
 * Flexible, still-volatile route content. Stored as validated JSONB in the
 * database; always normalized to present arrays here so the UI never has to
 * guard for missing fields.
 */
export type RouteDetailContent = {
  requirementGroups: RouteRequirementGroup[];
  documentList: string[];
  eligibilityNotes: string[];
  stepNotes: string[];
  caveats: string[];
  /** End-to-end walkthrough: how you actually go from arrival to this permit. */
  permitWalkthrough: RoutePermitStep[];
};

/** The full route page: every summary field plus detail content and sources. */
export type RouteDetail = RouteSummary & {
  destination: {
    code: string;
    name: string;
  };
  details: RouteDetailContent;
  sources: RouteSource[];
};
