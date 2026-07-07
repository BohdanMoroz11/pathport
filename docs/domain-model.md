# Domain Model

This document defines the main domain concepts of the product. Some concepts might not yet be implemented or might change.

## Core Flow: Citizenship-First, Destination Drill-Down

The product is organized around the question "I hold citizenship X — where can I go and how?"

The main flow has three steps:

1. **Pick a citizenship.** The entry choice. Default should be infered from IP, geolocation, user agent, etc.
2. **See a destination overview.** A list of destinations available to that citizenship, each with a short summary and a route count. Cross-destination comparison also included.
3. **Drill into one destination.** See that destination's routes as cards grouped or filtered by route type, then open a route for full detail.

Arrival context (visa-free / visitor entry) is shown as supporting information on the destination, not as a route.

## Destination Shell: The Section Surface (Phase 2 / S3)

The rebuilt explorer is not a single route-comparison page but a **destination
shell**: a persistent left rail over an Overview plus deep reference sections —
**Country**, **Living**, **Work & income**, **Family & pets**, **Entry**, and the
**Routes** comparison. This is a genuinely new, destination-level data surface. It
was built FE-first against in-repo fixtures (`apps/web/src/lib/destination/*`), and
the shape those fixtures settled into is now folded down into the real schema.

The content splits cleanly along one seam, and the schema follows it:

- **Destination-level facts** — the same for every visitor: identity (flag,
  tagline, region, description), the `quickFacts` strip, and the deep **country /
  living / work / family** section profiles. These live on
  **`destination_countries`** (fleshing out the Phase 1 `code + name` stub).
- **Pairing-level, reader-specific facts** — read from the visitor's citizenship:
  the **language** read (how hard the main language is *for you*), the **entry**
  brief + full **entryDetail** journey, the **glance** metric list, and the
  **fitsYouIf** signals. These live on **`arrival_context`**, whose role broadens
  from "visa-free entry facts" to **the citizenship × destination pairing record**.

### How it is stored (validated JSONB, same pattern as route detail)

The section profiles are deep, nested, and still volatile, so — exactly as with
route detail — they are **validated JSONB**, not block tables. A single Zod schema
per blob (in `packages/db`) is the source of truth: the seed validates on write and
the API validates on read, so the compile-time `$type<>()` cast is actually
enforced. Only the small, stable, queryable identity fields are normalized columns.

- `destination_countries`: adds `flag`, `tagline`, `region`, `description` columns
  + a `profile` JSONB `{ quickFacts, country, living, work, family }` (each
  sub-section optional so an unfilled section degrades to its scaffold) +
  `contentMetadata`.
- `arrival_context`: adds a `profile` JSONB `{ language, entry, entryDetail,
  glance, fitsYouIf }` (all optional; a missing pairing row falls back to a
  synthesized "being gathered" stub, mirroring the old fixture `synthesizePair`).

The shared **contract types** (`@pathport/contracts`) mirror the section shapes so
the API and the web app agree without the frontend importing the DB layer, and the
API exposes the assembled profile at
`GET /citizenships/:c/destinations/:d/profile`. The web app reads it through
`api.ts` like every other surface; the local fixture module is retired.

### Open questions / deferred

- The section JSONB is deliberately coarse for now. As real (non-demo) data lands
  in Phase 3, repeating sub-shapes (e.g. `CountryStat`, `ShareDatum`, price rows)
  are candidates to **normalize into block tables** — the same "normalize later
  once the shape stops moving" bet documented for route detail below.
- `arrival_context.summary` / `visaFreeDays` (Phase 1) now overlap conceptually
  with the pairing `profile.entry` brief. They are kept as-is: S5 still reads
  `summary`/`visaFreeDays` for the destination-index card (the arrival read), so
  both remain live and reconciling them leans Phase 3, once real data shows which
  is canonical.

## Index Surfaces: Scannable Summaries (Phase 2 / S5)

Rebuilding the browse half of the explorer (home → citizenship → destination
list) surfaced what the **index cards** need to be comparable at a glance, and the
schema followed — this time with **no new columns**, only wider reads:

- **`Citizenship`** summary gains **`flag`**. It already existed on the
  `citizenships` table (used by the shell's identity), the list read just dropped
  it.
- **`DestinationSummary`** gains **`flag`**, **`region`**, and **`tagline`** — the
  identity fields the destination list groups (by region) and scans by. All three
  already existed on `destination_countries` (added in S3); again only the summary
  read was widened, so `GET /citizenships/:c/destinations` now returns them.

Both are surfaced through the existing services/mappers; the demo seed was
enriched so Portugal and Spain carry `flag`/`region`/`tagline` (only Germany did
before), keeping the index scannable rather than half-empty. All identity fields
are nullable in the contract — a destination without an authored region falls into
an "Other" group rather than breaking the layout.

## Route Taxonomy

Route type is the `route_type` enum, already in the schema:

`work`, `study`, `family`, `freelance`, `digital_nomad`, `business`, `humanitarian`, `long_stay`, `other`.

The taxonomy is intentionally open: new categories can be added to the enum as real immigration paths are explored. Phase 1 lightly exercises each major type in demo data.

## Entities And Relationships

```
citizenship ──┐
              ├──< route_applicability >── route ──> destination
destination ──┘                              │
              ──< arrival_context >──         ├──< route_sources
                                              └── (JSONB detail fields)
```

- **citizenship** — a passport/nationality. Code + name (+ flag).
- **destination** — a country a person can migrate to. Code + name (+ flag,
  region, tagline, description, and the section `profile`; see the destination
  shell and index sections above).
- **route** — one immigration path *into a single destination* (e.g. Germany Skilled Worker Visa). Carries type, summary fields, detail fields, and metadata.
- **route_applicability** — the `route ↔ citizenship` join. A route is shown for a citizenship when a row links them. This is the join the citizenship-first UI filters on. Demo data makes US and Ukraine differ on at least some routes so the filter is exercised, not trivial.
- **arrival_context** — keyed on `citizenship × destination`. Holds visa-free / visitor entry facts about the *pair* (e.g. "US citizens: 90 days visa-free in the Schengen area"). Not a route.
- **route_sources** — source links per route (type, label, url, last reviewed).

## Route Summary Fields (the card)

These are the "comparable at a glance" fields. They are normalized columns on `route`. Types below are the intended shape; exact column types are finalized in the schema as seed records are written.

- **title** — human name of the route.
- **type** — `route_type`.
- **estCost** — a range: `{ min, max, currency }`.
- **estTimeline** — a range in months: `{ minMonths, maxMonths }`.
- **workPermission** — enum: `none | limited | full`.
- **familyInclusion** — whether dependents can be included: boolean + optional note.
- **pathToPermanentResidence** — signal: enum `none | eventual | direct` (+ optional note).
- **renewable** — boolean + optional note.
- a derived **quality label** (see Metadata) and a **demo** marker.

## Route Detail Fields (the page)

The detail view shows all summary fields plus the flexible, still-volatile content. These start as **validated JSONB** rather than block tables (hybrid approach — normalize later once real routes show which fields repeat):

- **requirementGroups** — grouped requirements (e.g. financial, documents, eligibility).
- **documentList** — documents typically needed.
- **eligibilityNotes** — who may qualify, in plain language.
- **stepNotes** — high-level process steps.
- **caveats** — uncertainty, common pitfalls, things to verify.

Plus the route's **sources**.

## Source, Review, Confidence, And Demo Metadata

Three independent signals, kept minimal; the user-facing quality label is **derived** from them rather than stored, so it cannot drift.

- **review_status** (`route`, existing enum): `draft | needs_review | reviewed | outdated` — where this record is in the content lifecycle.
- **confidence** (`route`, new enum): `low | medium | high` — how much we trust the values, independent of review state.
- **is_demo** (`route`, new boolean): true for all Phase 1 seed data; surfaces as a clear demo marker.
- **sources** (`route_sources`, existing): each has a `source_type` (`official | legal | community | ai_assisted | other`), label, url, and optional `last_reviewed_at`.

### Derived Display Labels

The labels from [content-principles.md](content-principles.md) (`Official source`, `Needs review`, `Estimate`, `Community note`, `Outdated`, `AI-assisted draft`) are computed in the UI from the signals above — never stored. Intended derivation:

- `review_status = outdated` → **Outdated**
- `review_status ∈ {draft, needs_review}` → **Needs review**
- `review_status = reviewed` + a source of type `official` → **Official source**
- `confidence = low` → **Estimate**
- a source of type `community` → **Community note**
- a source of type `ai_assisted` → **AI-assisted draft**
- `is_demo = true` → **Demo**

Labels can stack (e.g. a demo route can show **Demo** + **Estimate**).
