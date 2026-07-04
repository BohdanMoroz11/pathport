import type {
  CitizenshipIdentity,
  CountryBase,
  DestinationIdentity,
  DestinationProfile,
  EntryBrief,
  FitSignal,
  GlanceMetric,
  LanguageForReader,
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

type DestinationEntry = DestinationIdentity & {
  quickFacts: QuickFact[];
  /** Deep country facts for the Country view; only DE is authored so far. */
  country?: CountryBase;
};

const DESTINATIONS: Record<string, DestinationEntry> = {
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
    country: {
      geography: {
        location:
          "Central Europe, sharing land borders with nine countries — more than any other EU state — from the North and Baltic Seas down to the Alps.",
        climate:
          "Temperate and maritime-to-continental: mild, grey, wet winters and warm summers. Snow is common in the south and east; extremes are rare.",
        borders: [
          "Poland",
          "Czechia",
          "Austria",
          "Switzerland",
          "France",
          "Luxembourg",
          "Belgium",
          "Netherlands",
          "Denmark",
        ],
        stats: [
          { label: "Area", value: "357,600 km²", note: "≈ Montana" },
          { label: "Terrain", value: "Lowlands → Alps", note: "flat north, alpine south" },
          { label: "Coastline", value: "North & Baltic Seas" },
          { label: "Time zone", value: "CET (UTC+1)" },
        ],
        cities: [
          { label: "Berlin", value: 3.7, note: "capital" },
          { label: "Hamburg", value: 1.9 },
          { label: "Munich", value: 1.5 },
          { label: "Cologne", value: 1.1 },
          { label: "Frankfurt", value: 0.77, note: "financial hub" },
        ],
      },
      people: {
        stats: [
          { label: "Population", value: "84M", tone: "neutral" },
          { label: "Density", value: "232 /km²" },
          { label: "Median age", value: "45", note: "among the world's oldest", tone: "warn" },
          { label: "Life expectancy", value: "81 yrs", tone: "pos" },
          { label: "Urban", value: "78%" },
          { label: "Foreign-born", value: "≈19%", note: "highly international", tone: "pos" },
        ],
        ageBands: [
          { label: "0–14", value: 14 },
          { label: "15–64", value: 64 },
          { label: "65+", value: 22, note: "ageing" },
        ],
        religions: [
          { label: "Unaffiliated", value: 43 },
          { label: "Catholic", value: 26 },
          { label: "Protestant", value: 23 },
          { label: "Muslim", value: 5 },
          { label: "Other", value: 3 },
        ],
      },
      economy: {
        summary:
          "The EU's industrial engine — the fourth-largest economy in the world, built on exports of cars, machinery, and chemicals rather than a single boom sector. Growth has been flat in recent years, but wages are solid, unemployment is low, and an ageing workforce means real, sustained demand for skilled migrants across trades, engineering, health, and IT.",
        stats: [
          { label: "GDP", value: "$4.5T", note: "4th largest", tone: "pos" },
          { label: "GDP per capita", value: "$54,000", tone: "pos" },
          { label: "Unemployment", value: "≈6%", tone: "pos" },
          { label: "Median gross pay", value: "€4,300/mo" },
          { label: "Minimum wage", value: "€12.82/hr", note: "statutory" },
          { label: "Growth", value: "≈0%", note: "stagnant since 2023", tone: "warn" },
        ],
        industries: [
          "Automotive",
          "Machinery & engineering",
          "Chemicals & pharma",
          "Electrical & electronics",
          "IT & software",
          "Healthcare & care work",
          "Skilled trades",
          "Logistics",
        ],
      },
      government: {
        summary:
          "A stable federal parliamentary democracy with strong institutions, an independent judiciary, and a free press. Power is shared between the federal government and sixteen states, and coalition government is the norm. A resurgent far right is the sharpest tension in current politics, strongest in the east.",
        system: "Federal parliamentary republic",
        memberships: ["EU", "Eurozone", "Schengen", "NATO", "UN", "OECD", "G7"],
        stats: [
          { label: "Democracy Index", value: "8.8 / 10", note: "full democracy", tone: "pos" },
          { label: "Corruption (CPI)", value: "Top 15", note: "low corruption", tone: "pos" },
          { label: "Press freedom", value: "High", tone: "pos" },
          { label: "Rule of law", value: "Strong", tone: "pos" },
        ],
      },
      culture: {
        summary:
          "Order, planning, and privacy run deep. People value directness, punctuality, and a firm line between work and private life — long holidays are taken seriously and out-of-hours emails are not. Newcomers meet a warm, reliable society once past an initially reserved and rule-bound surface.",
        notes: [
          {
            title: "Punctuality is respect",
            body: "Being on time is expected socially and professionally; five minutes late warrants a message.",
          },
          {
            title: "Sundays are quiet",
            body: "Most shops close and 'Ruhezeit' quiet hours limit noise — no drilling or loud laundry. Stock up on Saturday.",
          },
          {
            title: "Cash still matters",
            body: "Cards are increasingly accepted, but many bakeries, bars, and small shops remain cash-only. Carry some.",
          },
          {
            title: "Recycling is a system",
            body: "Waste is sorted into several bins, and bottles carry a 'Pfand' deposit you reclaim at the machine.",
          },
          {
            title: "Directness isn't rudeness",
            body: "People say what they mean plainly. It reads as blunt at first but is meant as honesty, not hostility.",
          },
          {
            title: "Register everything",
            body: "Life runs on paperwork — the 'Anmeldung' address registration unlocks bank accounts, tax IDs, and contracts.",
          },
        ],
      },
      safety: {
        summary:
          "One of the safer large countries in the world. Violent crime is low and policing is trusted; the everyday risks are pickpocketing around transit hubs and tourist areas rather than personal danger.",
        stats: [
          { label: "Overall safety", value: "High", tone: "pos" },
          { label: "Violent crime", value: "Low", tone: "pos" },
          { label: "Petty theft", value: "Moderate", note: "transit hubs", tone: "warn" },
          { label: "Emergency", value: "112", note: "police & ambulance" },
        ],
      },
      rights: {
        lgbtq:
          "Legally strong and socially accepting, especially in cities. Same-sex marriage has been legal since 2017, discrimination is banned, and a 2024 self-determination law lets people change their legal gender by declaration.",
        minorities:
          "A long-established country of immigration with anti-discrimination law and large Turkish, Ukrainian, Arab, and Eastern European communities. Day-to-day acceptance is high in urban areas, though far-right sentiment is a real and rising tension in parts of the east.",
      },
    },
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
type PairContent = {
  entry: EntryBrief;
  glance: GlanceMetric[];
  fitsYouIf: FitSignal[];
  /** The main language read from this citizen's point of view. */
  language: LanguageForReader;
};

const PAIR_CONTENT: Record<string, PairContent> = {
  "UKR/DE": {
    language: {
      official: ["German"],
      difficulty: {
        label: "Moderately hard",
        rating: { score: 2, max: 5, tone: "warn" },
        note: "German is Germanic and unrelated to Ukrainian or Russian, so grammar and vocabulary start unfamiliar. But it shares the Latin alphabet, and any English you have shares roots with German — a real head start on words like Haus, Buch, and Wasser.",
      },
      english:
        "English gets you far in Berlin, big cities, universities, and tech, but German runs everyday bureaucracy, healthcare, and most jobs. Plan to reach B1 for permanent residence and citizenship.",
    },
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
    language: {
      official: [],
      difficulty: {
        label: "Being gathered",
        rating: { score: 0, max: 5, tone: "neutral" },
        note: "The language read for your citizenship is still being gathered.",
      },
      english: "Being gathered.",
    },
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

  const { quickFacts, country: countryBase, ...destination } = destinationEntry;
  const pair = PAIR_CONTENT[`${citizenship.code}/${destination.code}`] ?? synthesizePair();
  const { language, ...overview } = pair;

  // Country facts are destination-level; only the language read is per-citizen,
  // so it is folded in here. Absent country facts leave the view a graceful stub.
  const country = countryBase ? { ...countryBase, language } : undefined;

  return { citizenship, destination, quickFacts, ...overview, country };
}
