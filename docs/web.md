# Web Explorer

The web app (`apps/web`) is the citizenship-first explorer: a Next.js App Router
frontend that reads the [API](api.md) over HTTP and never touches the database
directly (see [architecture.md](architecture.md)).

## Flow

The explorer follows the citizenship → destination → route drill-down from the
[domain model](domain-model.md):

1. `/` — the home landing for the **active citizenship**: a full-bleed dark hero
   band pairing a gradient headline + stats (server-rendered for the active
   citizenship) with an interactive **world map** (`react-simple-maps` over a
   vendored `world-atlas` topojson) that lights up every reachable country;
   hovering or clicking a country selects it and updates a floating detail card,
   with a marker on the passport's origin. The map mounts client-side (a
   same-size placeholder holds the space during SSR to avoid a hydration
   mismatch). Below the hero is a wide destination card grid. The hero, browse
   chrome, and `/explore` all share one content width (`max-w-[90rem]`,
   `px-6 lg:px-10`) so their edges line up.
2. `/explore` — the destination browser for the active citizenship: search,
   region/route-type filters, sort, and a compare tray that opens a side-by-side
   dialog (up to three destinations). Also server-rendered for the active
   citizenship.
3. `/explore/[citizenship]/[destination]` — the destination shell (Overview,
   Routes, and other sections). The Routes section holds the route summary
   cards; opening one peeks the full detail in a drawer.
4. `/explore/[citizenship]/[destination]/routes/[id]` — the same route detail as
   a full page: comparable fields, requirement groups, documents, eligibility,
   steps, caveats, and cited sources.

### Active citizenship

The active citizenship is **cookie-persisted** (`pathport-citizenship`,
default `USA`). A global selector in the header (next to the theme toggle)
writes the cookie and either refreshes the current view or, on a deep
`/explore/[citizenship]/[destination]` page, swaps the citizenship URL segment.
The cookie is read server-side via `src/lib/citizenship.server.ts` (which owns
the `next/headers` import); the client-safe constants and the resolver that
falls back to the default live in `src/lib/citizenship.ts`, so the selector
never pulls server-only code into the client bundle.

Country codes in the URL are matched case-insensitively (the API does the
matching). Unknown citizenships/destinations and unknown or malformed route ids
resolve to a shared `not-found` page. Route cards link to the detail page with a
`from` query param so the detail view can render a back link; the back link is
restricted to internal `/explore/` paths.

Pages are server-rendered on demand (no caching yet). Static generation is
deferred to the real-data phase, per the phase plan.

## Boundaries

- **Data:** a thin typed client in `src/lib/api.ts` wraps `fetch` and returns
  the shared `@pathport/contracts` types. These fetches run server-side, so the
  base URL prefers the runtime `API_BASE_URL`, falling back to
  `NEXT_PUBLIC_API_BASE_URL` and then `http://localhost:4311` for dev. S6 should
  keep these contracts stable while changing the backing store to scoped
  destination content blocks, destination-owned routes, applicability facts, and
  general citations.
- **Quality labels:** the user-facing labels (`Official source`, `Needs review`,
  `Estimate`, `Demo`, …) are **derived** in `src/lib/quality.ts` from the raw
  signals (`reviewStatus`, `confidence`, `isDemo`, per-source `type`), never
  stored or returned pre-computed. They stack. See [domain-model.md](domain-model.md).
- **Formatting:** cost/timeline/permission/PR labels live in `src/lib/format.ts`.

## Testing

The pure helpers (`quality`, `format`, `geo`, the citizenship resolver) and the
presentational components (quality badges, route card, explore cards) are
unit-tested with Vitest + React Testing Library. The interactive map hero is a
client-only vector-map component (`react-simple-maps`), so it is exercised by
the end-to-end journey rather than unit-tested. The data-fetching server pages
and the cross-page journeys (home map hero → destination shell → route drawer,
the header citizenship switch, and the explore filter/compare flow) are covered
by end-to-end tests (Playwright, with axe accessibility assertions) rather than
brittle unit tests, in line with [architecture.md](architecture.md). See
[testing.md](testing.md).
