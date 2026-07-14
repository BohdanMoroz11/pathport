# Domain Model

This document defines the main domain concepts of the product. Some concepts might not yet be implemented or might change.

## Core Flow: Citizenship-First, Destination Drill-Down

The product is organized around the question "I hold citizenship X — where can I go and how?"

The main flow has three steps:

1. **Pick a citizenship.** The entry choice. Default can later be inferred from IP, geolocation, user agent, or user settings.
2. **See a destination overview.** A list of destinations available to that citizenship, each with a short summary and a route count. Cross-destination comparison also included.
3. **Drill into one destination.** See that destination's routes as cards grouped or filtered by route type, then open a route for full detail.

Entry / visitor context is supporting information on the destination page, not a migration route. In the S6 target model it is stored as scoped destination-page content, not as a standalone `arrival_context` product concept.

## Destination Page Aggregate (S6 Target)

The rebuilt explorer is a **destination page**, not a collection of disconnected
records. A page is assembled for a selected citizenship and destination, with
subpages for Overview, Country, Living, Work & income, Family & pets, Entry, and
Routes. S3–S5 made that surface real; the S6 planning review showed that the
current storage model (`destination_countries.profile` + `arrival_context` +
route-only sources) is too coarse and oddly scoped to fill and cite the page well.

> Implementation note: the code may still use the older Phase-1/S3 tables until
> S6 lands. This section describes the **target domain model for S6**.

The canonical model should treat the destination page as an aggregate made of:

- stable identities (`citizenships`, `destinations`);
- destination-owned routes (queryable child records used for comparison);
- scoped content pieces for the page's sub-sections and info blocks;
- route applicability facts for a citizenship/profile;
- source documents and field/block-level citations.

The key distinction is not just "destination-level vs citizenship-specific." The
actual unit is a **content piece** with a scope.

### Content scopes

A content piece is a subsection/block/fact group that can be researched,
reviewed, cited, and refreshed independently. It carries a scope:

- **`destination`** — universal facts about the destination regardless of reader:
  geography, climate, political system, many economy/safety/rights facts, rent
  market rows, public healthcare/schooling structure, pet import basics.
- **`citizenship_destination`** — facts that depend on the selected citizenship or
  origin context: visa-free entry, border documents, language difficulty for the
  reader, "fits you if" signals, and some overview reads.
- **`route`** — facts about a route owned by the destination: title, category,
  comparison fields, core requirements, steps, risks, documents, caveats.
- **`route_citizenship`** — whether/how a route applies for a given citizenship or
  origin/status, including exemptions and special-case caveats.
- **`assumption`** — facts that are not truly universal but are still useful in
  the UI under an explicit persona/assumption: monthly budget personas, sample
  take-home pay, employee vs freelancer access modes, healthcare access mode,
  pet-origin/rabies-risk assumptions, household shape, city assumptions.

This avoids false universality. For example, the Living page contains universal
rent/price facts, but its budget personas are assumption-scoped; Work has universal
job-market facts, but right-to-work depends on route/status; Family has universal
family-reunification structure, but who can join and which exemptions apply can be
route-/status-specific.

### Current page pieces by section

**Overview** is assembled, not a single stored blob:

- destination identity, description, and quick facts: mostly `destination` scope;
- entry brief: `citizenship_destination`;
- at-a-glance metrics: mixed/derived from destination blocks, routes available to
  this citizenship, and assumption-scoped examples;
- "Fits you if": `citizenship_destination`, route-derived, and later
  user-profile-derived.

**Country** is mostly `destination` scope: geography, climate, people, economy,
government, rights, safety, and culture. The language read is inserted from
`citizenship_destination` (or later language-profile scope), because difficulty
and practical interpretation depend on the reader.

**Living** is mixed: rent, groceries, everyday prices, healthcare system, and
schooling system are often destination-scoped; monthly budgets, household costs,
healthcare access, childcare access, and sample affordability reads need explicit
assumptions/personas.

**Work & income** is mixed: job market, industries, tax examples, earning modes,
and finding-work channels are destination/assumption scoped; right-to-work,
setup steps, credential recognition implications, and work permission are often
route-/status-scoped.

**Family & pets** is mixed: pet import basics and the broad family-reunification
framework are destination-scoped; family eligibility, spouse language exemptions,
benefits, and work rights for dependents can be route-/status-/citizenship-scoped.
Pet import can also depend on origin/rabies-risk assumptions rather than
citizenship alone.

**Entry** is mostly `citizenship_destination`: visa-free days, border documents,
pre-registration, first-days actions, and the bridge from arrival to routes.

**Routes** are destination-owned child content. Routes need normalized comparison
columns for sorting/filtering, but they are still part of the destination page.
Applicability is scoped to the selected citizenship/profile.

### Storage shape (S6 tasks 1–3)

Keep normalized columns for stable, queryable identity and comparison fields, but
store volatile page content in **smaller validated JSONB content pieces**, not one
large profile blob:

- `destination_countries` — destination identity and high-level metadata (`code`,
  `name`, `flag`, `region`, `tagline`, `description`). The S6 migration kept the
  existing table name for compatibility; it can still be renamed later if worth
  the churn.
- `destination_content_blocks` — scoped page pieces:
  `destination_country_id`, `section_key`, `block_key`, `scope`, optional
  `citizenship_id`, optional `route_id`, optional `assumptions`, `content` JSONB,
  quality metadata, ingestion backlinks, timestamps. `target_path` is unique so
  ingestion/admin can address one fillable block deterministically.
- `routes` — destination-owned route records with normalized comparison fields
  plus route detail JSONB where that remains practical.
- `route_applicability` — scoped applicability facts tying a route to a
  citizenship/profile; still needed because two citizenships can see different
  route sets.
- `source_documents` — canonical source records (URL, title, publisher/source
  type, retrieved/reviewed timestamps, content hash, snapshot/excerpt refs).
- `content_citations` — field/block-level citations from source documents to the
  content they support, using a target reference plus a `field_path` / JSON
  pointer. Citations must work for destination blocks, routes, and applicability
  facts — not only route detail.

This still uses JSONB deliberately: the UI section shapes are nested and evolving.
The improvement is that JSONB is now **scoped to fillable blocks** and can be
cited/reviewed independently.

### Ingestion target examples

The S6 fake producer and S7 agent should target content like this, not whole
pages:

- `DE.country.geography`
- `DE.country.safety`
- `DE.living.rent`
- `DE.living.budget[single:berlin:mid-range]`
- `DE.work.demand`
- `USA→DE.entry.arrival`
- `UKR→DE.entry.toPermit`
- `DE.route.blue-card`
- `USA→DE.route.blue-card.applicability`

Each target can produce proposals, claims, evidence, and citations at field/block
granularity.

## Route Taxonomy

Route type is the `route_type` enum, already in the schema:

`work`, `study`, `family`, `freelance`, `digital_nomad`, `business`, `humanitarian`, `long_stay`, `other`.

The taxonomy is intentionally open: new categories can be added to the enum as real immigration paths are explored. Phase 1 lightly exercises each major type in demo data.

## Entities And Relationships (S6 Target)

```text
citizenship ──┐
              ├──< destination_content_blocks >── destination_countries
              │              ▲                       │
              │              │                       ├──< routes
              │              │                       │      │
              │              └──── route_applicability >────┘
              │
source_documents ──< content_citations >── blocks / routes / applicability fields
```

- **citizenship** — a passport/nationality or origin context the user starts
  from. Code, name, flag, and later profile/language context.
- **destination** — the country/page being explored. Identity and high-level
  display fields live here; page content lives in scoped blocks.
- **destination_content_block** — one fillable, reviewable, citeable content piece
  of the destination page. The block says where it renders (`section_key` /
  `block_key`) and what it is scoped to (`destination`, `citizenship_destination`,
  `route`, `route_citizenship`, `assumption`).
- **destination_route** — one long-term route under a destination. It remains a
  table because comparison, filtering, sorting, and detail URLs need stable rows
  and normalized fields.
- **route_applicability** — a route's availability/interpretation for a selected
  citizenship/profile. This is scoped child content, not a disconnected concept.
- **source_document** — a canonical source page/document/snapshot used as
  evidence.
- **content_citation** — a citation linking one source document to the exact
  block/field/route fact it supports.

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

Plus the route's **citations/sources** assembled from the general source model.

## Source, Review, Confidence, And Demo Metadata

Three independent signals, kept minimal; the user-facing quality label is **derived** from them rather than stored, so it cannot drift.

- **review_status** (`route`, existing enum): `draft | needs_review | reviewed | outdated` — where this record is in the content lifecycle.
- **confidence** (`route`, new enum): `low | medium | high` — how much we trust the values, independent of review state.
- **is_demo** (`route`, new boolean): true for all Phase 1 seed data; surfaces as a clear demo marker.
- **sources/citations** (S6 target): sources are general `source_documents`, and
  `content_citations` attach them to the destination block / route / applicability
  field they support. `route_sources` is a demo-era route-only shape and should be
  replaced during S6.

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
