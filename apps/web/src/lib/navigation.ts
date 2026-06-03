/** `/explore/{citizenship}/{destination}` with ISO-style 2–3 letter codes. */
const EXPLORE_DESTINATION_PATH = /^\/explore\/[A-Za-z]{2,3}\/([A-Za-z]{2,3})$/;

/**
 * Validate the `from` back-link carried into the route detail page. Only an
 * internal explorer destination path is allowed (never an arbitrary or
 * protocol-relative URL), and its destination segment must match the route the
 * user is actually viewing — otherwise the "Back to {destination} routes" label
 * could point somewhere the link text doesn't describe. Returns `null` when the
 * value can't be trusted, so the caller falls back to a safe default.
 */
export function safeBackHref(
  from: string | string[] | undefined,
  destinationCode: string,
): string | null {
  if (typeof from !== "string") {
    return null;
  }
  const destinationSegment = EXPLORE_DESTINATION_PATH.exec(from)?.[1];
  if (!destinationSegment) {
    return null;
  }
  return destinationSegment.toLowerCase() === destinationCode.toLowerCase() ? from : null;
}
