# Design Direction

The visual and structural direction for Pathport's frontend, settled in Phase 2
/ S1. This is the *direction* — the mood, layout model, palette, type, and the
reasoning behind them. Exact token values and component APIs will keep moving;
the **fully settled design system is documented later in
[design-system.md](design-system.md)** (S5), once components are extracted.

The direction was developed visually against a working concept rather than in the
abstract. That concept lives alongside this doc:

- **[ui-concepts/route-comparison-v3.html](ui-concepts/route-comparison-v3.html)** —
  a self-contained, throwaway HTML mockup of a destination page (Ukraine → Germany)
  with hardcoded demo data. Open it in a browser; the sidebar switches views and
  the cost chart is interactive. Screenshots of the key views (`v3-*.png`) sit
  next to it.

> The concept is **throwaway alignment material**, not production code or a
> component source. It exists to make the direction concrete. Do not build the
> real app by copying it.

## What this needs to be

From [project-brief.md](project-brief.md) and [AGENTS.md](../AGENTS.md): Pathport
is a **public, non-commercial reference explorer** — closer to a data
explorer / catalog / almanac than to a SaaS product. It has no marketing landing
page, no sign-up, no funnel. The "page" is the content: an index, an entity, a
comparison.

Three product facts constrained the design more than taste did:

1. **Scannable comparison is the product.** Routes must read fast and be
   comparable at a glance.
2. **The audience is partly under stress** (people affected by war, instability).
   "Calm" is functional, not decorative — a cold, intimidating data tool would
   fail these users.
3. **Honesty about uncertainty is visible.** Quality labels and source links are
   first-class, not an afterthought.

## Core thesis: the data-visualisation *is* the identity

Pathport has **almost no imagery** — it presents graphs, bars, ranges, lists, and
text. So the visual life and memorability cannot come from photos or ornament; it
has to come from **how the data is drawn**: shared-scale comparison bars,
encoded signals (pips, chips, dots), and interactive charts, on a calm neutral
base with confident typography. This is the single most important principle and
everything below serves it.

## References (touchstones and anti-patterns)

The strongest positive reference is **relokatz.com** (a relocation info site) for
its *structure*: a persistent dark sidebar that acts as a **view switcher** over
information categories, against a light content canvas, with soft rounded
components and functional pops of colour.

Rejected, with reasons, so we don't drift back:

- **SaaS marketing sites** (Linear/Vercel/Mercury etc.) — wrong genre; we sell
  nothing and have no landing page.
- **Our World in Data** — right spirit (sources-first data explorer) but visually
  dated/overloaded; we want a modern version of that energy.
- **GOV.UK** — clear but lifeless; we want calm *with* character.
- **Letterboxd** — great catalog UI but image-centric; we are graph/text-centric.
- **Nomad List / Numbeo** — right domain and density, but ad-funnelled / dated.
- The generic "warm-dark + amber + serif display" look — explicitly avoided; it
  reads as default AI output.

## The direction

### Layout: an app shell, sections as separate views

- A persistent **left rail** (dark in both themes) holds: brand, country search,
  the "viewing as <citizenship>" context, the current destination identity + a
  Compare action, and a **section nav**.
- The section nav is a **view switcher**, not scroll anchors. Each section
  (Overview, Entry, Routes, Cost of living, Work & taxes, Family, Sources) is its
  **own screen**. In the real app these are **real routes** (Next.js App Router),
  not client-side show/hide. This is what lets each section go deep without
  vertical bloat.
- Content sits on a centered canvas (~900px) of stacked **modules** (stat chips,
  checklists, key/value blocks, route cards, charts, callouts, source lists).

### Signature components (the comparison language)

- **Shared-scale range bars** for cost and timeline: each route's range is drawn
  as a floating segment on a *common axis*, so routes compare visually without
  reading numbers. This is the core scannability move.
- **Encoded signals**: work permission as 3 pips (full/limited/none), path-to-PR
  and family as coloured chips/dots. Status becomes shape + colour.
- **Quality badges** (Official / Needs review / Estimate / Demo) sit on each
  route, plus a global demo marker — the honesty requirement, made visual. These
  remain **derived** from raw signals per [domain-model.md](domain-model.md),
  never stored.

### Charts are first-class

Simple, interactive, good-looking charts are a core part of the app, not a
nice-to-have. The concept includes a hand-built SVG area/line chart with a hover
crosshair + tooltip and a series toggle, reading its colours from the theme
tokens so it recolours live across themes. Future charts (salary, PR projection,
cross-destination comparison) follow this pattern. Charts are **custom SVG** for
control, not Radix.

## Tokens (current, from the concept)

Built on the existing CSS-variable approach (`--foreground`/`--muted`/… in
`apps/web`), extended. Values below are the **current** direction, expected to be
tuned; they become canonical in [design-system.md](design-system.md).

### Theme scope

**Both dark and light are first-class** (decided in S1). Dark mode uses a **cool
neutral slate** base (not green-tinted), with deliberate layering: **canvas is
darkest, the rail sits above it, cards lift above that.** The rail stays dark in
both themes (it pops against the light canvas; it separates by border + elevation
in dark).

### Colour

| Role | Light | Dark |
| --- | --- | --- |
| `--bg` | `#eef2f0` | `#090c11` |
| `--surface` | `#ffffff` | `#141923` |
| `--surface-2` | `#eef3f0` | `#1c2230` |
| `--border` | `#e2e9e5` | `#262d3a` |
| `--text` | `#0e1714` | `#e9edf4` |
| `--text-2` | `#4f5e58` | `#9aa6b8` |
| `--text-3` | `#84908a` | `#687184` |
| `--brand` (primary, teal/emerald) | `#0c9b78` | `#2fd4ac` |
| `--violet` (secondary) | `#5d54e6` | `#8f8cff` |
| `--pos` | `#13a058` | `#34d08a` |
| `--warn` | `#bd7708` | `#e7b14a` |
| `--danger` | `#d8472d` | `#f56b54` |
| `--neutral` | `#6c766f` | `#8a93a3` |
| rail bg / border | `#0e1512` / `#233029` | `#0e131c` / `#232b39` |

Each accent also has a low-opacity `*-soft` variant for badge/pill backgrounds.

**Semantic encoding:** brand = primary/interactive + cost bars; violet =
secondary, active nav, timeline bars, "limited"/"eventual" states; pos/warn/
danger/neutral = functional status and quality badges.

### Typography

- **Space Grotesk** — display: headings (`h1`–`h3`), brand, and **numeric values**
  (costs, timelines, stats). Geometric, characterful, pairs well with data.
- **Onest** — body/UI text. Clean and modern.
- Deliberately **not** Inter or a serif display, to avoid the default look.

### Spacing, radius, elevation, motion

- Radius: cards `13–14px`, pills/bars `999px`, small controls `6–10px`.
- Elevation: soft, low shadows; hover lifts cards `translateY(-1px)` + shadow +
  brand border.
- Motion: minimal and calm — `~.14s` transitions, a `~.18s` fade on view change.

## Radix + custom UI

Confirmed from [phase-2.md](plans/phase-2.md) Resolved Decisions: **Radix
primitives (unstyled) for behaviour/accessibility, with Pathport's own CSS/tokens
for everything visual.** Expected mapping as components are built (S4):

- Country search / citizenship picker → Radix Select / Combobox pattern.
- Sort & chart-series toggles → Radix Tabs / ToggleGroup.
- Modals/sheets → Radix Dialog.
- Badge/help tooltips → Radix Tooltip (the chart's own hover is custom SVG).
- Section navigation → real routing, not a Radix component.

## Known open items (expected to change)

- **Emoji icons** in the rail/sections are placeholders; a proper icon set
  (e.g. Lucide) is the intended upgrade.
- **Responsive behaviour** (the 5-column route metrics, the rail on mobile) is not
  solved in the concept.
- Exact **palette tuning** (brand hue, contrast) and final spacing/type scale.
- Search, sort, and "Compare destinations" are visual-only in the concept.
