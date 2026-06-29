import type {
  CitizenshipIdentity,
  DestinationIdentity,
  DestinationProfile,
  EntryBrief,
  FitSignal,
  GlanceMetric,
  QuickFact,
} from "./types.js";

/**
 * Throwaway demo data for the S3 reference page, matching the demo seed's codes
 * (citizenships USA/UKR, destinations DE/PT/ES). FE-first: the page renders from
 * this until the shape is locked and pushed down into the real stack. The
 * Ukraine → Germany pairing is the fully authored one (it is the design
 * concept's subject); other pairings are synthesized so navigation never
 * dead-ends while the deeper views are built out.
 */

const CITIZENSHIPS: Record<string, CitizenshipIdentity> = {
  USA: { code: "USA", name: "United States", flag: "\u{1F1FA}\u{1F1F8}" },
  UKR: { code: "UKR", name: "Ukraine", flag: "\u{1F1FA}\u{1F1E6}" },
};

const DESTINATIONS: Record<string, DestinationIdentity & { quickFacts: QuickFact[] }> = {
  DE: {
    code: "DE",
    name: "Germany",
    flag: "\u{1F1E9}\u{1F1EA}",
    region: "Western Europe",
    tagline: "Western Europe · strong labour market · EU member",
    description:
      "Germany is the European Union's largest economy and most populous member state, anchoring central Europe with a deep industrial and engineering base and a skills shortage that keeps demand for foreign workers high. It runs a social-market system — universal healthcare, tuition-free public universities, generous parental leave, and strong worker protections — paid for by high taxes and social contributions. Life is orderly and well-served: reliable public transport, walkable cities, and broad legal protections, balanced against a famously thorough bureaucracy that rewards patience and paperwork. German still does most of the day-to-day heavy lifting, though English carries you a long way in larger cities, universities, and the tech sector. The climate is temperate — grey, mild winters and warm summers — and the country is well connected to the rest of Europe by rail and air.",
    quickFacts: [
      { label: "Capital", value: "Berlin" },
      { label: "Language", value: "German" },
      { label: "Currency", value: "EUR €" },
      { label: "Population", value: "84M" },
      { label: "EU member", value: "Yes" },
    ],
  },
  PT: {
    code: "PT",
    name: "Portugal",
    flag: "\u{1F1F5}\u{1F1F9}",
    region: "Southern Europe",
    tagline: "Southern Europe · mild climate · EU member",
    description:
      "Portugal sits on the Atlantic edge of the Iberian Peninsula: small, temperate, and increasingly popular with newcomers for its mild climate, lower cost of living, and relatively open residence routes. Wages are below the EU average, but so are everyday costs outside Lisbon and Porto. English is common in cities and tourism, and the path to permanent residence and citizenship is shorter than in much of Europe.",
    quickFacts: [
      { label: "Capital", value: "Lisbon" },
      { label: "Language", value: "Portuguese" },
      { label: "Currency", value: "EUR €" },
      { label: "Population", value: "10M" },
      { label: "EU member", value: "Yes" },
    ],
  },
  ES: {
    code: "ES",
    name: "Spain",
    flag: "\u{1F1EA}\u{1F1F8}",
    region: "Southern Europe",
    tagline: "Southern Europe · large economy · EU member",
    description:
      "Spain pairs a large, diverse economy with a warm climate and a strong quality-of-life reputation. Regions vary widely — Madrid and Barcelona are dense and international, while the coast and interior are cheaper and slower-paced. Spanish is essential outside tourist hubs (and Catalan, Basque or Galician in some regions). Residence routes are broad, and after ten years most residents can naturalise.",
    quickFacts: [
      { label: "Capital", value: "Madrid" },
      { label: "Language", value: "Spanish" },
      { label: "Currency", value: "EUR €" },
      { label: "Population", value: "48M" },
      { label: "EU member", value: "Yes" },
    ],
  },
};

/** Per-pairing content: the citizenship-specific read of a destination. */
type PairContent = { entry: EntryBrief; glance: GlanceMetric[]; fitsYouIf: FitSignal[] };

const PAIR_CONTENT: Record<string, PairContent> = {
  "UKR/DE": {
    entry: {
      summary:
        "You can enter the Schengen area visa-free for 90 days — and as a Ukrainian, activate temporary protection for the immediate right to live, work, and study.",
      facts: [
        { label: "Visa-free", value: "90 days" },
        { label: "Status", value: "Temporary protection" },
      ],
    },
    glance: [
      { label: "Routes available", value: "7 · 5 categories", section: "routes" },
      {
        label: "Quality of life",
        value: "Very good",
        rating: { score: 5, max: 5, tone: "pos" },
        valueTone: "pos",
        section: "country",
      },
      {
        label: "Cost of living",
        value: "~€2,400/mo",
        rating: { score: 3, max: 5, tone: "warn" },
        note: "single, mid-range",
        section: "living",
      },
      {
        label: "Rent",
        value: "~€1,250/mo",
        rating: { score: 3, max: 5, tone: "warn" },
        note: "1-bed, city centre",
        section: "living",
      },
      {
        label: "Net salary",
        value: "~€2,800/mo",
        rating: { score: 4, max: 5, tone: "pos" },
        note: "full-time median",
        section: "living",
      },
      {
        label: "Healthcare",
        value: "Universal",
        rating: { score: 4, max: 5, tone: "pos" },
        valueTone: "pos",
        section: "country",
      },
      {
        label: "Education",
        value: "Strong",
        rating: { score: 4, max: 5, tone: "pos" },
        valueTone: "pos",
        section: "country",
      },
      {
        label: "Safety",
        value: "High",
        rating: { score: 4, max: 5, tone: "pos" },
        valueTone: "pos",
        note: "low violent crime",
        section: "country",
      },
      {
        label: "Ecology",
        value: "Good",
        rating: { score: 4, max: 5, tone: "pos" },
        valueTone: "pos",
        note: "air & environment",
        section: "country",
      },
      {
        label: "Democracy",
        value: "Full",
        rating: { score: 5, max: 5, tone: "pos" },
        valueTone: "pos",
        section: "country",
      },
      {
        label: "Language",
        value: "German",
        rating: { score: 2, max: 5, tone: "warn" },
        note: "unrelated to UA/RU; your English gives a small head start",
        section: "country",
      },
    ],
    fitsYouIf: [
      {
        text: "You're fleeing the war",
        match: "yes",
        detail: "Immediate temporary protection — live and work, no visa process",
      },
      {
        text: "You have a qualifying job offer",
        match: "yes",
        detail: "EU Blue Card above the salary threshold — the fastest path to PR",
      },
      {
        text: "You hold a recognised university degree",
        match: "yes",
        detail: "Opens the Blue Card and Skilled Worker routes",
      },
      {
        text: "You're self-employed with steady clients",
        match: "maybe",
        detail: "Freelance residence is possible but paperwork-heavy and slower",
      },
      {
        text: "A relative already has residence here",
        match: "yes",
        detail: "Family reunification, with work rights following the sponsor",
      },
      {
        text: "You want to study, then switch to work",
        match: "maybe",
        detail: "Student visa converts to work routes after graduation",
      },
    ],
  },
};

function synthesizePair(): PairContent {
  return {
    entry: {
      summary: "Entry rules for your citizenship are still being gathered.",
      facts: [],
    },
    glance: [
      { label: "Routes available", value: "—", section: "routes" },
      { label: "Quality of life", value: "—", section: "country" },
      { label: "Cost of living", value: "—", section: "living" },
      { label: "Safety", value: "—", section: "country" },
      { label: "Language", value: "—", note: "being gathered", section: "country" },
    ],
    fitsYouIf: [
      { text: "You have a qualifying job offer", match: "maybe" },
      { text: "You hold a recognised university degree", match: "maybe" },
      { text: "A close relative already has residence here", match: "maybe" },
      { text: "You can show steady self-employed income", match: "maybe" },
    ],
  };
}

/**
 * Resolve the Overview profile for a citizenship × destination, or `null` when
 * either code is outside the demo set. Codes are matched case-insensitively so
 * URLs like `/explore/ukr/de` and `/explore/UKR/DE` both resolve.
 */
export function getDestinationProfile(
  citizenshipCode: string,
  destinationCode: string,
): DestinationProfile | null {
  const citizenship = CITIZENSHIPS[citizenshipCode.toUpperCase()];
  const destinationEntry = DESTINATIONS[destinationCode.toUpperCase()];
  if (!citizenship || !destinationEntry) {
    return null;
  }

  const { quickFacts, ...destination } = destinationEntry;
  const pair = PAIR_CONTENT[`${citizenship.code}/${destination.code}`] ?? synthesizePair();

  return { citizenship, destination, quickFacts, ...pair };
}
