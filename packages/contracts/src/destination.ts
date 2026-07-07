import type { ContentMetadata } from "./metadata.js";

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
  arrivalContext: ArrivalContext | null;
};
