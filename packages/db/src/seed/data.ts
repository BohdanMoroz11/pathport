import type {
  confidenceEnum,
  pathToPrEnum,
  RouteDetails,
  reviewStatusEnum,
  routeTypeEnum,
  sourceTypeEnum,
  workPermissionEnum,
} from "../schema.js";

type EnumValue<T extends { enumValues: readonly string[] }> = T["enumValues"][number];

export type SeedCitizenship = { code: string; name: string };
export type SeedDestination = { code: string; name: string };

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
    { code: USA, name: "United States" },
    { code: UKR, name: "Ukraine" },
  ],
  destinations: [
    { code: "DE", name: "Germany" },
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
