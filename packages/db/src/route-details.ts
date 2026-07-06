import { z } from "zod";

/**
 * Runtime schema for the flexible route-detail JSONB. Postgres does not enforce
 * the shape of a `jsonb` column, so this is what actually makes "validated JSONB"
 * true: the seed validates on write and the API validates on read, rather than
 * trusting a compile-time `$type<>()` cast that any bad row could violate.
 *
 * Missing arrays default to empty so a parsed value is always fully normalized —
 * callers never have to guard for absent keys. See docs/domain-model.md.
 */
export const routeRequirementGroupSchema = z.object({
  title: z.string(),
  items: z.array(z.string()),
});

export const routePermitStepSchema = z.object({
  title: z.string(),
  body: z.string(),
});

/** Ordinal difficulty of obtaining the route, least-to-most demanding. */
export const routeComplexitySchema = z.enum(["low", "moderate", "high", "very_high"]);

export const routeDetailsSchema = z.object({
  requirementGroups: z.array(routeRequirementGroupSchema).default([]),
  documentList: z.array(z.string()).default([]),
  eligibilityNotes: z.array(z.string()).default([]),
  stepNotes: z.array(z.string()).default([]),
  caveats: z.array(z.string()).default([]),
  // Card-level comparison signals (lifted onto the RouteSummary by the API).
  complexity: routeComplexitySchema.default("moderate"),
  stepsOverview: z.string().default(""),
  keyRisks: z.array(z.string()).default([]),
  // The comprehensive "how to actually get this permit" walkthrough.
  permitWalkthrough: z.array(routePermitStepSchema).default([]),
});

export type RouteRequirementGroup = z.infer<typeof routeRequirementGroupSchema>;

/** Authoring/storage shape: every array is optional. */
export type RouteDetails = z.input<typeof routeDetailsSchema>;

/** Normalized read shape: every array is present (possibly empty). */
export type NormalizedRouteDetails = z.output<typeof routeDetailsSchema>;

/** Validate and normalize a route's JSONB detail blob. Throws on a bad shape. */
export function parseRouteDetails(value: unknown): NormalizedRouteDetails {
  return routeDetailsSchema.parse(value);
}
