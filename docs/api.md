# API

Status: Phase 1

The API is a NestJS service that exposes read-only endpoints for the
citizenship-first explorer. It is the only thing the web app talks to; the web
app never reaches the database directly.

## Shape

- Responses are typed by the shared [`@pathport/contracts`](../packages/contracts)
  package, which the web app also imports. Contracts are declared independently
  of the database layer so the frontend never pulls in drizzle/pg. The API
  services map database rows into the contract types, so the mappers' return
  types reject enum drift at compile time.
- All read queries run through the shared `DatabaseService` (one pool) using
  Drizzle.
- Country codes in paths are matched case-insensitively (`USA`, `usa`).
- Phase 1 is read-only: there is no write, auth, or mutation surface.

## Endpoints

### `GET /citizenships`

Every citizenship the explorer can start from, alphabetical by name.

Returns `Citizenship[]` — `{ code, name }`.

### `GET /citizenships/:citizenshipCode/destinations`

Destinations reachable by the citizenship: any destination with at least one
applicable route, with its applicable-route count and the arrival context for
that citizenship × destination pair. Ordered by destination name.

Returns `DestinationSummary[]` — `{ code, name, routeCount, arrivalContext }`,
where `arrivalContext` is the visa-free / visitor entry facts for the pair (or
`null`). 404 if the citizenship is unknown.

### `GET /citizenships/:citizenshipCode/destinations/:destinationCode/routes`

Route summary cards for one destination that apply to the citizenship. The
`route ↔ citizenship` applicability join is what makes two citizenships see
different routes (e.g. the humanitarian Temporary Protection route is
Ukraine-only). Ordered by route type, then title.

Returns `RouteSummary[]` — the "comparable at a glance" fields (cost/timeline
ranges, work permission, family inclusion, path-to-PR, renewable) plus the
content metadata (`reviewStatus`, `confidence`, `isDemo`). 404 if the
citizenship or destination is unknown.

### `GET /routes/:id`

Full detail for a single route, addressable on its own. `id` must be a UUID
(malformed ids return 400).

Returns `RouteDetail` — every summary field plus the route's destination, the
flexible detail content (requirement groups, document list, eligibility notes,
step notes, caveats; normalized to present arrays), and its sources. 404 if no
route has that id.

## Health

- `GET /health` — liveness; does not touch the database.
- `GET /ready` — readiness; verifies the database connection.

## Metadata And Display Labels

Responses carry the raw metadata signals (`reviewStatus`, `confidence`,
`isDemo`, and per-source `type`). The user-facing quality labels (`Official
source`, `Needs review`, `Estimate`, `Demo`, …) are **derived in the UI** from
these signals, never stored or returned pre-computed. See
[domain-model.md](domain-model.md) and [content-principles.md](content-principles.md).

## Testing

Endpoints are covered by integration tests that boot the whole Nest application
against a real, seeded Postgres (Testcontainers) — no database mocking. The
tests assert the citizenship filter differentiates results, that metadata is
surfaced, and that the not-found / bad-request paths behave. See
[testing.md](testing.md).
