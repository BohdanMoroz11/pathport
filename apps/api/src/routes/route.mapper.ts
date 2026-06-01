import type { RouteDetail, RouteSource, RouteSummary } from "@pathport/contracts";
import type { routeSources, routes } from "@pathport/db";

type RouteRow = typeof routes.$inferSelect;
type RouteSourceRow = typeof routeSources.$inferSelect;

/**
 * Map a route row to the "comparable at a glance" summary contract. Collapses
 * the flat cost/timeline columns into the ranges the UI compares on, and only
 * emits a range when every part of it is present.
 */
export function toRouteSummary(route: RouteRow): RouteSummary {
  return {
    id: route.id,
    type: route.type,
    title: route.title,
    summary: route.summary,
    cost:
      route.costMin !== null && route.costMax !== null && route.costCurrency !== null
        ? { min: route.costMin, max: route.costMax, currency: route.costCurrency }
        : null,
    timeline:
      route.timelineMinMonths !== null && route.timelineMaxMonths !== null
        ? { minMonths: route.timelineMinMonths, maxMonths: route.timelineMaxMonths }
        : null,
    workPermission: route.workPermission,
    familyInclusion: route.familyInclusion,
    familyInclusionNote: route.familyInclusionNote,
    pathToPermanentResidence: route.pathToPermanentResidence,
    pathToPermanentResidenceNote: route.pathToPermanentResidenceNote,
    renewable: route.renewable,
    renewableNote: route.renewableNote,
    reviewStatus: route.reviewStatus,
    confidence: route.confidence,
    isDemo: route.isDemo,
  };
}

function toRouteSource(source: RouteSourceRow): RouteSource {
  return {
    type: source.type,
    label: source.label,
    url: source.url,
    lastReviewedAt: source.lastReviewedAt?.toISOString() ?? null,
  };
}

/**
 * Map a route row plus its destination and sources to the full detail contract.
 * Normalizes the still-volatile JSONB detail fields to present arrays so the UI
 * never has to guard for missing keys.
 */
export function toRouteDetail(
  route: RouteRow,
  destination: { code: string; name: string },
  sources: RouteSourceRow[],
): RouteDetail {
  return {
    ...toRouteSummary(route),
    destination,
    details: {
      requirementGroups: route.details.requirementGroups ?? [],
      documentList: route.details.documentList ?? [],
      eligibilityNotes: route.details.eligibilityNotes ?? [],
      stepNotes: route.details.stepNotes ?? [],
      caveats: route.details.caveats ?? [],
    },
    sources: sources.map(toRouteSource),
  };
}
