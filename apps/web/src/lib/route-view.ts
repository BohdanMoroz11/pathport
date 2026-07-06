import type { PathToPermanentResidence, RouteSummary, WorkPermission } from "@pathport/contracts";
import type { AccentTone } from "@/lib/destination/types";
import { pathToPrLabel, ROUTE_TYPE_ORDER, workPermissionLabel } from "@/lib/format";

/**
 * Presentation helpers that map a route's normalized signals onto the
 * destination shell's functional tone system, so the Routes comparison and the
 * detail view read the same signal the same way (a fuller work permission or a
 * direct PR path is always the "greener" read). Kept JSX-free so both server and
 * client components can import them. The underlying route model lives in
 * @pathport/contracts; this is display-only.
 */

/** Work permission → tone: full rights read as positive, none as neutral. */
export const WORK_TONE: Record<WorkPermission, AccentTone> = {
  full: "pos",
  limited: "warn",
  none: "neutral",
};

/** Path to permanent residence → tone: a direct path is the best read. */
export const PR_TONE: Record<PathToPermanentResidence, AccentTone> = {
  direct: "pos",
  eventual: "brand",
  none: "neutral",
};

/** Concise values for the detail fact grid, where the tile's label carries the
 * context (so "Full" reads under a "Work rights" label, not "Full work rights"). */
export const WORK_SHORT: Record<WorkPermission, string> = {
  full: "Full",
  limited: "Limited",
  none: "None",
};

export const PR_SHORT: Record<PathToPermanentResidence, string> = {
  direct: "Direct",
  eventual: "Eventual",
  none: "None",
};

/** A compact, tone-coded ordinal signal for a route (work, PR, family, …). */
export type RouteSignal = { label: string; value: string; tone: AccentTone };

/** The ordinal signals a route is compared on, in a stable order. */
export function routeSignals(route: RouteSummary): RouteSignal[] {
  return [
    {
      label: "Work rights",
      value: workPermissionLabel(route.workPermission),
      tone: WORK_TONE[route.workPermission],
    },
    {
      label: "Permanent residence",
      value: pathToPrLabel(route.pathToPermanentResidence),
      tone: PR_TONE[route.pathToPermanentResidence],
    },
    {
      label: "Family",
      value: route.familyInclusion ? "Family can join" : "Family not included",
      tone: route.familyInclusion ? "pos" : "neutral",
    },
    {
      label: "Renewable",
      value: route.renewable ? "Renewable" : "Not renewable",
      tone: route.renewable ? "pos" : "neutral",
    },
  ];
}

/** How the comparison list can be ordered. `category` is the honest default. */
export type RouteSort = "category" | "cheapest" | "fastest" | "pr";

export const ROUTE_SORTS: { id: RouteSort; label: string }[] = [
  { id: "category", label: "By category" },
  { id: "cheapest", label: "Cheapest" },
  { id: "fastest", label: "Fastest" },
  { id: "pr", label: "Path to PR" },
];

const PR_RANK: Record<PathToPermanentResidence, number> = { direct: 0, eventual: 1, none: 2 };

/** Missing figures sort last, never as a zero — we don't fake an unknown value. */
function nullsLast(value: number | null): number {
  return value ?? Number.POSITIVE_INFINITY;
}

/**
 * A stably-sorted copy of the routes for the chosen order. Ties (and unknown
 * cost/timeline) fall back to the category order so the list never reshuffles
 * arbitrarily between renders.
 */
export function sortRoutes(routes: RouteSummary[], sort: RouteSort): RouteSummary[] {
  const byCategory = (a: RouteSummary, b: RouteSummary) =>
    ROUTE_TYPE_ORDER.indexOf(a.type) - ROUTE_TYPE_ORDER.indexOf(b.type) ||
    a.title.localeCompare(b.title);

  const key: Record<RouteSort, (a: RouteSummary, b: RouteSummary) => number> = {
    category: byCategory,
    cheapest: (a, b) => nullsLast(a.cost?.min ?? null) - nullsLast(b.cost?.min ?? null),
    fastest: (a, b) =>
      nullsLast(a.timeline?.minMonths ?? null) - nullsLast(b.timeline?.minMonths ?? null),
    pr: (a, b) => PR_RANK[a.pathToPermanentResidence] - PR_RANK[b.pathToPermanentResidence],
  };

  return [...routes].sort((a, b) => key[sort](a, b) || byCategory(a, b));
}
