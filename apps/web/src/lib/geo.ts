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
