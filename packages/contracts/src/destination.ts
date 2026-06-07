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
 * A destination available to the selected citizenship: enough to render the
 * destination overview step (name, how many routes apply, arrival context).
 */
export type DestinationSummary = {
  code: string;
  name: string;
  routeCount: number;
  arrivalContext: ArrivalContext | null;
};
