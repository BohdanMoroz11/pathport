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
