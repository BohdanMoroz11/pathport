# API

The API is a NestJS service for the citizenship-first explorer. It is the only
thing the web app talks to; the web app never reaches the database directly.

Most implemented endpoints are currently public reads. S6 introduces local/dev
write and ingestion-control endpoints, but full cookie/session authentication is
intentionally deferred to S8 because Phase 2 is not deployed.

## Shape

- Responses are typed by the shared [`@pathport/contracts`](../packages/contracts)
  package, which the web app also imports. Contracts are declared independently
  of the database layer so the frontend never pulls in drizzle/pg. The API
  services map database rows into the contract types, so the mappers' return
  types reject enum drift at compile time.
- All read queries run through the shared `DatabaseService` (one pool) using
  Drizzle.
- Country codes in paths are matched case-insensitively (`USA`, `usa`).
- S6 should preserve the public read contracts while changing their backing store:
  destination profiles and summaries are assembled from scoped destination content
  blocks, destination-owned routes, applicability facts, and citations.
- S6 write endpoints are local/dev tooling behind clear module boundaries. They
  should validate inputs and call the single canonical writer, but proper admin
  cookie auth is S8.

## Endpoints

### `GET /citizenships`

Every citizenship the explorer can start from, alphabetical by name.

Returns `Citizenship[]` — `{ code, name }`.

### `GET /citizenships/:citizenshipCode/destinations`

Destinations reachable by the citizenship: any destination with at least one
applicable route, with its applicable-route count and the arrival context for
that citizenship × destination pair. Ordered by destination name.

Returns `DestinationSummary[]` — identity, route-count/comparison aggregates,
and the entry/arrival summary for the selected citizenship × destination pair.
The public contract still names this nested object `arrivalContext`, while the
API assembles it from scoped destination-page content rather than an
`arrival_context` table. 404 if the citizenship is unknown.

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


## S6 Write/Ingestion Surface

S6 adds the deterministic write path that S8 admin and S7 ingestion will use.
Tasks 1–3 landed the local/dev canonical mutation surface under `/local-write`.
These endpoints are intentionally not product/admin URLs yet; S8 should put
proper cookie/session auth in front of the same use-cases before deployment.

Current local/dev endpoints:

- `POST /local-write/content-blocks` — upsert one scoped destination content
  block by `targetPath`;
- `POST /local-write/routes` — create a destination-owned route with validated
  route-detail JSON;
- `POST /local-write/route-applicability` — upsert a route × citizenship
  applicability fact;
- `POST /local-write/source-documents` — upsert a reusable source document by
  URL;
- `POST /local-write/citations` — attach a source document to a content block,
  route, or applicability fact.

The S6 deterministic ingestion surface is also local/dev-only:

- `POST /local-ingestion/fake-runs` queues the deterministic `DE.living.rent`
  fixture through BullMQ;
- `POST /local-ingestion/research-runs` starts the bounded S7 discovery cascade
  for `DE.living.rent`; the discovery agent may spawn exactly one durable
  extraction run, which stops at the pending review gate;
- `POST /local-ingestion/claims/:id/review` records an approved, rejected, held,
  or edited human decision;
- `POST /local-ingestion/proposals/:id/publish` assembles cleared claims, blocks
  missing required fields, writes through the shared canonical writer, and maps
  evidence to canonical sources/citations.

The fixture is not a second implementation of S7 research: it is a deterministic
producer behind the same queue, run ledger, proposal, and publish seams.

`DE.living.rent` is a granular **research** target, not a separate canonical
content block. Publishing reviewed rent claims replaces `rent` inside the
canonical `DE.living` block, validates the complete living contract, and
preserves all sibling living fields.

The API should not expose `arrival_context` as a product concept after the S6
storage rework. Reader-specific entry/language/fit content is destination-page
content scoped to a citizenship/profile.

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
