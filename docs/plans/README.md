# Plans

This directory contains living execution plans for Pathport.

Plans are organized by phase. Each phase should have its own document with stages, status, notes, and exit criteria. Stages use simple labels like `S1`, `S2`, and `S3`. A stage may have a todo list, a short description, or both, depending on how much structure is useful at that moment.

Update these files as work happens so they reflect the real project state, not an idealized old plan.

## Workflow

- Use one branch per phase.
- Use focused commits for major features, decisions, or todo groups.
- Open a larger PR when a phase is complete.
- Update the relevant phase plan when tasks are completed, changed, deferred, or removed.
- Keep final phases flexible until earlier decisions make them clearer.

## Current Phases

- [phase-0.md](phase-0.md): Initial project framing, stack decision, app scaffold, development pipeline, testing baseline, and database/schema foundation.
- [future-product-scope.md](future-product-scope.md): Parked product-scope questions for future planning phases.

## Phase Template

Future phase docs can follow this rough structure:

- goal
- branch
- status
- stages labeled `S1`, `S2`, `S3`
- exit criteria
- open questions
- notes / change log
