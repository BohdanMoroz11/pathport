import type { ContentMetadata } from "./metadata.js";
import type { RouteType } from "./route.js";

/**
 * Visa-free / visitor entry facts for the selected citizenship × destination
 * pair. Supporting context shown on the destination, not a migration route.
 */
export type ArrivalContext = ContentMetadata & {
  visaFreeDays: number | null;
  summary: string;
};

/**
 * A destination available to the selected citizenship: enough to render a
 * scannable destination index card (identity + region grouping, how many routes
 * apply, arrival context) and to jump straight into the shell.
 */
export type DestinationSummary = {
  code: string;
  name: string;
  /** Flag emoji placeholder until a real flag asset/icon set lands. */
  flag: string | null;
  /** Broad region used to group the destination index (e.g. "Western Europe"). */
  region: string | null;
  /** Short standing line, mirrored from the destination identity. */
  tagline: string | null;
  routeCount: number;
  /**
   * Distinct route types available to this citizenship (e.g. `["work","study"]`).
   * Powers the explore route-type filter and the card's type chips.
   */
  routeTypes: RouteType[];
  /**
   * Cheapest applicable route's lower bound, for comparison ("from €X"). Null when
   * no applicable route has cost figures. Currency is that route's currency (demo
   * data uses one currency per destination).
   */
  startingCost: { amount: number; currency: string } | null;
  /** Fastest applicable route's lower bound in months, for comparison. Null when unknown. */
  fastestMonths: number | null;
  arrivalContext: ArrivalContext | null;
};
