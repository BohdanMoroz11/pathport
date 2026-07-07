import type { Citizenship } from "@pathport/contracts";

/**
 * The active citizenship is global, persisted in a cookie, and defaults to the
 * primary demo passport. Home and `/explore` render for it server-side (no
 * hydration flash); the deep destination shell keeps the citizenship in its URL.
 * The header selector writes this cookie. See docs/web.md.
 *
 * These are the client-safe pieces (constant + a pure resolver). The cookie read
 * itself lives in `citizenship.server.ts` because it imports `next/headers`,
 * which must not be pulled into a client bundle.
 */
export const CITIZENSHIP_COOKIE = "pathport-citizenship";
export const DEFAULT_CITIZENSHIP_CODE = "USA";

/**
 * Resolve a code to a known citizenship, falling back to the default (then the
 * first available) so a stale or bogus cookie never breaks the page.
 */
export function resolveActiveCitizenship(
  citizenships: Citizenship[],
  code: string,
): Citizenship | null {
  return (
    citizenships.find((c) => c.code.toLowerCase() === code.toLowerCase()) ??
    citizenships.find((c) => c.code === DEFAULT_CITIZENSHIP_CODE) ??
    citizenships[0] ??
    null
  );
}
