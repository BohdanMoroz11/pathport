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
};

export type RouteRequirementGroup = {
  title: string;
  items: string[];
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
