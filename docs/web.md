# Web Explorer

Status: Phase 1

The web app (`apps/web`) is the citizenship-first explorer: a Next.js App Router
frontend that reads the [API](api.md) over HTTP and never touches the database
directly (see [architecture.md](architecture.md)).

## Flow

The explorer follows the citizenship → destination → route drill-down from the
[domain model](domain-model.md):

1. `/` — pick a citizenship. United States leads as the primary demo option.
2. `/explore/[citizenship]` — destinations reachable by that citizenship, each
   with a route count and arrival context.
3. `/explore/[citizenship]/[destination]` — route summary cards grouped by route
   type, in the taxonomy order.
4. `/routes/[id]` — full route detail: comparable fields, requirement groups,
   documents, eligibility, steps, caveats, and sources.

Country codes in the URL are matched case-insensitively (the API does the
matching). Unknown citizenships/destinations and unknown or malformed route ids
resolve to a shared `not-found` page. Route cards link to the detail page with a
`from` query param so the detail view can render a back link; the back link is
restricted to internal `/explore/` paths.

Pages are server-rendered on demand (no caching yet). Static generation is
deferred to the real-data phase, per the phase plan.

## Boundaries

- **Data:** a thin typed client in `src/lib/api.ts` wraps `fetch` and returns
  the shared `@pathport/contracts` types. The API base URL comes from
  `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:4000`).
- **Quality labels:** the user-facing labels (`Official source`, `Needs review`,
  `Estimate`, `Demo`, …) are **derived** in `src/lib/quality.ts` from the raw
  signals (`reviewStatus`, `confidence`, `isDemo`, per-source `type`), never
  stored or returned pre-computed. They stack. See [domain-model.md](domain-model.md).
- **Formatting:** cost/timeline/permission/PR labels live in `src/lib/format.ts`.

## Testing

The pure helpers (`quality`, `format`) and the presentational components
(quality badges, citizenship picker, route card, hero) are unit-tested with
Vitest + React Testing Library. The data-fetching server pages are covered by
end-to-end tests (Playwright, added in S6) rather than brittle unit tests, in
line with [architecture.md](architecture.md). See [testing.md](testing.md).
