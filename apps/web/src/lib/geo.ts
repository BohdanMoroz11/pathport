/**
 * Approximate country centroids (lat, lon) for placing destination pins on the
 * stylized world map. Kept as a small lookup rather than a data dependency; add
 * a row when a new destination lands. Codes are the 2-letter destination codes.
 */
export const COUNTRY_COORDS: Record<string, { lat: number; lon: number }> = {
  DE: { lat: 51.2, lon: 10.4 },
  PT: { lat: 39.5, lon: -8.0 },
  ES: { lat: 40.2, lon: -3.7 },
  FR: { lat: 46.6, lon: 2.4 },
  IT: { lat: 42.8, lon: 12.8 },
  NL: { lat: 52.3, lon: 5.6 },
  IE: { lat: 53.2, lon: -8.0 },
  PL: { lat: 52.1, lon: 19.4 },
  SE: { lat: 62.0, lon: 15.0 },
  GR: { lat: 39.1, lon: 22.9 },
  CA: { lat: 56.1, lon: -106.3 },
  US: { lat: 39.8, lon: -98.6 },
  AU: { lat: -25.3, lon: 133.8 },
  NZ: { lat: -41.0, lon: 174.0 },
  JP: { lat: 36.2, lon: 138.3 },
  AE: { lat: 24.0, lon: 54.0 },
  // Citizenship (origin) codes are 3-letter; map them to their centroids too.
  USA: { lat: 39.8, lon: -98.6 },
  UKR: { lat: 49.0, lon: 31.2 },
};

/**
 * ISO 3166-1 **numeric** ids, exactly as the world-atlas topojson keys its
 * countries (zero-padded strings, e.g. Australia is `036`). Used to light up a
 * reachable country on the real vector map. Keyed by the 2-letter destination
 * code and the 3-letter citizenship code alike; extend alongside
 * `COUNTRY_COORDS` when a new country lands.
 */
export const ISO_NUMERIC: Record<string, string> = {
  DE: "276",
  PT: "620",
  ES: "724",
  FR: "250",
  IT: "380",
  NL: "528",
  IE: "372",
  PL: "616",
  SE: "752",
  GR: "300",
  CA: "124",
  US: "840",
  AU: "036",
  NZ: "554",
  JP: "392",
  AE: "784",
  GB: "826",
  UA: "804",
  // 3-letter citizenship (origin) codes resolve to the same ids.
  USA: "840",
  UKR: "804",
  GBR: "826",
  DEU: "276",
};

/** Numeric ISO id for a 2- or 3-letter code, or null when it isn't mapped yet. */
export function numericIdFor(code: string): string | null {
  return ISO_NUMERIC[code.toUpperCase()] ?? null;
}

/**
 * Equirectangular projection to percentage coordinates over a 2:1 map box, so a
 * pin can be absolutely positioned with CSS `left`/`top`.
 */
export function projectToPercent(lat: number, lon: number): { x: number; y: number } {
  return { x: ((lon + 180) / 360) * 100, y: ((90 - lat) / 180) * 100 };
}

/** Coordinates for a destination code, or null when it isn't mapped yet. */
export function coordsFor(code: string): { lat: number; lon: number } | null {
  return COUNTRY_COORDS[code.toUpperCase()] ?? null;
}
