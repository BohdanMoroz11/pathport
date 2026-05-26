# Future Product Scope

Status: Parking lot

This document holds product-scope questions that are important, but not part of the current foundation work.

Phase 0 focused on the project foundation: stack, repository structure, development workflow, testing, CI, and database/schema setup. Phase 1 focuses on the main product foundation: database structure, read API, citizenship-first UI, and small demo data.

Some Phase 1 scope decisions are now captured in [phase-1.md](phase-1.md): United States as the demo citizenship, Germany/Portugal/Spain as demo destinations, citizenship-first flow, all major immigration route types represented in the foundation, and realistic-ish placeholder data for local development rather than deep official-source content.

## Questions To Revisit

- Should country scores exist at all, or should the product rely on filters and comparable facts?
- How much cost-of-living data is useful before city-level data becomes necessary?
- Should the first version be English-only?
- How should uncertainty, missing data, and outdated data be displayed?
- Should AI be used only internally for drafting, or should the product include user-facing AI features later?
- What should be the first real-data expansion after the Phase 1 demo foundation?
- Should humanitarian and asylum-related routes be shown in the general explorer, separated into a careful special section, or deferred until there is a stronger review process?
- When should Pathport move from demo data to official-source reviewed data?
- What should be explicitly out of scope for the first public MVP after the foundation is working?

## Notes

- Keep foundation phases small enough to finish.
- Prefer a durable data model over premature content breadth.
- Preserve source visibility and uncertainty labels from the beginning.
