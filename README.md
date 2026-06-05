# Pathport

Pathport is an immigration options explorer for people trying to understand where they can realistically move, stay, work, study, or build a life.

The core idea is simple: choose your citizenship and personal context, then see migration paths presented in a clean, comparable, human-readable way. Instead of burying answers inside long articles or scattered forum threads, Pathport should make options easier to scan, compare, and investigate further.

Positioning:

> Immigration options, structured and source-aware.

## Project Goal

Pathport is primarily a portfolio project. The main goal is to build a polished, usable, well-structured application that demonstrates product thinking, UI craft, clean architecture, and strong TypeScript/JavaScript engineering. If it grows into a genuinely useful public product, that is a welcome outcome.

## Why This Exists

Immigration research is emotionally heavy and practically messy. People often need to compare visa routes, residence permits, costs, cultural friction, bureaucracy, timelines, family considerations, safety, language expectations, and quality of life all at once.

Many existing resources are either country-specific, article-heavy, out of date, hard to compare, or aimed at a narrow audience. Pathport is inspired by simple relocation databases that make options feel legible, but the ambition is broader: a tool for a wider international audience, starting with a careful and honest MVP.

## Product Direction

Pathport should feel:

- simple, clean, and fast
- practical rather than glossy
- transparent about uncertainty
- useful even before it is exhaustive
- respectful of how stressful immigration decisions can be

The first version should prioritize a small number of well-structured countries and visa routes over a large but unreliable database.

## Early Scope

Initial product questions:

- What citizenship or passport does the user hold?
- What countries are realistic options for them?
- Which visa, permit, or residence paths exist?
- What are the rough requirements, timelines, fees, and tradeoffs?
- What should the user verify from official sources?

Possible comparison data:

- visa and residence routes
- work, study, freelancer, digital nomad, family, asylum, humanitarian, and long-stay options
- income or employment requirements
- processing time and government fees
- path to permanent residence or citizenship
- cost of living signals
- language and cultural caveats
- bureaucracy difficulty
- links to official sources

## Content Stance

Pathport may use AI-assisted research and drafting, but it should not pretend to be an official authority. Immigration rules change often, and mistakes can have serious consequences.

The product should:

- cite official sources wherever possible
- show last-reviewed dates
- distinguish confirmed facts from estimates or community notes
- avoid giving legal advice
- encourage users to verify critical details before acting

## Documentation

Project knowledge lives in [docs/](docs/README.md). The docs are meant to capture product thinking, research, content rules, and future technical decisions so the project can be resumed without relying on chat history.

You may also create a local `docs/user-context.md` file for private maintainer notes, personal motivation, working preferences, or other context that helps AI assistants collaborate with you. This file is intentionally gitignored and optional, so forks and public clones do not need it.

See:

- [docs/README.md](docs/README.md)
- [docs/project-brief.md](docs/project-brief.md)
- [docs/architecture.md](docs/architecture.md)
- [docs/content-principles.md](docs/content-principles.md)
- [docs/competitive-landscape.md](docs/competitive-landscape.md)
- [AGENTS.md](AGENTS.md)

## Local Development

Dev and production are two deliberately separate setups. **Dev** runs Postgres in
Docker while the API and web servers run on the host with hot reload. **Production**
runs the whole stack (database, API, and web) as built images via Docker Compose.

### Dev

Create a local environment file before starting the app:

```sh
cp .env.example .env
```

Start the local Postgres database and apply migrations:

```sh
pnpm db:up
pnpm db:migrate
```

Then start the app:

```sh
pnpm dev
```

The root `pnpm dev`, `pnpm dev:api`, and `pnpm dev:web` scripts build shared
packages before starting the app dev servers. Use `pnpm db:down` to stop the
local database.

### Production stack

Run the entire production stack — database, the built NestJS API, and the
Next.js server — with one command:

```sh
pnpm start:stack   # builds images, seeds the DB, waits until healthy
pnpm stop:stack    # tears it down
```

`start:stack` layers [docker-compose.prod.yml](docker-compose.prod.yml) over the
base [docker-compose.yml](docker-compose.yml). Startup order is enforced by
container health/completion checks: the database becomes healthy, a one-shot
service seeds it, then the API starts, then web. The app is served on
http://localhost:3000 (API on http://localhost:4000). This is the stack
Lighthouse audits — never the dev server.

> The bundled seed resets the schema and loads demo data, so this stack is a
> production-*like* local stack for demos, manual testing, and perf work. A real
> cloud deployment would run `db:migrate` against managed Postgres instead.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Build shared packages, then run API + web dev servers (also `dev:api`, `dev:web`) |
| `pnpm build` | Build every workspace project (`build:packages` builds just the shared packages) |
| `pnpm typecheck` | Type-check every workspace project |
| `pnpm check` / `pnpm format` | Biome lint / format |
| `pnpm test` | Unit/component tests across the workspace (fast, no Docker) |
| `pnpm test:integration` | Postgres-backed integration tests (Testcontainers, needs Docker) |
| `pnpm test:coverage` | Unit + integration with coverage (needs Docker) |
| `pnpm test:e2e` | Playwright end-to-end tests |
| `pnpm test:all` | `test` + `test:integration` + `test:e2e` in one command |
| `pnpm db:up` / `db:down` / `db:logs` | Manage the local dev Postgres container |
| `pnpm db:migrate` / `db:push` / `db:seed` | Drizzle migrations / schema push / demo seed |
| `pnpm start:stack` / `stop:stack` | Bring the production Docker stack up / down |
| `pnpm lighthouse` | Bring the stack up, run Lighthouse, tear it down |
| `pnpm lhci` | Run Lighthouse against an already-running stack |
