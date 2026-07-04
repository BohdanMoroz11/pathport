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
  /** Deep country profile for the Country view; absent while being gathered. */
  country?: CountryProfile;
  /** Cost-of-living profile for the Living view; absent while being gathered. */
  living?: LivingProfile;
};

/* ------------------------------------------------------------------ *
 * Country view — the deep destination profile (geography, people,
 * economy, government, language, culture, safety, rights). Most of it
 * is destination-level fact; only `language` is read from the visitor's
 * citizenship. Authored in the fixture FE-first, same as the Overview.
 * ------------------------------------------------------------------ */

/** A key/value stat for the Country stat grids, with an optional good/bad tone. */
export type CountryStat = { label: string; value: string; note?: string; tone?: AccentTone };

/** One labelled bar in a proportion chart (city size, age band, religion, …). */
export type ShareDatum = { label: string; value: number; note?: string };

/**
 * The main language read from the visitor's point of view: not "is English
 * spoken" but *which* language runs daily life, how hard it is to learn given
 * the reader's probable native languages, and how far English alone carries.
 */
export type LanguageForReader = {
  official: string[];
  /** Difficulty of the main language *for this reader*, as a good/bad meter. */
  difficulty: { label: string; rating: MetricRating; note: string };
  /** How much English alone gets done day to day. */
  english: string;
};

/** A single cultural/everyday-life note (etiquette, rhythm, a local quirk). */
export type CultureNote = { title: string; body: string };

/** Destination-level country facts (everything except the reader's language). */
export type CountryBase = {
  geography: {
    location: string;
    climate: string;
    borders: string[];
    stats: CountryStat[];
    /** Largest cities by population (millions), for a magnitude bar. */
    cities: ShareDatum[];
  };
  people: {
    stats: CountryStat[];
    /** Age bands as shares of the whole (percent). */
    ageBands: ShareDatum[];
    /** Religious affiliation as shares of the whole (percent). */
    religions: ShareDatum[];
  };
  economy: {
    summary: string;
    stats: CountryStat[];
    /** Sectors actively hiring / where the jobs are. */
    industries: string[];
  };
  government: {
    summary: string;
    system: string;
    memberships: string[];
    stats: CountryStat[];
  };
  culture: { summary: string; notes: CultureNote[] };
  safety: { summary: string; stats: CountryStat[] };
  rights: { lgbtq: string; minorities: string };
};

/** Full Country profile = destination facts + the reader's language read. */
export type CountryProfile = CountryBase & { language: LanguageForReader };

/* ------------------------------------------------------------------ *
 * Living view — the cost-of-living and practical-life section: monthly
 * budgets, rent by city, everyday prices, tax, healthcare, schooling,
 * and lifestyle. Destination-level facts, authored in the fixture.
 * ------------------------------------------------------------------ */

/** A reference price: an item and its display-ready cost. */
export type PriceItem = { label: string; value: string; note?: string };

/** A monthly-budget persona (single / couple / family) with its breakdown. */
export type BudgetPersona = {
  label: string;
  /** Display-ready monthly total, e.g. "€2,400". */
  total: string;
  note?: string;
  /** Category lines (rent, food, …) as euro amounts, for the bars + total. */
  lines: ShareDatum[];
};

/** Rent for one city: the headline 1-bed centre (the bar) plus comparisons. */
export type RentRow = {
  city: string;
  /** 1-bed, city centre — €/mo, the headline magnitude. */
  centre: number;
  /** 1-bed, outside centre — €/mo. */
  outer: number;
  /** 3-bed family flat, city centre — €/mo. */
  family: number;
  note?: string;
};

/** Take-home breakdown: what a sample gross salary nets after deductions. */
export type TaxBreakdown = {
  /** Context line, e.g. "On €4,000/mo gross for a single earner". */
  grossLabel: string;
  gross: number;
  net: number;
  /** The deductions that make up the gap (income tax, health, pension, …). */
  deductions: PriceItem[];
  note: string;
};

export type LivingProfile = {
  currency: string;
  intro: string;
  budgets: BudgetPersona[];
  rent: { note: string; rows: RentRow[] };
  groceries: PriceItem[];
  eatingOut: PriceItem[];
  /** Recurring essentials (transport pass, utilities, internet, mobile). */
  essentials: CountryStat[];
  tax: TaxBreakdown;
  healthcare: { summary: string; stats: CountryStat[] };
  schooling: { summary: string; stats: CountryStat[] };
  lifestyle: PriceItem[];
};
