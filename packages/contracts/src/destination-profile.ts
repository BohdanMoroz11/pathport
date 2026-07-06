import { z } from "zod";

/**
 * Shared shape of the destination shell — the Overview plus the deep Country,
 * Living, Work, Family, and Entry sections. This is the single source of truth
 * for that surface: `packages/db` imports these schemas to validate the JSONB it
 * stores (seed on write, API on read), and the web app imports the inferred
 * *types* only, so no runtime Zod lands in its bundle.
 *
 * The content splits along one seam (see docs/domain-model.md):
 *   - destination-level facts (same for every visitor) → `destination_countries`
 *   - pairing-level facts (read from the visitor's citizenship) → `arrival_context`
 * The API assembles both into one `DestinationProfile` response.
 */

// --- Primitives ------------------------------------------------------------

/** Functional accent tokens a metric/marker can be encoded with. */
export const accentToneSchema = z.enum(["pos", "warn", "danger", "neutral", "brand", "violet"]);
export type AccentTone = z.infer<typeof accentToneSchema>;

/** A yes / qualified-maybe / no read, reused across fit and feasibility marks. */
export const matchSchema = z.enum(["yes", "maybe", "no"]);

/** A scannable key/value chip in the quick-facts strip. */
export const quickFactSchema = z.object({ label: z.string(), value: z.string() });
export type QuickFact = z.infer<typeof quickFactSchema>;

/**
 * A good/bad indicator drawn as a filled bar (`score` of `max`), coloured by
 * `tone`. Higher is always better for the reader.
 */
export const metricRatingSchema = z.object({
  score: z.number(),
  max: z.number(),
  tone: accentToneSchema,
});
export type MetricRating = z.infer<typeof metricRatingSchema>;

/** A key/value stat with an optional good/bad tone and qualifier note. */
export const countryStatSchema = z.object({
  label: z.string(),
  value: z.string(),
  note: z.string().optional(),
  tone: accentToneSchema.optional(),
});
export type CountryStat = z.infer<typeof countryStatSchema>;

/** One labelled bar in a proportion chart (city size, age band, religion, …). */
export const shareDatumSchema = z.object({
  label: z.string(),
  value: z.number(),
  note: z.string().optional(),
});
export type ShareDatum = z.infer<typeof shareDatumSchema>;

/** One point in a metric's time series (year → value). */
export const trendPointSchema = z.object({ year: z.string(), value: z.number() });
export type TrendPoint = z.infer<typeof trendPointSchema>;

/** A single switchable metric for a trend chart. */
export const trendSeriesSchema = z.object({
  id: z.string(),
  label: z.string(),
  prefix: z.string().optional(),
  unit: z.string().optional(),
  points: z.array(trendPointSchema),
  note: z.string(),
});
export type TrendSeries = z.infer<typeof trendSeriesSchema>;

/** A titled step in a how-to sequence. */
export const workStepSchema = z.object({ title: z.string(), body: z.string() });
export type WorkStep = z.infer<typeof workStepSchema>;

/** A reference price: an item and its display-ready cost. */
export const priceItemSchema = z.object({
  label: z.string(),
  value: z.string(),
  note: z.string().optional(),
});
export type PriceItem = z.infer<typeof priceItemSchema>;

/** Take-home breakdown: what a sample gross salary nets after deductions. */
export const taxBreakdownSchema = z.object({
  grossLabel: z.string(),
  gross: z.number(),
  net: z.number(),
  deductions: z.array(priceItemSchema),
  note: z.string(),
});
export type TaxBreakdown = z.infer<typeof taxBreakdownSchema>;

// --- Country section -------------------------------------------------------

/** A captioned image placeholder for the geography gallery (no asset yet). */
export const geoImageSchema = z.object({ caption: z.string() });
export type GeoImage = z.infer<typeof geoImageSchema>;

/** One season's typical weather, for the climate breakdown. */
export const climateSeasonSchema = z.object({
  label: z.string(),
  months: z.string(),
  temp: z.string(),
  precip: z.string(),
  note: z.string().optional(),
});
export type ClimateSeason = z.infer<typeof climateSeasonSchema>;

/** A share of parliament/vote for one political force. */
export const partyShareSchema = z.object({
  label: z.string(),
  value: z.number(),
  note: z.string().optional(),
});
export type PartyShare = z.infer<typeof partyShareSchema>;

/** One entry in a recent-history timeline. */
export const timelineEntrySchema = z.object({
  period: z.string(),
  label: z.string(),
  note: z.string().optional(),
});
export type TimelineEntry = z.infer<typeof timelineEntrySchema>;

export const trendDirectionSchema = z.enum(["improving", "worsening", "stable"]);
export type TrendDirection = z.infer<typeof trendDirectionSchema>;

/** A qualitative note about how something varies by region. */
export const regionNoteSchema = z.object({
  label: z.string(),
  note: z.string(),
  tone: accentToneSchema.optional(),
});
export type RegionNote = z.infer<typeof regionNoteSchema>;

/**
 * The main language read from the visitor's point of view: which language runs
 * daily life, how hard it is to learn for this reader, and how far English
 * carries. Pairing-level — folded into the assembled Country profile.
 */
export const languageForReaderSchema = z.object({
  official: z.array(z.string()),
  difficulty: z.object({
    label: z.string(),
    rating: metricRatingSchema,
    note: z.string(),
  }),
  english: z.string(),
});
export type LanguageForReader = z.infer<typeof languageForReaderSchema>;

/** A single cultural/everyday-life note. */
export const cultureNoteSchema = z.object({ title: z.string(), body: z.string() });
export type CultureNote = z.infer<typeof cultureNoteSchema>;

/** Destination-level country facts (everything except the reader's language). */
export const countryBaseSchema = z.object({
  geography: z.object({
    location: z.string(),
    borders: z.array(z.string()),
    stats: z.array(countryStatSchema),
    cities: z.array(shareDatumSchema),
    images: z.array(geoImageSchema),
    climate: z.object({
      summary: z.string(),
      stability: z.string(),
      seasons: z.array(climateSeasonSchema),
    }),
  }),
  people: z.object({
    summary: z.string(),
    stats: z.array(countryStatSchema),
    ageBands: z.array(shareDatumSchema),
    religions: z.array(shareDatumSchema),
  }),
  economy: z.object({
    summary: z.string(),
    stats: z.array(countryStatSchema),
    trends: z.array(trendSeriesSchema),
  }),
  government: z.object({
    summary: z.string(),
    system: z.string(),
    memberships: z.array(z.string()),
    stats: z.array(countryStatSchema),
    parties: z.array(partyShareSchema),
    currentGovernment: z.string(),
    nextElection: z.string(),
    timeline: z.array(timelineEntrySchema),
  }),
  culture: z.object({ summary: z.string(), notes: z.array(cultureNoteSchema) }),
  safety: z.object({
    summary: z.string(),
    stats: z.array(countryStatSchema),
    trend: z.object({ direction: trendDirectionSchema, note: z.string() }),
    regional: z.object({ summary: z.string(), areas: z.array(regionNoteSchema) }),
  }),
  rights: z.object({ lgbtq: z.string(), minorities: z.string() }),
});
export type CountryBase = z.infer<typeof countryBaseSchema>;

/** Full Country profile = destination facts + the reader's language read. */
export type CountryProfile = CountryBase & { language: LanguageForReader };

// --- Living section --------------------------------------------------------

/** A monthly-budget persona (single / couple / family) with its breakdown. */
export const budgetPersonaSchema = z.object({
  label: z.string(),
  total: z.string(),
  note: z.string().optional(),
  lines: z.array(shareDatumSchema),
});
export type BudgetPersona = z.infer<typeof budgetPersonaSchema>;

/** Rent for one city: the headline 1-bed centre plus comparisons. */
export const rentRowSchema = z.object({
  city: z.string(),
  centre: z.number(),
  outer: z.number(),
  family: z.number(),
  note: z.string().optional(),
});
export type RentRow = z.infer<typeof rentRowSchema>;

/** One way to access a service (a healthcare track, a type of school). */
export const accessOptionSchema = z.object({
  label: z.string(),
  tagline: z.string(),
  cost: z.string().optional(),
  quality: z.string(),
  caveats: z.array(z.string()),
  tone: accentToneSchema.optional(),
});
export type AccessOption = z.infer<typeof accessOptionSchema>;

export const livingProfileSchema = z.object({
  currency: z.string(),
  intro: z.string(),
  budgets: z.array(budgetPersonaSchema),
  rent: z.object({ note: z.string(), rows: z.array(rentRowSchema) }),
  groceries: z.array(priceItemSchema),
  eatingOut: z.array(priceItemSchema),
  leisure: z.array(priceItemSchema),
  essentials: z.array(countryStatSchema),
  healthcare: z.object({
    summary: z.string(),
    stats: z.array(countryStatSchema),
    ways: z.array(accessOptionSchema),
  }),
  schooling: z.object({
    summary: z.string(),
    stats: z.array(countryStatSchema),
    options: z.array(accessOptionSchema),
  }),
});
export type LivingProfile = z.infer<typeof livingProfileSchema>;

// --- Work & income section -------------------------------------------------

/** One way to earn a living, with its tax/setup shape and trade-offs. */
export const earningModeSchema = z.object({
  label: z.string(),
  tagline: z.string(),
  taxNote: z.string(),
  setupNote: z.string(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
});
export type EarningMode = z.infer<typeof earningModeSchema>;

/** Effective tax burden for one earning mode. */
export const incomeLaneSchema = z.object({
  mode: z.string(),
  burden: z.string(),
  note: z.string(),
});
export type IncomeLane = z.infer<typeof incomeLaneSchema>;

/** An in-demand field with why it's short-staffed and a typical pay hint. */
export const demandFieldSchema = z.object({
  label: z.string(),
  why: z.string(),
  pay: z.string().optional(),
});
export type DemandField = z.infer<typeof demandFieldSchema>;

/** A setup checklist specific to one earning mode. */
export const setupTrackSchema = z.object({
  mode: z.string(),
  note: z.string(),
  steps: z.array(workStepSchema),
});
export type SetupTrack = z.infer<typeof setupTrackSchema>;

export const workProfileSchema = z.object({
  intro: z.string(),
  rightToWork: z.object({ summary: z.string(), stats: z.array(countryStatSchema) }),
  modes: z.array(earningModeSchema),
  incomeTax: z.object({
    summary: z.string(),
    takeHome: taxBreakdownSchema,
    lanes: z.array(incomeLaneSchema),
    trends: z.array(trendSeriesSchema),
    accounting: z.string(),
  }),
  finding: z.object({ summary: z.string(), channels: z.array(z.string()) }),
  industries: z.array(z.string()),
  setup: z.object({
    summary: z.string(),
    general: z.array(workStepSchema),
    byMode: z.array(setupTrackSchema),
  }),
  credentials: z.object({ summary: z.string(), stats: z.array(countryStatSchema) }),
  demand: z.object({
    summary: z.string(),
    inDemand: z.array(demandFieldSchema),
    saturated: z.array(z.string()),
    note: z.string(),
  }),
});
export type WorkProfile = z.infer<typeof workProfileSchema>;

// --- Family & pets section -------------------------------------------------

/** Someone you might bring under family reunification. */
export const familyMemberSchema = z.object({
  label: z.string(),
  feasibility: matchSchema,
  tagline: z.string(),
  conditions: z.array(z.string()),
});
export type FamilyMember = z.infer<typeof familyMemberSchema>;

export const familyProfileSchema = z.object({
  intro: z.string(),
  reunification: z.object({ summary: z.string(), stats: z.array(countryStatSchema) }),
  members: z.array(familyMemberSchema),
  perks: z.object({ summary: z.string(), stats: z.array(countryStatSchema) }),
  pets: z.object({
    summary: z.string(),
    checklist: z.array(workStepSchema),
    stats: z.array(countryStatSchema),
    restricted: z.array(z.string()),
    note: z.string(),
  }),
});
export type FamilyProfile = z.infer<typeof familyProfileSchema>;

// --- Entry section ---------------------------------------------------------

/** One route-to-permit option surfaced from Entry, linking into the Routes view. */
export const permitPathSchema = z.object({
  label: z.string(),
  forWhom: z.string(),
  note: z.string(),
});
export type PermitPath = z.infer<typeof permitPathSchema>;

/** A short, citizenship-specific read of how you first get in. */
export const entryBriefSchema = z.object({
  summary: z.string(),
  facts: z.array(quickFactSchema),
});
export type EntryBrief = z.infer<typeof entryBriefSchema>;

/** The full Entry view: a generalized border-to-permit journey. */
export const entryProfileSchema = z.object({
  intro: z.string(),
  arrival: z.object({ summary: z.string(), stats: z.array(countryStatSchema) }),
  documents: z.object({ summary: z.string(), items: z.array(z.string()) }),
  onArrival: z.object({
    can: z.array(z.string()),
    cannot: z.array(z.string()),
    note: z.string(),
  }),
  toPermit: z.object({
    summary: z.string(),
    steps: z.array(workStepSchema),
    paths: z.array(permitPathSchema),
  }),
});
export type EntryProfile = z.infer<typeof entryProfileSchema>;

// --- Overview signals ------------------------------------------------------

/**
 * One row in the "At a glance" spec list. `value` is display-ready; `rating` is
 * the optional good/bad bar; `section` deep-links the row to the section that
 * owns the detail.
 */
export const glanceMetricSchema = z.object({
  label: z.string(),
  value: z.string(),
  rating: metricRatingSchema.optional(),
  note: z.string().optional(),
  section: z.string().optional(),
  valueTone: accentToneSchema.optional(),
});
export type GlanceMetric = z.infer<typeof glanceMetricSchema>;

/** A "this fits you if…" signal, authored per citizenship × destination. */
export const fitSignalSchema = z.object({
  text: z.string(),
  match: matchSchema,
  detail: z.string().optional(),
});
export type FitSignal = z.infer<typeof fitSignalSchema>;

// --- Identity --------------------------------------------------------------

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
  /** Short region/standing line shown in the rail. */
  tagline: string;
  region: string;
  description: string;
};

// --- Stored JSONB blobs ----------------------------------------------------

/**
 * Destination-level section content, stored as the `destination_countries.profile`
 * JSONB. Each section is optional so an unfilled one degrades to its scaffold.
 * (`quickFacts` defaults to empty for the same reason.)
 */
export const destinationDetailSchema = z.object({
  quickFacts: z.array(quickFactSchema).default([]),
  country: countryBaseSchema.optional(),
  living: livingProfileSchema.optional(),
  work: workProfileSchema.optional(),
  family: familyProfileSchema.optional(),
});
/** Authoring/storage shape (every key optional). */
export type DestinationDetail = z.input<typeof destinationDetailSchema>;
/** Normalized read shape (`quickFacts` always present). */
export type NormalizedDestinationDetail = z.output<typeof destinationDetailSchema>;

/**
 * Pairing-level, reader-specific section content, stored as the
 * `arrival_context.profile` JSONB. All optional; a missing pairing row falls
 * back to a synthesized "being gathered" stub in the API.
 */
export const destinationPairingSchema = z.object({
  language: languageForReaderSchema.optional(),
  entry: entryBriefSchema.optional(),
  entryDetail: entryProfileSchema.optional(),
  glance: z.array(glanceMetricSchema).default([]),
  fitsYouIf: z.array(fitSignalSchema).default([]),
});
export type DestinationPairing = z.input<typeof destinationPairingSchema>;
export type NormalizedDestinationPairing = z.output<typeof destinationPairingSchema>;

// --- Assembled response ----------------------------------------------------

/**
 * The full destination shell for a citizenship × destination, assembled by the
 * API from the destination-level and pairing-level records. This is what the web
 * app renders; `country` folds the pairing `language` read into the base facts.
 */
export type DestinationProfile = {
  citizenship: CitizenshipIdentity;
  destination: DestinationIdentity;
  quickFacts: QuickFact[];
  entry: EntryBrief;
  entryDetail?: EntryProfile;
  glance: GlanceMetric[];
  fitsYouIf: FitSignal[];
  country?: CountryProfile;
  living?: LivingProfile;
  work?: WorkProfile;
  family?: FamilyProfile;
};

/** Validate and normalize the destination-level JSONB. Throws on a bad shape. */
export function parseDestinationDetail(value: unknown): NormalizedDestinationDetail {
  return destinationDetailSchema.parse(value);
}

/** Validate and normalize the pairing-level JSONB. Throws on a bad shape. */
export function parseDestinationPairing(value: unknown): NormalizedDestinationPairing {
  return destinationPairingSchema.parse(value);
}
