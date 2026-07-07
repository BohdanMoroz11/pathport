# Design System

The settled frontend design system for Pathport, as of Phase 2 / S5 — the tokens
and components the whole explorer is now built from. This is the concrete
follow-up to [design-direction.md](design-direction.md): the direction doc is the
*why* (mood, layout thesis, references); this is the *what* (the tokens in code,
the component layer, and the conventions for using them).

Everything here is real and in use — the destination shell (S3/S4) and the rebuilt
browse index (S5) both compose from it. Tokens live in
[apps/web/src/app/globals.css](../apps/web/src/app/globals.css); primitives live in
`apps/web/src/components/ui/`.

## Principles in one line

Radix (unstyled) for behaviour and accessibility; **our tokens own every visual**.
The data-visualisation *is* the identity — calm neutral base, confident type,
signals encoded as shape + colour, never colour alone.

## Tokens

All tokens are CSS custom properties on `:root`, consumed in JSX as Tailwind
arbitrary values (`bg-(--surface)`, `text-(--text-2)`, `rounded-[var(--radius-lg)]`,
`shadow-[var(--shadow)]`). Never hard-code a hex, a px radius, or a font stack in a
component — reach for a token so themes and future tuning stay centralized.

### Colour

Layered neutrals plus functional accents. See globals.css for the exact values in
both themes.

- **Surfaces:** `--bg` (darkest canvas) → `--surface` (cards) → `--surface-2`
  (insets/wells). Borders: `--border`, `--border-strong`.
- **Text tiers:** `--text` (primary), `--text-2` (secondary), `--text-3` (faint).
  **`--text-3` is for large text only** — at body/label sizes it fails WCAG AA on
  `--surface`/`--bg` in dark mode, so small secondary text uses `--text-2`. (S5's
  axe pass caught several `--text-3` regressions; this is the rule that prevents
  them.)
- **Accents:** `--brand` (primary/interactive, cost bars), `--violet` (secondary,
  active nav, timeline bars, the rail's focus ring), and functional
  `--pos` / `--warn` / `--danger` / `--neutral`. Each has a low-opacity `*-soft`
  fill for badges and tinted callouts.
- **Rail:** a self-contained `--rail-*` set that stays dark in both themes.

### Typography

- `--font-display` (Space Grotesk): headings (`h1`–`h3` wired in globals.css),
  the brand mark, and **numeric values** (costs, timelines, stats). Applied with
  `font-display`.
- `--font-sans` (Onest): body/UI, the default.
- Sizes: the `--fs-*` scale (globals.css). Display headings carry
  `--tracking-display`.

### Radius, elevation, motion

- Radius: `--radius-sm` (controls) · `--radius-md` (inputs, buttons) · `--radius-lg`
  (cards) · `--radius-pill` (badges, bars).
- Elevation: `--shadow-sm` / `--shadow` / `--shadow-lg`. Hover lifts an interactive
  card with a `--brand` border + shadow.
- Motion: `--dur-fast` / `--dur` with `--ease`; minimal and calm.

## Theming

Dark is the default (`color-scheme: dark`, no attribute). Light is opt-in via
`:root[data-theme="light"]`. The [ThemeToggle](../apps/web/src/components/theme-toggle.tsx)
stamps `data-theme` on `<html>` and persists it; a tiny no-flash bootstrap in the
root layout applies the stored value before paint. The toggle has two variants:
`rail` (on the dark rail) and `bar` (on the light index chrome). The **rail stays
dark in both themes** by design.

## Primitives (`components/ui/`)

Small, token-driven building blocks. Each has an RTL + axe unit test.

- **`cn` / `focusRing`** — `cn` is a minimal class combiner (not a Tailwind-aware
  merge). `focusRing("brand" | "violet")` is the one shared keyboard focus ring;
  use it on every interactive surface so focus reads identically everywhere.
- **`Card`** — the bordered `--surface` panel everything is built from. `radius`,
  `padding`, and `interactive` (hover-lift + focus ring). Pair `asChild` with
  `interactive` so a link/button *is* the card — a single accessible tab stop.
- **`Badge`** — the pill for every small status/label chip. `outline` (neutral or
  tone-edged) vs `soft` (low-opacity tone fill), three sizes, optional tone `dot`.
  Tone is never the only cue — there is always text.
- **`Button`** — `primary` / `secondary` / `ghost` × `md` / `sm` / `icon`, with
  `asChild` for link-buttons.
- **`Dialog`** — token-styled Radix Dialog; the reference wrapping pattern.
- **`Combobox`** — a searchable quick-jump built to the WAI-ARIA combobox pattern
  (Radix ships no combobox, so the ARIA is hand-rolled): focus stays on the input,
  the active option is tracked via `aria-activedescendant`, the top match is
  pre-highlighted so Enter picks it, and selecting navigates. `surface` and `rail`
  variants. It is always a **progressive enhancement over a real card grid** — the
  grid is the no-JS accessible path.
- **`tone.ts`** — the `TONE_BG` / `TONE_TEXT` / `TONE_BORDER` / `TONE_SOFT_BG` maps
  from `AccentTone`, so a tone reads the same everywhere.

## Composed patterns

Built from the primitives, not general enough to be primitives themselves:

- **`BrowseShell`** — the light index chrome (brand mark + theme toggle + footer
  disclaimer + centered canvas) for the surfaces with no selected destination:
  home, the citizenship list, and 404.
- **`DestinationRail` + the destination layout** — the persistent dark left rail
  (brand, destination search, "viewing as", the destination identity card + a
  Compare action, and the section nav as a **view switcher** of real routes) over
  a centered content canvas. This is the app shell for a selected destination.
- **Index cards** (`components/index/`) — `CitizenshipCard` and `DestinationCard`:
  scannable, comparable-at-a-glance link-cards (flag, identity, route-count chip,
  arrival read, quality badges).
- **`section-kit`** — the destination-section vocabulary: `Block`, `Panel`,
  `StatGrid`, `ProportionBars`, `Steps`, `Timeline`, `PriceList`, `TakeHome`,
  `TagRow`, `TrendBadge`, `ScoreBar`, `Prose`/`Caption`.
- **`quality-badge`** — the honesty surface (Official / Needs review / Estimate /
  Demo …), **derived** from raw signals per [domain-model.md](domain-model.md),
  never stored.
- **`economy-trend`** — the hand-built SVG chart pattern (custom SVG, not Radix),
  reading its colours from the theme tokens so it recolours live.

## Accessibility conventions

- One focus ring everywhere via `focusRing`; `--brand` on content, `--violet` on
  the rail.
- Interactive cards are a **single tab stop** (`Card asChild interactive` onto the
  link/anchor), never a card wrapping a separate link.
- Decorative glyphs (flags, arrows, emoji) are `aria-hidden`; the accessible name
  comes from real text.
- Small secondary text uses `--text-2`, not `--text-3` (contrast; see above).
- Every primitive ships an RTL + jest-axe test; the rebuilt flows are covered by
  Playwright + `@axe-core/playwright`, and the whole app holds Lighthouse ≥ 90.

## Radix usage

The unified `radix-ui` package (synced primitives), **not** Radix Themes (which
ships its own styling). Behaviour/accessibility from Radix, visuals from our
tokens. In use today: Dialog (modals/peek drawer) and `Slot` (the `asChild`
pass-through on Card/Button). The Combobox is deliberately hand-rolled because
Radix has no combobox primitive. Charts are custom SVG for control.
