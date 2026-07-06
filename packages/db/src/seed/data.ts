import type { DestinationDetail, DestinationPairing } from "@pathport/contracts";
import type { RouteDetails } from "../route-details.js";
import type {
  confidenceEnum,
  pathToPrEnum,
  reviewStatusEnum,
  routeTypeEnum,
  sourceTypeEnum,
  workPermissionEnum,
} from "../schema.js";
import { germanyDetail, germanyPairings } from "./destination-profiles.js";

type EnumValue<T extends { enumValues: readonly string[] }> = T["enumValues"][number];

export type SeedCitizenship = { code: string; name: string; flag?: string };

/**
 * A demo destination. Identity fields and the destination-level `profile`
 * (Country / Living / Work / Family + quick facts) flesh out the Phase 1
 * `code + name` stub; only Germany is authored so far (see destination-profiles.ts).
 */
export type SeedDestination = {
  code: string;
  name: string;
  flag?: string;
  tagline?: string;
  region?: string;
  description?: string;
  profile?: DestinationDetail;
};

export type SeedSource = {
  type: EnumValue<typeof sourceTypeEnum>;
  label: string;
  url: string;
  lastReviewedAt?: Date;
};

/**
 * A single demo route. `key` is a stable, human-readable handle used only to
 * cross-reference routes during seeding/tests; it is not persisted.
 * `applicableTo` lists the citizenship codes the route is shown for — this is
 * what makes the citizenship filter differentiate (see the humanitarian routes,
 * which are Ukraine-only).
 */
export type SeedRoute = {
  key: string;
  destination: string;
  type: EnumValue<typeof routeTypeEnum>;
  title: string;
  summary: string;
  costMin?: number;
  costMax?: number;
  costCurrency?: string;
  timelineMinMonths?: number;
  timelineMaxMonths?: number;
  workPermission: EnumValue<typeof workPermissionEnum>;
  familyInclusion: boolean;
  familyInclusionNote?: string;
  pathToPermanentResidence: EnumValue<typeof pathToPrEnum>;
  pathToPermanentResidenceNote?: string;
  renewable: boolean;
  renewableNote?: string;
  details: RouteDetails;
  reviewStatus?: EnumValue<typeof reviewStatusEnum>;
  confidence?: EnumValue<typeof confidenceEnum>;
  applicableTo: string[];
  sources?: SeedSource[];
};

export type SeedArrivalContext = {
  citizenship: string;
  destination: string;
  visaFreeDays?: number;
  summary: string;
  /** Pairing-level, reader-specific section content (language, entry, glance, …). */
  profile?: DestinationPairing;
  reviewStatus?: EnumValue<typeof reviewStatusEnum>;
  confidence?: EnumValue<typeof confidenceEnum>;
};

export type SeedData = {
  citizenships: SeedCitizenship[];
  destinations: SeedDestination[];
  routes: SeedRoute[];
  arrivalContext: SeedArrivalContext[];
};

const USA = "USA";
const UKR = "UKR";
const BOTH = [USA, UKR];

/**
 * Throwaway Phase 1 demo data. Not real immigration content: values are
 * plausible-shaped placeholders so the foundation can be built, tested, and
 * demoed end to end. Everything is flagged `is_demo` by the seeder.
 *
 * Coverage goals:
 * - 2 citizenships (US, Ukraine) and 3 destinations (Germany, Portugal, Spain).
 * - every `route_type` appears at least once.
 * - the humanitarian (Temporary Protection) routes are Ukraine-only, so US and
 *   Ukraine provably see different result sets.
 */
export const demoSeedData: SeedData = {
  citizenships: [
    { code: USA, name: "United States", flag: "\u{1F1FA}\u{1F1F8}" },
    { code: UKR, name: "Ukraine", flag: "\u{1F1FA}\u{1F1E6}" },
  ],
  destinations: [
    {
      code: "DE",
      name: "Germany",
      flag: "\u{1F1E9}\u{1F1EA}",
      region: "Western Europe",
      tagline: "Western Europe · strong labour market · EU member",
      description:
        "Germany is the European Union's largest economy and most populous member state, anchoring central Europe with a deep industrial and engineering base and a skills shortage that keeps demand for foreign workers high. It runs a social-market system — universal healthcare, tuition-free public universities, generous parental leave, and strong worker protections — paid for by high taxes and social contributions. Life is orderly and well-served: reliable public transport, walkable cities, and broad legal protections, balanced against a famously thorough bureaucracy that rewards patience and paperwork. German still does most of the day-to-day heavy lifting, though English carries you a long way in larger cities, universities, and the tech sector. The climate is temperate — grey, mild winters and warm summers — and the country is well connected to the rest of Europe by rail and air.",
      profile: germanyDetail,
    },
    { code: "PT", name: "Portugal" },
    { code: "ES", name: "Spain" },
  ],
  routes: [
    // --- Germany -----------------------------------------------------------
    {
      key: "de-skilled-worker",
      destination: "DE",
      type: "work",
      title: "Skilled Worker Visa",
      summary: "Residence permit for qualified professionals with a German job offer.",
      costMin: 75,
      costMax: 100,
      costCurrency: "EUR",
      timelineMinMonths: 2,
      timelineMaxMonths: 4,
      workPermission: "full",
      familyInclusion: true,
      familyInclusionNote: "Spouse and minor children can usually join.",
      pathToPermanentResidence: "eventual",
      pathToPermanentResidenceNote: "Settlement permit typically possible after ~4 years.",
      renewable: true,
      details: {
        eligibilityNotes: ["Recognized qualification and a concrete job offer in Germany."],
        requirementGroups: [
          {
            title: "Core requirements",
            items: [
              "Recognized degree or vocational qualification",
              "Employment contract",
              "Salary at or above the threshold",
            ],
          },
        ],
        documentList: [
          "Passport",
          "Employment contract",
          "Qualification recognition",
          "Proof of health insurance",
        ],
        caveats: ["Demo data — verify thresholds and recognition rules before relying on them."],
        complexity: "high",
        stepsOverview:
          "Get your qualification recognized and a job offer, apply for the visa at a German mission abroad, then convert it to a residence permit after you arrive and register.",
        keyRisks: [
          "Qualification recognition (Anerkennung) can take months and often must finish before you apply.",
          "The job's salary has to clear the route's threshold.",
          "Consulate appointment waits vary a lot by country.",
        ],
        permitWalkthrough: [
          {
            title: "Get your qualification recognized",
            body: "Have your degree or vocational training assessed for equivalence (Anerkennung / ANABIN). Regulated professions must complete this before the visa — it's the step that most often sets the timeline.",
          },
          {
            title: "Secure a qualifying job offer",
            body: "Sign an employment contract meeting the salary and skill thresholds. The employer's HR usually knows what paperwork it must supply.",
          },
          {
            title: "Apply at the German mission abroad",
            body: "Book an appointment at the embassy or consulate for a national (D) visa, submitting your contract, recognition, passport, and proof of health insurance.",
          },
          {
            title: "Enter and register your address",
            body: "On arrival, complete the Anmeldung at the local Bürgeramt within two weeks — everything downstream depends on it.",
          },
          {
            title: "Collect your residence permit",
            body: "Book an appointment at the Ausländerbehörde to have the residence permit issued, converting the entry visa into your work-and-residence title.",
          },
        ],
      },
      reviewStatus: "reviewed",
      confidence: "medium",
      applicableTo: BOTH,
      sources: [
        {
          type: "official",
          label: "Make it in Germany — Skilled workers",
          url: "https://www.make-it-in-germany.com/",
          lastReviewedAt: new Date("2026-01-15T00:00:00Z"),
        },
      ],
    },
    {
      key: "de-blue-card",
      destination: "DE",
      type: "work",
      title: "EU Blue Card",
      summary:
        "Fast-track work permit for highly qualified professionals meeting a salary threshold.",
      costMin: 100,
      costMax: 140,
      costCurrency: "EUR",
      timelineMinMonths: 1,
      timelineMaxMonths: 3,
      workPermission: "full",
      familyInclusion: true,
      pathToPermanentResidence: "eventual",
      pathToPermanentResidenceNote:
        "Settlement permit possible faster than the standard work route.",
      renewable: true,
      details: {
        requirementGroups: [
          {
            title: "Core requirements",
            items: [
              "University degree",
              "Qualifying job offer",
              "Salary above the Blue Card threshold",
            ],
          },
        ],
        caveats: ["Demo data — salary thresholds change yearly."],
        complexity: "moderate",
        stepsOverview:
          "With a degree and a job above the Blue Card salary threshold, apply at a German mission (or in-country if you're already here), then pick up the card after registering.",
        keyRisks: [
          "Your salary must clear the current Blue Card threshold, which is reset each year.",
          "Your degree has to be recognized or ANABIN-listed.",
          "The lower shortage-occupation threshold has its own eligibility rules.",
        ],
        permitWalkthrough: [
          {
            title: "Confirm your degree qualifies",
            body: "Check your university degree is recognized in Germany or listed as comparable in the ANABIN database.",
          },
          {
            title: "Land a job above the threshold",
            body: "Get a contract paying at or above the current Blue Card salary threshold — lower for shortage occupations like IT, engineering, and health.",
          },
          {
            title: "Apply for the Blue Card",
            body: "Apply at the German mission abroad, or directly at the Ausländerbehörde if you're already legally in Germany, with your contract, degree, and passport.",
          },
          {
            title: "Register and collect the card",
            body: "After arrival complete the Anmeldung, then collect the Blue Card — it is your residence permit and speeds up settlement-permit eligibility.",
          },
        ],
      },
      confidence: "medium",
      applicableTo: BOTH,
    },
    {
      key: "de-student",
      destination: "DE",
      type: "study",
      title: "Student Visa",
      summary: "Residence permit to study at a recognized German institution.",
      costMin: 75,
      costMax: 75,
      costCurrency: "EUR",
      timelineMinMonths: 1,
      timelineMaxMonths: 3,
      workPermission: "limited",
      familyInclusion: false,
      familyInclusionNote: "Family reunification is restricted for students.",
      pathToPermanentResidence: "eventual",
      pathToPermanentResidenceNote: "Can switch to a work route after graduation.",
      renewable: true,
      details: {
        requirementGroups: [
          {
            title: "Core requirements",
            items: ["Admission letter", "Proof of funds (blocked account)", "Health insurance"],
          },
        ],
        caveats: ["Demo data."],
        complexity: "moderate",
        stepsOverview:
          "Get admitted to a recognized program, open a blocked account to prove funds, apply for the student visa, then register and enrol on arrival.",
        keyRisks: [
          "A blocked account holding a year's living costs must be funded before you apply.",
          "Work is capped at part-time during study.",
          "You must keep progressing and re-enrol to renew the permit.",
        ],
        permitWalkthrough: [
          {
            title: "Get an admission letter",
            body: "Secure a place — or a conditional/pathway offer — at a recognized German institution.",
          },
          {
            title: "Open a blocked account",
            body: "Deposit a year's living costs into a Sperrkonto to prove you can support yourself; it unlocks in monthly amounts once you arrive.",
          },
          {
            title: "Apply for the student visa",
            body: "Apply at the German mission with your admission letter, blocked-account proof, and health insurance.",
          },
          {
            title: "Register and enrol",
            body: "After arrival, do the Anmeldung, enrol at the university, and collect your residence permit for study.",
          },
          {
            title: "Switch to work after graduating",
            body: "On completion you can take an 18-month permit to find qualified work, then move to a Blue Card or Skilled Worker permit.",
          },
        ],
      },
      applicableTo: BOTH,
    },
    {
      key: "de-family-reunion",
      destination: "DE",
      type: "family",
      title: "Family Reunion Visa",
      summary: "Join a spouse or close family member who already lives in Germany.",
      costMin: 75,
      costMax: 75,
      costCurrency: "EUR",
      timelineMinMonths: 2,
      timelineMaxMonths: 6,
      workPermission: "full",
      familyInclusion: true,
      pathToPermanentResidence: "eventual",
      renewable: true,
      details: {
        requirementGroups: [
          {
            title: "Core requirements",
            items: [
              "Sponsor's residence status",
              "Proof of relationship",
              "Adequate housing and income",
            ],
          },
        ],
        caveats: ["Demo data — language requirements may apply to spouses."],
        complexity: "high",
        stepsOverview:
          "Prove your relationship and that your sponsor can house and support you (a spouse may need basic German), apply at a German mission, then register on arrival.",
        keyRisks: [
          "A joining spouse often needs A1 German first — waived for Blue Card, EU, and protection cases.",
          "The sponsor must show adequate housing and income without relying on benefits.",
          "Legalizing and translating certificates can be slow.",
        ],
        permitWalkthrough: [
          {
            title: "Confirm the sponsor's status",
            body: "The family member in Germany must hold a residence or settlement permit that allows reunification.",
          },
          {
            title: "Gather proof of relationship",
            body: "Marriage or birth certificates, usually legalized/apostilled and translated into German.",
          },
          {
            title: "Meet the language and support tests",
            body: "A joining spouse typically shows A1 German; the sponsor demonstrates adequate housing and income to support the family without benefits.",
          },
          {
            title: "Apply at the German mission",
            body: "The joining family member applies for a family-reunion visa at the embassy in their home country.",
          },
          {
            title: "Register and get work rights",
            body: "After arrival, complete the Anmeldung and collect a residence permit; a spouse's permit generally carries the right to work.",
          },
        ],
      },
      applicableTo: BOTH,
    },
    {
      key: "de-job-seeker",
      destination: "DE",
      type: "other",
      title: "Job Seeker Visa",
      summary: "Six-month residence permit to look for qualified work in Germany.",
      costMin: 75,
      costMax: 75,
      costCurrency: "EUR",
      timelineMinMonths: 1,
      timelineMaxMonths: 2,
      workPermission: "none",
      familyInclusion: false,
      pathToPermanentResidence: "none",
      pathToPermanentResidenceNote: "Must convert to a work permit before any PR track begins.",
      renewable: false,
      renewableNote: "Valid up to six months and generally not extendable.",
      details: {
        eligibilityNotes: [
          "For qualified professionals who want to search for a job on the ground.",
        ],
        caveats: ["Demo data — no employment is allowed until a work permit is granted."],
        complexity: "moderate",
        stepsOverview:
          "Prove your qualifications and savings, get a six-month job-seeker visa, then convert it to a work permit the moment you sign a contract — you can't work until then.",
        keyRisks: [
          "No work is allowed until you convert to a work permit.",
          "The visa lasts up to six months and generally can't be extended.",
          "You must show enough savings to support yourself while searching.",
        ],
        permitWalkthrough: [
          {
            title: "Show qualifications and funds",
            body: "Prove a recognized degree and enough savings to live on while you look for work.",
          },
          {
            title: "Get the job-seeker visa",
            body: "Apply at the German mission for the six-month job-seeker visa.",
          },
          {
            title: "Search on the ground",
            body: "Job-hunt inside Germany; you may attend interviews but cannot take up employment yet.",
          },
          {
            title: "Convert on a job offer",
            body: "Once you sign a qualifying contract, switch to a Skilled Worker permit or Blue Card at the Ausländerbehörde — that's what grants the right to work.",
          },
        ],
      },
      applicableTo: BOTH,
    },
    {
      key: "de-temporary-protection",
      destination: "DE",
      type: "humanitarian",
      title: "Temporary Protection",
      summary: "Immediate residence and work rights under the EU temporary protection scheme.",
      costMin: 0,
      costMax: 0,
      costCurrency: "EUR",
      timelineMinMonths: 0,
      timelineMaxMonths: 1,
      workPermission: "full",
      familyInclusion: true,
      pathToPermanentResidence: "none",
      pathToPermanentResidenceNote: "Status is temporary; PR is not the intended outcome.",
      renewable: true,
      renewableNote: "Extended in line with the EU-wide scheme.",
      details: {
        eligibilityNotes: [
          "Available to displaced people covered by the EU temporary protection directive.",
        ],
        caveats: ["Demo data — scope and duration are set EU-wide and change over time."],
        complexity: "low",
        stepsOverview:
          "Enter visa-free, register your address, and apply for the §24 protection permit at the foreigners' office — you can work from day one.",
        keyRisks: [
          "Status is time-limited and tied to the EU scheme's extensions.",
          "It is not a direct path to permanent residence.",
          "Benefits and housing depend on registering promptly.",
        ],
        permitWalkthrough: [
          {
            title: "Enter visa-free",
            body: "Cross into the Schengen area on a biometric passport — no visa or pre-registration needed.",
          },
          {
            title: "Find somewhere to stay and register",
            body: "Arrange accommodation privately or via a municipality, and complete the Anmeldung at the Bürgeramt.",
          },
          {
            title: "Apply for temporary protection",
            body: "Apply for the §24 residence permit at the Ausländerbehörde; it grants the immediate right to live, work, and study.",
          },
          {
            title: "Set up benefits and healthcare",
            body: "Register at the Jobcenter for support if you need it, and get assigned public health insurance.",
          },
        ],
      },
      reviewStatus: "needs_review",
      confidence: "low",
      applicableTo: [UKR],
    },

    // --- Portugal ----------------------------------------------------------
    {
      key: "pt-d7",
      destination: "PT",
      type: "long_stay",
      title: "D7 Passive Income Visa",
      summary: "Residence for people with stable passive income such as pensions or rentals.",
      costMin: 75,
      costMax: 90,
      costCurrency: "EUR",
      timelineMinMonths: 3,
      timelineMaxMonths: 6,
      workPermission: "full",
      familyInclusion: true,
      pathToPermanentResidence: "direct",
      pathToPermanentResidenceNote: "Counts toward PR and citizenship after five years.",
      renewable: true,
      details: {
        requirementGroups: [
          {
            title: "Core requirements",
            items: [
              "Proof of stable passive income",
              "Portuguese address",
              "Clean criminal record",
            ],
          },
        ],
        caveats: ["Demo data — minimum income references the national minimum wage."],
      },
      reviewStatus: "reviewed",
      confidence: "medium",
      applicableTo: BOTH,
      sources: [
        {
          type: "official",
          label: "Portugal immigration portal",
          url: "https://imigrante.sef.pt/en/",
          lastReviewedAt: new Date("2026-01-10T00:00:00Z"),
        },
      ],
    },
    {
      key: "pt-digital-nomad",
      destination: "PT",
      type: "digital_nomad",
      title: "Digital Nomad Visa",
      summary: "Residence for remote workers earning from outside Portugal.",
      costMin: 75,
      costMax: 180,
      costCurrency: "EUR",
      timelineMinMonths: 2,
      timelineMaxMonths: 4,
      workPermission: "limited",
      familyInclusion: true,
      familyInclusionNote: "Dependents can be included on the application.",
      pathToPermanentResidence: "eventual",
      renewable: true,
      details: {
        requirementGroups: [
          {
            title: "Core requirements",
            items: [
              "Remote employment or clients abroad",
              "Income above the required multiple of minimum wage",
            ],
          },
        ],
        caveats: ["Demo data."],
      },
      applicableTo: BOTH,
    },
    {
      key: "pt-d2-entrepreneur",
      destination: "PT",
      type: "business",
      title: "D2 Entrepreneur Visa",
      summary: "Residence for entrepreneurs starting or relocating a business to Portugal.",
      costMin: 90,
      costMax: 90,
      costCurrency: "EUR",
      timelineMinMonths: 3,
      timelineMaxMonths: 6,
      workPermission: "full",
      familyInclusion: true,
      pathToPermanentResidence: "eventual",
      renewable: true,
      details: {
        requirementGroups: [
          {
            title: "Core requirements",
            items: ["Business plan", "Proof of investment or company setup", "Sufficient funds"],
          },
        ],
        caveats: ["Demo data."],
      },
      applicableTo: BOTH,
    },
    {
      key: "pt-tech-visa",
      destination: "PT",
      type: "work",
      title: "Tech Visa",
      summary: "Streamlined work route for hires at certified Portuguese tech companies.",
      costMin: 90,
      costMax: 90,
      costCurrency: "EUR",
      timelineMinMonths: 1,
      timelineMaxMonths: 3,
      workPermission: "full",
      familyInclusion: true,
      pathToPermanentResidence: "eventual",
      renewable: true,
      details: {
        requirementGroups: [
          {
            title: "Core requirements",
            items: ["Job offer from a certified company", "Relevant qualifications or experience"],
          },
        ],
        caveats: ["Demo data."],
      },
      applicableTo: BOTH,
    },
    {
      key: "pt-temporary-protection",
      destination: "PT",
      type: "humanitarian",
      title: "Temporary Protection",
      summary: "Immediate residence and work rights under the EU temporary protection scheme.",
      costMin: 0,
      costMax: 0,
      costCurrency: "EUR",
      timelineMinMonths: 0,
      timelineMaxMonths: 1,
      workPermission: "full",
      familyInclusion: true,
      pathToPermanentResidence: "none",
      renewable: true,
      details: {
        caveats: ["Demo data — scope and duration are set EU-wide and change over time."],
      },
      reviewStatus: "needs_review",
      confidence: "low",
      applicableTo: [UKR],
    },

    // --- Spain -------------------------------------------------------------
    {
      key: "es-non-lucrative",
      destination: "ES",
      type: "long_stay",
      title: "Non-Lucrative Visa",
      summary: "Residence for people with sufficient savings or income who will not work locally.",
      costMin: 80,
      costMax: 80,
      costCurrency: "EUR",
      timelineMinMonths: 1,
      timelineMaxMonths: 3,
      workPermission: "none",
      familyInclusion: true,
      pathToPermanentResidence: "eventual",
      pathToPermanentResidenceNote: "Long-term residence after five years of legal stay.",
      renewable: true,
      details: {
        requirementGroups: [
          {
            title: "Core requirements",
            items: [
              "Proof of sufficient funds",
              "Private health insurance",
              "Clean criminal record",
            ],
          },
        ],
        caveats: ["Demo data — local employment is not permitted on this visa."],
      },
      applicableTo: BOTH,
    },
    {
      key: "es-digital-nomad",
      destination: "ES",
      type: "digital_nomad",
      title: "Digital Nomad Visa",
      summary: "Residence for remote workers and freelancers serving mostly non-Spanish clients.",
      costMin: 80,
      costMax: 80,
      costCurrency: "EUR",
      timelineMinMonths: 1,
      timelineMaxMonths: 3,
      workPermission: "limited",
      familyInclusion: true,
      pathToPermanentResidence: "eventual",
      renewable: true,
      details: {
        requirementGroups: [
          {
            title: "Core requirements",
            items: ["Remote work for companies outside Spain", "Minimum income threshold"],
          },
        ],
        caveats: ["Demo data."],
      },
      applicableTo: BOTH,
    },
    {
      key: "es-self-employed",
      destination: "ES",
      type: "freelance",
      title: "Self-Employed (Cuenta Propia) Visa",
      summary: "Residence to run your own professional activity or business in Spain.",
      costMin: 80,
      costMax: 80,
      costCurrency: "EUR",
      timelineMinMonths: 2,
      timelineMaxMonths: 4,
      workPermission: "full",
      familyInclusion: true,
      pathToPermanentResidence: "eventual",
      renewable: true,
      details: {
        requirementGroups: [
          {
            title: "Core requirements",
            items: ["Business plan", "Proof of qualifications and funds", "Required licenses"],
          },
        ],
        caveats: ["Demo data."],
      },
      applicableTo: BOTH,
    },
    {
      key: "es-student",
      destination: "ES",
      type: "study",
      title: "Student Visa",
      summary: "Residence to study at a recognized Spanish institution.",
      costMin: 80,
      costMax: 80,
      costCurrency: "EUR",
      timelineMinMonths: 1,
      timelineMaxMonths: 2,
      workPermission: "limited",
      familyInclusion: false,
      pathToPermanentResidence: "eventual",
      pathToPermanentResidenceNote: "Study time partly counts toward later residence applications.",
      renewable: true,
      details: {
        requirementGroups: [
          {
            title: "Core requirements",
            items: ["Admission letter", "Proof of funds", "Health insurance"],
          },
        ],
        caveats: ["Demo data."],
      },
      applicableTo: BOTH,
    },
    {
      key: "es-temporary-protection",
      destination: "ES",
      type: "humanitarian",
      title: "Temporary Protection",
      summary: "Immediate residence and work rights under the EU temporary protection scheme.",
      costMin: 0,
      costMax: 0,
      costCurrency: "EUR",
      timelineMinMonths: 0,
      timelineMaxMonths: 1,
      workPermission: "full",
      familyInclusion: true,
      pathToPermanentResidence: "none",
      renewable: true,
      details: {
        caveats: ["Demo data — scope and duration are set EU-wide and change over time."],
      },
      reviewStatus: "needs_review",
      confidence: "low",
      applicableTo: [UKR],
    },
  ],
  arrivalContext: [
    {
      citizenship: USA,
      destination: "DE",
      visaFreeDays: 90,
      summary:
        "US citizens can enter the Schengen area visa-free for up to 90 days in any 180-day period.",
      profile: germanyPairings["USA/DE"],
      confidence: "medium",
    },
    {
      citizenship: USA,
      destination: "PT",
      visaFreeDays: 90,
      summary:
        "US citizens can enter the Schengen area visa-free for up to 90 days in any 180-day period.",
      confidence: "medium",
    },
    {
      citizenship: USA,
      destination: "ES",
      visaFreeDays: 90,
      summary:
        "US citizens can enter the Schengen area visa-free for up to 90 days in any 180-day period.",
      confidence: "medium",
    },
    {
      citizenship: UKR,
      destination: "DE",
      visaFreeDays: 90,
      summary:
        "Ukrainian biometric-passport holders can enter the Schengen area visa-free for up to 90 days in any 180-day period.",
      profile: germanyPairings["UKR/DE"],
      confidence: "medium",
    },
    {
      citizenship: UKR,
      destination: "PT",
      visaFreeDays: 90,
      summary:
        "Ukrainian biometric-passport holders can enter the Schengen area visa-free for up to 90 days in any 180-day period.",
      confidence: "medium",
    },
    {
      citizenship: UKR,
      destination: "ES",
      visaFreeDays: 90,
      summary:
        "Ukrainian biometric-passport holders can enter the Schengen area visa-free for up to 90 days in any 180-day period.",
      confidence: "medium",
    },
  ],
};
