import type {
  Citizenship,
  DestinationSummary,
  RouteDetail,
  RouteSummary,
} from "@pathport/contracts";

/**
 * The web app talks to the NestJS API over HTTP and never reaches the database
 * directly (see docs/architecture.md). Responses are typed by the shared
 * `@pathport/contracts` package, so the explorer and the API agree on shapes
 * without the frontend importing the database layer.
 */
function apiBaseUrl(): string {
  // These calls run server-side (RSC), so prefer a runtime, server-only var:
  // `NEXT_PUBLIC_*` is inlined at build time and can't be set per-deployment,
  // which is wrong for the container talking to the API over the compose
  // network. `API_BASE_URL` is read at runtime; the public var stays as the
  // dev fallback (see .env.example).
  return (
    process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"
  );
}

/** A non-2xx response from the API, carrying the status so callers can branch. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchJson<T>(path: string): Promise<T> {
  // Phase 1 reads live demo data straight from the database; no caching yet
  // (static generation is deferred to the real-data phase, see the phase plan).
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    cache: "no-store",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `GET ${path} failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

/** Resolve to `null` when the API answers with one of the given statuses. */
async function nullOnStatus<T>(promise: Promise<T>, statuses: number[]): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof ApiError && statuses.includes(error.status)) {
      return null;
    }
    throw error;
  }
}

const code = (value: string) => encodeURIComponent(value);

/** Every citizenship the explorer can start from. */
export function getCitizenships(): Promise<Citizenship[]> {
  return fetchJson<Citizenship[]>("/citizenships");
}

/** Destinations reachable by a citizenship, or `null` if the citizenship is unknown. */
export function getDestinations(citizenship: string): Promise<DestinationSummary[] | null> {
  return nullOnStatus(
    fetchJson<DestinationSummary[]>(`/citizenships/${code(citizenship)}/destinations`),
    [404],
  );
}

/** Route cards for a citizenship × destination, or `null` if either is unknown. */
export function getRoutes(
  citizenship: string,
  destination: string,
): Promise<RouteSummary[] | null> {
  return nullOnStatus(
    fetchJson<RouteSummary[]>(
      `/citizenships/${code(citizenship)}/destinations/${code(destination)}/routes`,
    ),
    [404],
  );
}

/**
 * Full detail for one route, or `null` when the id is unknown (404) or malformed
 * (400) — both render as "not found" in the explorer.
 */
export function getRouteDetail(id: string): Promise<RouteDetail | null> {
  return nullOnStatus(fetchJson<RouteDetail>(`/routes/${code(id)}`), [400, 404]);
}
