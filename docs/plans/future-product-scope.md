# Future Product Scope

Status: Parking lot

This document holds product-scope questions that are important, but not part of the current foundation work.

Phase 0 focused on the project foundation: stack, repository structure, development workflow, testing, CI, and database/schema setup. Phase 1 focuses on the main product foundation: database structure, read API, citizenship-first UI, and small demo data.

Phase 1 scope and domain decisions are now captured in [phase-1.md](phase-1.md) and [../domain-model.md](../domain-model.md): United States and Ukraine as demo citizenships, Germany/Portugal/Spain as demo destinations, citizenship-first destination drill-down flow, all major route types represented, the source/review/confidence/demo metadata model with derived display labels, and throwaway placeholder data rather than official-source content.

## Resolved (moved out of this parking lot)

- How uncertainty / missing / outdated data is represented — resolved by the metadata model and derived labels in [../domain-model.md](../domain-model.md). How it is *visually presented* is finalized during S5 UI work.
- Whether humanitarian routes appear in the general explorer — for the foundation, yes, shown in the general explorer as demo data; a stronger review process can revisit before real content.

## Questions To Revisit

- Should country scores exist at all, or should the product rely on filters and comparable facts?
- How much cost-of-living data is useful before city-level data becomes necessary?
- Should the first version be English-only?
- Should AI be used only internally for drafting, or should the product include user-facing AI features later?
- What should be the first real-data expansion after the Phase 1 demo foundation?
- When should Pathport move from demo data to official-source reviewed data?
- What should be explicitly out of scope for the first public MVP after the foundation is working?

## Notes

- Keep foundation phases small enough to finish.
- Prefer a durable data model over premature content breadth.
- Preserve source visibility and uncertainty labels from the beginning.
