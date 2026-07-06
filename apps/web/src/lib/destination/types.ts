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

/**
 * The full Entry view: how you first arrive, read from the visitor's
 * citizenship. Unlike the mostly destination-level Country/Living/Work/Family
 * facts, arrival rules turn on *your* passport — so this is authored per
 * pairing, alongside the Overview's EntryBrief teaser that links here.
 */
export type EntryProfile = {
  intro: string;
  /** The headline: how you legally cross the border right now. */
  arrival: { summary: string; stats: CountryStat[] };
  /** What to carry — a border/settling document checklist. */
  documents: { summary: string; items: string[] };
  /** Special status where it applies (e.g. temporary protection). Optional. */
  protection?: { summary: string; stats: CountryStat[] };
  /** What you may and may not do the moment you land. */
  onArrival: { can: string[]; cannot: string[]; note: string };
  /** The first things to do after you land, in order. */
  firstSteps: WorkStep[];
};

export type DestinationProfile = {
  citizenship: CitizenshipIdentity;
  destination: DestinationIdentity;
  entry: EntryBrief;
  /** Full Entry view; absent while being gathered (falls back to the stub). */
  entryDetail?: EntryProfile;
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
  /** Work & income profile for the Work view; absent while being gathered. */
  work?: WorkProfile;
  /** Family & pets profile for the Family view; absent while being gathered. */
  family?: FamilyProfile;
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

/** One season's typical weather, for the climate breakdown. */
export type ClimateSeason = {
  label: string;
  /** Which months this covers, e.g. "Dec–Feb". */
  months: string;
  /** Typical temperature range, display-ready, e.g. "−2 to 4°C". */
  temp: string;
  /** Rain/snow character, e.g. "Wet & grey, some snow". */
  precip: string;
  note?: string;
};

/** A captioned image placeholder for the geography gallery (no asset yet). */
export type GeoImage = { caption: string };

/** One point in a metric's time series (year → value). */
export type TrendPoint = { year: string; value: number };

/**
 * A single switchable metric for the economy trend chart: a time series plotted
 * as a single-hue line, with display affixes and a one-line read of the trend.
 */
export type TrendSeries = {
  id: string;
  label: string;
  /** Display prefix (e.g. "$", "€") and suffix (e.g. "T", "%", "/mo"). */
  prefix?: string;
  unit?: string;
  points: TrendPoint[];
  /** A sentence describing this metric's trend, shown under the chart. */
  note: string;
};

/** A share of parliament/vote for one political force (magnitude bar). */
export type PartyShare = { label: string; value: number; note?: string };

/** One entry in a recent-history timeline (governments, eras). */
export type TimelineEntry = { period: string; label: string; note?: string };

/** Direction of a good/bad trend over time. */
export type TrendDirection = "improving" | "worsening" | "stable";

/** A qualitative note about how something varies by region. */
export type RegionNote = { label: string; note: string; tone?: AccentTone };

/** Destination-level country facts (everything except the reader's language). */
export type CountryBase = {
  geography: {
    location: string;
    borders: string[];
    stats: CountryStat[];
    /** Largest cities by population (millions), for a magnitude bar. */
    cities: ShareDatum[];
    /** Captioned image placeholders for the geography gallery. */
    images: GeoImage[];
    climate: {
      summary: string;
      /** How predictable the weather is (extremes, seasonality). */
      stability: string;
      seasons: ClimateSeason[];
    };
  };
  people: {
    /** Narrative overview, in the rhythm of the other sections. */
    summary: string;
    stats: CountryStat[];
    /** Age bands as shares of the whole (percent). */
    ageBands: ShareDatum[];
    /** Religious affiliation as shares of the whole (percent). */
    religions: ShareDatum[];
  };
  economy: {
    summary: string;
    stats: CountryStat[];
    /** Switchable time-series metrics (GDP, pay, unemployment, …). */
    trends: TrendSeries[];
  };
  government: {
    summary: string;
    system: string;
    memberships: string[];
    stats: CountryStat[];
    /** Main political forces by share of parliament. */
    parties: PartyShare[];
    /** Who governs right now, in a sentence. */
    currentGovernment: string;
    /** When the next scheduled national vote falls due. */
    nextElection: string;
    /** Recent governing eras, most-recent first. */
    timeline: TimelineEntry[];
  };
  culture: { summary: string; notes: CultureNote[] };
  safety: {
    summary: string;
    stats: CountryStat[];
    /** Where the trend is heading, with a supporting sentence. */
    trend: { direction: TrendDirection; note: string };
    /** How safety varies across the country. */
    regional: { summary: string; areas: RegionNote[] };
  };
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
  healthcare: { summary: string; stats: CountryStat[] };
  schooling: { summary: string; stats: CountryStat[] };
  lifestyle: PriceItem[];
};

/* ------------------------------------------------------------------ *
 * Work & income view — arguably the core of the app: the ways to earn
 * (employee → business owner), how each is taxed, getting registered,
 * finding work, credential recognition, and what's in demand. Owns the
 * income/tax-by-mode detail; the Living view links here for it.
 * ------------------------------------------------------------------ */

/** One way to earn a living, with its tax/setup shape and trade-offs. */
export type EarningMode = {
  label: string;
  tagline: string;
  /** How this mode is taxed, in a sentence. */
  taxNote: string;
  /** How you set it up / register, in a sentence. */
  setupNote: string;
  pros: string[];
  cons: string[];
};

/** A titled step in a how-to sequence (getting set up as self-employed). */
export type WorkStep = { title: string; body: string };

/** Effective tax burden for one earning mode, for the by-mode comparison. */
export type IncomeLane = { mode: string; burden: string; note: string };

/** An in-demand field with why it's short-staffed and a typical pay hint. */
export type DemandField = { label: string; why: string; pay?: string };

/** A setup checklist specific to one earning mode (employee, freelancer, …). */
export type SetupTrack = { mode: string; note: string; steps: WorkStep[] };

export type WorkProfile = {
  intro: string;
  rightToWork: { summary: string; stats: CountryStat[] };
  modes: EarningMode[];
  incomeTax: {
    summary: string;
    /** Canonical employee take-home example (the Living view links here). */
    takeHome: TaxBreakdown;
    /** Effective burden across earning modes. */
    lanes: IncomeLane[];
    /** How the tax burden has moved over time (switchable series). */
    trends: TrendSeries[];
    accounting: string;
  };
  finding: { summary: string; channels: string[] };
  /** Sectors actively hiring / where the jobs are (moved from Country). */
  industries: string[];
  /** Getting set up: what everyone does, then per-mode specifics. */
  setup: { summary: string; general: WorkStep[]; byMode: SetupTrack[] };
  credentials: { summary: string; stats: CountryStat[] };
  demand: {
    summary: string;
    /** In-demand fields with why + typical pay, most-wanted first. */
    inDemand: DemandField[];
    saturated: string[];
    note: string;
  };
};

/* ------------------------------------------------------------------ *
 * Family & pets view — who you can bring (partner, children, parents),
 * on what conditions, what family gets once here, and how to move an
 * animal (microchip, rabies, passport, quarantine, restricted breeds).
 * Destination-level policy, authored in the fixture FE-first.
 * ------------------------------------------------------------------ */

/**
 * Someone you might bring under family reunification. `feasibility` reuses the
 * Overview yes/maybe/no read — a clear right, a qualified case, or effectively
 * closed — and drives the marker; `conditions` are what you must satisfy.
 */
export type FamilyMember = {
  label: string;
  feasibility: "yes" | "maybe" | "no";
  tagline: string;
  conditions: string[];
};

export type FamilyProfile = {
  intro: string;
  reunification: { summary: string; stats: CountryStat[] };
  /** Who you can bring, most-feasible first. */
  members: FamilyMember[];
  /** What family members get once here (work, school, healthcare, benefits). */
  perks: { summary: string; stats: CountryStat[] };
  pets: {
    summary: string;
    /** The import sequence in order — microchip → rabies → papers → arrival. */
    checklist: WorkStep[];
    stats: CountryStat[];
    /** Restricted / banned dog breeds. */
    restricted: string[];
    note: string;
  };
};
