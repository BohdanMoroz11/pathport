import {
  type DestinationProfile,
  type EntryBrief,
  type FitSignal,
  type GlanceMetric,
  type LanguageForReader,
  parseDestinationDetail,
  parseDestinationPairing,
} from "@pathport/contracts";

/** The database rows the assembled profile is built from. */
export type DestinationProfileRows = {
  citizenship: { code: string; name: string; flag: string | null };
  destination: {
    code: string;
    name: string;
    flag: string | null;
    tagline: string | null;
    region: string | null;
    description: string | null;
    profile: unknown;
  };
  /** The arrival_context row for this pair, or null when none is authored. */
  pairing: { profile: unknown } | null;
};

/**
 * Fallback pairing content when a citizenship × destination has no authored
 * profile, mirroring the old front-end `synthesizePair` so navigation never
 * dead-ends: the reader-specific reads degrade to a clear "being gathered" state
 * rather than blanks.
 */
const GATHERING_LANGUAGE: LanguageForReader = {
  official: [],
  difficulty: {
    label: "Being gathered",
    rating: { score: 0, max: 5, tone: "neutral" },
    note: "The language read for your citizenship is still being gathered.",
  },
  english: "Being gathered.",
};

const GATHERING_ENTRY: EntryBrief = {
  summary: "Entry rules for your citizenship are still being gathered.",
  facts: [],
};

const GATHERING_GLANCE: GlanceMetric[] = [
  { label: "Routes available", value: "—", section: "routes" },
  { label: "Quality of life", value: "—", section: "country" },
  { label: "Cost of living", value: "—", section: "living" },
  { label: "Safety", value: "—", section: "country" },
  { label: "Language", value: "—", note: "being gathered", section: "country" },
];

const GATHERING_FITS: FitSignal[] = [
  { text: "You have a qualifying job offer", match: "maybe" },
  { text: "You hold a recognised university degree", match: "maybe" },
  { text: "A close relative already has residence here", match: "maybe" },
  { text: "You can show steady self-employed income", match: "maybe" },
];

/**
 * Assemble the destination shell for a citizenship × destination from its
 * destination-level and pairing-level rows. Both JSONB blobs are validated here
 * (validation-on-read) so a malformed row is caught rather than served. The
 * `language` read is pairing-level, so it is folded into the destination-level
 * country facts; absent pairing content degrades to the "being gathered" stub.
 */
export function toDestinationProfile(rows: DestinationProfileRows): DestinationProfile {
  const detail = parseDestinationDetail(rows.destination.profile);
  const pairing = parseDestinationPairing(rows.pairing?.profile ?? {});

  const language = pairing.language ?? GATHERING_LANGUAGE;
  const country = detail.country ? { ...detail.country, language } : undefined;

  return {
    citizenship: {
      code: rows.citizenship.code,
      name: rows.citizenship.name,
      flag: rows.citizenship.flag ?? "",
    },
    destination: {
      code: rows.destination.code,
      name: rows.destination.name,
      flag: rows.destination.flag ?? "",
      tagline: rows.destination.tagline ?? "",
      region: rows.destination.region ?? "",
      description: rows.destination.description ?? "",
    },
    quickFacts: detail.quickFacts,
    entry: pairing.entry ?? GATHERING_ENTRY,
    entryDetail: pairing.entryDetail,
    glance: pairing.glance.length > 0 ? pairing.glance : GATHERING_GLANCE,
    fitsYouIf: pairing.fitsYouIf.length > 0 ? pairing.fitsYouIf : GATHERING_FITS,
    country,
    living: detail.living,
    work: detail.work,
    family: detail.family,
  };
}
