/**
 * Draft shape for the destination Overview surface.
 *
 * Phase 2 / S3 is built FE-first against in-repo fixtures: the page is where the
 * real data requirements surface, so this type evolves as the UI does. Once the
 * look is locked it gets pushed down into @pathport/contracts → the NestJS API →
 * the Drizzle schema + demo seed, and the changes recorded in
 * docs/domain-model.md. Until then it lives here, not in the shared contracts.
 */

export type CitizenshipIdentity = {
  code: string;
  name: string;
  /** Flag emoji placeholder until a real flag asset/icon set lands. */
  flag: string;
};

export type DestinationIdentity = {
  code: string;
  name: string;
  flag: string;
  /** Short region/standing line shown in the rail, e.g. "Western Europe · EU". */
  tagline: string;
  region: string;
  /** A few sentences describing the country for someone weighing a move. */
  description: string;
};

/** A scannable key/value chip in the quick-facts strip. */
export type QuickFact = { label: string; value: string };

/** Functional accent tokens a metric/marker can be encoded with. */
export type AccentTone = "pos" | "warn" | "danger" | "neutral" | "brand" | "violet";

/**
 * A good/bad indicator drawn as a filled bar (`score` of `max`), coloured by
 * `tone` — the "encoded signal" idea from docs/design-direction.md. Higher is
 * always better *for the reader* (so a cheaper rent or an easier language reads
 * as a fuller, greener bar).
 */
export type MetricRating = { score: number; max: number; tone: AccentTone };

/**
 * One row in the "At a glance" spec list. `value` is a display-ready string
 * (a number, range, or short qualitative word); `rating` is the optional
 * good/bad indicator; `note` is a brief qualifier; `section` deep-links the row
 * into the destination section that owns the detail (slug under the shell).
 */
export type GlanceMetric = {
  label: string;
  value: string;
  rating?: MetricRating;
  note?: string;
  section?: string;
  /** Tint the value with this tone (for qualitative reads like "Very good"). */
  valueTone?: AccentTone;
};

/**
 * A "this fits you if…" signal. `match` drives the marker (a clear yes, a
 * qualified maybe, or a no); `detail` says why it fits / via which route.
 * Authored per citizenship × destination.
 */
export type FitSignal = { text: string; match: "yes" | "maybe" | "no"; detail?: string };

/**
 * A short, citizenship-specific read of how you first get in — surfaced on the
 * Overview because arrival is decision-critical, and links into the Entry view.
 */
export type EntryBrief = {
  summary: string;
  facts: QuickFact[];
};

export type DestinationProfile = {
  citizenship: CitizenshipIdentity;
  destination: DestinationIdentity;
  entry: EntryBrief;
  quickFacts: QuickFact[];
  /**
   * Headline metrics as a spec list: the route count plus quality-of-life and
   * money signals (cost, rent, pay, healthcare, safety, ecology, education,
   * democracy, language-for-you). Hardcoded in the fixture for now.
   */
  glance: GlanceMetric[];
  fitsYouIf: FitSignal[];
};
