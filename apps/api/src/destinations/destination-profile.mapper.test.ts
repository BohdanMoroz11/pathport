import { describe, expect, it } from "vitest";
import { type DestinationProfileRows, toDestinationProfile } from "./destination-profile.mapper";

const citizenship = { code: "USA", name: "United States", flag: "🇺🇸" };

const destinationBase = {
  code: "DE",
  name: "Germany",
  flag: "🇩🇪",
  tagline: "Western Europe · EU",
  region: "Western Europe",
  description: "The EU's largest economy.",
};

/** A minimal but valid destination-level profile with one section authored. */
const countryProfile = {
  quickFacts: [{ label: "Capital", value: "Berlin" }],
  country: {
    geography: {
      location: "Central Europe.",
      borders: ["Poland"],
      stats: [],
      cities: [],
      images: [],
      climate: { summary: "Temperate.", stability: "Predictable.", seasons: [] },
    },
    people: { summary: "84M people.", stats: [], ageBands: [], religions: [] },
    economy: { summary: "Industrial.", stats: [], trends: [] },
    government: {
      summary: "Federal republic.",
      system: "Parliamentary",
      memberships: ["EU"],
      stats: [],
      parties: [],
      currentGovernment: "Coalition.",
      nextElection: "2029",
      timeline: [],
    },
    culture: { summary: "Orderly.", notes: [] },
    safety: {
      summary: "Safe.",
      stats: [],
      trend: { direction: "stable" as const, note: "Steady." },
      regional: { summary: "Even.", areas: [] },
    },
    rights: { lgbtq: "Strong.", minorities: "Protected." },
  },
};

const authoredLanguage = {
  official: ["German"],
  difficulty: {
    label: "Moderate",
    rating: { score: 3, max: 5, tone: "warn" as const },
    note: "Related to English.",
  },
  english: "Widely spoken in cities.",
};

describe("toDestinationProfile", () => {
  it("assembles identity, folds the pairing language into the country facts", () => {
    const rows: DestinationProfileRows = {
      citizenship,
      destination: { ...destinationBase, profile: countryProfile },
      pairing: {
        profile: {
          language: authoredLanguage,
          entry: { summary: "Visa-free.", facts: [] },
          glance: [{ label: "Routes available", value: "6", section: "routes" }],
          fitsYouIf: [{ text: "You have a job offer", match: "yes" }],
        },
      },
    };

    const profile = toDestinationProfile(rows);

    expect(profile.citizenship).toEqual(citizenship);
    expect(profile.destination.tagline).toBe("Western Europe · EU");
    expect(profile.quickFacts).toEqual([{ label: "Capital", value: "Berlin" }]);
    // The reader's language read is pairing-level but surfaces under `country`.
    expect(profile.country?.language).toEqual(authoredLanguage);
    expect(profile.glance).toHaveLength(1);
    expect(profile.entry.summary).toBe("Visa-free.");
  });

  it("degrades to the 'being gathered' stub when no pairing is authored", () => {
    const rows: DestinationProfileRows = {
      citizenship,
      destination: { ...destinationBase, profile: countryProfile },
      pairing: null,
    };

    const profile = toDestinationProfile(rows);

    // A known destination still resolves; reader-specific reads stub out.
    expect(profile.entry.summary).toMatch(/being gathered/i);
    expect(profile.country?.language.difficulty.label).toBe("Being gathered");
    expect(profile.glance.length).toBeGreaterThan(0);
    expect(profile.fitsYouIf.every((f) => f.match === "maybe")).toBe(true);
  });

  it("omits sections the destination has not authored, and coerces null identity", () => {
    const rows: DestinationProfileRows = {
      citizenship: { code: "UKR", name: "Ukraine", flag: null },
      destination: {
        code: "PT",
        name: "Portugal",
        flag: null,
        tagline: null,
        region: null,
        description: null,
        profile: {},
      },
      pairing: null,
    };

    const profile = toDestinationProfile(rows);

    expect(profile.citizenship.flag).toBe("");
    expect(profile.destination.description).toBe("");
    expect(profile.country).toBeUndefined();
    expect(profile.living).toBeUndefined();
    expect(profile.quickFacts).toEqual([]);
  });
});
