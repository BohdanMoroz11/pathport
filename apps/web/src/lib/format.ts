import type {
  CostRange,
  PathToPermanentResidence,
  RouteType,
  TimelineRange,
  WorkPermission,
} from "@pathport/contracts";

/** Shown wherever a structured value has not been filled in yet. */
export const NOT_SPECIFIED = "Not specified";

/** Human label for each route type, in the taxonomy order from the domain model. */
export const ROUTE_TYPE_LABELS: Record<RouteType, string> = {
  work: "Work",
  study: "Study",
  family: "Family",
  freelance: "Freelance",
  digital_nomad: "Digital nomad",
  business: "Business",
  humanitarian: "Humanitarian",
  long_stay: "Long stay",
  other: "Other",
};

/** Route types in the order the explorer groups and lists them. */
export const ROUTE_TYPE_ORDER: RouteType[] = [
  "work",
  "study",
  "family",
  "freelance",
  "digital_nomad",
  "business",
  "humanitarian",
  "long_stay",
  "other",
];

export function formatCost(cost: CostRange | null): string {
  if (!cost) {
    return NOT_SPECIFIED;
  }

  const money = (value: number) =>
    new Intl.NumberFormat("en", {
      style: "currency",
      currency: cost.currency,
      maximumFractionDigits: 0,
    }).format(value);

  return cost.min === cost.max ? money(cost.min) : `${money(cost.min)} – ${money(cost.max)}`;
}

export function formatTimeline(timeline: TimelineRange | null): string {
  if (!timeline) {
    return NOT_SPECIFIED;
  }

  if (timeline.minMonths === timeline.maxMonths) {
    return `${timeline.minMonths} ${timeline.minMonths === 1 ? "month" : "months"}`;
  }

  return `${timeline.minMonths}–${timeline.maxMonths} months`;
}

export function workPermissionLabel(permission: WorkPermission): string {
  switch (permission) {
    case "full":
      return "Full work rights";
    case "limited":
      return "Limited work rights";
    case "none":
      return "No work rights";
  }
}

export function pathToPrLabel(path: PathToPermanentResidence): string {
  switch (path) {
    case "direct":
      return "Direct to permanent residence";
    case "eventual":
      return "Path to permanent residence";
    case "none":
      return "No permanent-residence path";
  }
}

export function booleanLabel(value: boolean, note: string | null): string {
  const base = value ? "Yes" : "No";
  return note ? `${base} — ${note}` : base;
}
