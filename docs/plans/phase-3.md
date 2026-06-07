# Phase 3: Public MVP — Idea Collection

Status: Idea collection (not planned)

Branch: TBD (phase-3)

> This is a deliberately messy parking lot, not a plan. Phase 3 is where the
> first **public MVP** ships. Ideas land here as they come up during Phase 2;
> they get turned into real stages, scope, and exit criteria only when Phase 2 is
> close to done. Do not treat anything here as committed scope.

## The Phase 3 Mission (rough)

End of Phase 3 = **first public MVP is live.** The basics are done, the site is
published, and it goes into the portfolio. If it is genuinely useful to real
people, even better.

The thing that makes Pathport actually *useful* (vs just a nice demo) is being
**found** — so Phase 3 leans heavily on SEO. Realistically SEO is close to the
only organic-growth lever this kind of product has.

## Big Themes (unsorted)

### SEO (heavy focus)

- This is probably the headline theme of Phase 3.
- Likely move explorer pages to SSG/ISR (Phase 1 already anticipated the frontend
  moving to SSG once there is real data).
- Per-route / per-destination / per-citizenship landing pages with structured,
  comparable content — the data model is already built for this.
- Metadata, Open Graph, structured data (JSON-LD), sitemaps, robots, canonical
  URLs, internal linking strategy.
- Page titles / descriptions / URL structure designed for real search intent
  ("move to Germany from US", "Portugal digital nomad visa", …).
- Performance as an SEO input (Lighthouse already gated at 90+).
- Content freshness signals (last-reviewed dates) tie into the data-gathering
  layer.

### CI/CD and Deployment

- Full CI/CD to a real environment (architecture says self-hosted, through CI).
- Production deployment pipeline: build → migrate → deploy, zero/low-downtime.
- Environment/secret management, prod config.
- Observability: structured logs, request IDs (already a principle), error
  tracking, uptime/health monitoring.
- Possibly preview deployments per PR.

### AI Data-Gathering Layer (full version)

- The complete version of the Phase 2 concept: recursively fill and update the DB
  with real data.
- Scheduled cron jobs + manually triggered tasks, coordinated.
- Real source discovery, fetching, AI extraction, validation, review, publish.
- Provenance, confidence, and review status preserved throughout (non-negotiable
  per content principles).
- Probably an external queue + worker(s) (horizontal-scaling principle).
- Cost controls / rate limiting on AI calls.
- Re-crawl / refresh cadence; detecting and flagging stale or changed data.

### Admin Panel (full version)

- The complete admin beyond the Phase 2 slice.
- Full content management, review workflows, ingestion control + monitoring.
- User/role management if more than one maintainer.
- Dashboards for ingestion health, data coverage, review backlog.

### UI / Product Polish

- "Clean, modern, useful, good-looking UI" is possibly the most important part of
  the whole project — Phase 2 builds the foundation; Phase 3 polishes for launch.
- Final responsive/a11y pass, motion/interaction polish, empty/edge states.
- Possibly: comparison view, filtering, search.

### Real Data and Content

- Transition from demo/throwaway data to real, reviewed content for the launch
  set (countries/routes chosen for the MVP).
- Decide the launch coverage (which citizenships/destinations/routes go public).
- Content QA and the honesty/uncertainty presentation at real scale.

### Launch / Portfolio

- Domain, hosting, analytics (privacy-respecting?).
- Legal/disclaimer framing (not legal advice) visible and solid.
- Portfolio write-up: architecture, decisions, screenshots, case study.
- Maybe: feedback mechanism for early users.

## Loose Open Questions (to revisit, not answer now)

Carried from [future-product-scope.md](future-product-scope.md) and new:

- Should country scores exist, or rely on filters + comparable facts?
- How much cost-of-living data before city-level data is needed?
- English-only for the first public MVP?
- User-facing AI features, or AI internal-only?
- What is the first real-data expansion, and which countries/routes launch?
- What is explicitly out of scope for the first public MVP?
- Accounts / saved searches — in or out for the public MVP? (Phase 1 brief said
  the MVP needs no accounts; revisit if SEO/product pulls that way.)

## Notes

- Keep this messy on purpose until Phase 2 wraps. The point is to capture ideas
  so they are not lost, and to keep Phase 2 focused by giving everything
  out-of-scope a home.
- When Phase 2 nears completion, promote the strongest themes here into a real
  Phase 3 plan (goal, stages, exit criteria) and prune the rest.
