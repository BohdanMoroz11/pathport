import type { DatabaseClient } from "../client.js";
import { parseRouteDetails } from "../route-details.js";
import {
  arrivalContext,
  citizenships,
  destinationCountries,
  routeApplicability,
  routeSources,
  routes,
} from "../schema.js";
import { demoSeedData, type SeedData } from "./data.js";

/** Return the single row a `.returning()` insert is expected to produce. */
function insertedRow<T>(rows: T[]): T {
  const [row] = rows;
  if (!row) {
    throw new Error("Expected an inserted row but the insert returned none.");
  }
  return row;
}

/**
 * Insert demo data into an empty schema. Resolves the human-readable codes/keys
 * in {@link SeedData} to generated UUIDs as it goes.
 *
 * Assumes a clean schema (the seed runner and tests call `resetSchema` first).
 * Every record is marked `is_demo` here so callers cannot forget to.
 */
export async function seedDatabase(
  db: DatabaseClient,
  data: SeedData = demoSeedData,
): Promise<void> {
  const citizenshipIds = new Map<string, string>();
  for (const citizenship of data.citizenships) {
    const row = insertedRow(
      await db
        .insert(citizenships)
        .values({ code: citizenship.code, name: citizenship.name })
        .returning(),
    );
    citizenshipIds.set(citizenship.code, row.id);
  }

  const destinationIds = new Map<string, string>();
  for (const destination of data.destinations) {
    const row = insertedRow(
      await db
        .insert(destinationCountries)
        .values({ code: destination.code, name: destination.name })
        .returning(),
    );
    destinationIds.set(destination.code, row.id);
  }

  for (const route of data.routes) {
    const destinationCountryId = destinationIds.get(route.destination);
    if (!destinationCountryId) {
      throw new Error(
        `Route "${route.key}" references unknown destination "${route.destination}".`,
      );
    }

    const row = insertedRow(
      await db
        .insert(routes)
        .values({
          destinationCountryId,
          type: route.type,
          title: route.title,
          summary: route.summary,
          costMin: route.costMin,
          costMax: route.costMax,
          costCurrency: route.costCurrency,
          timelineMinMonths: route.timelineMinMonths,
          timelineMaxMonths: route.timelineMaxMonths,
          workPermission: route.workPermission,
          familyInclusion: route.familyInclusion,
          familyInclusionNote: route.familyInclusionNote,
          pathToPermanentResidence: route.pathToPermanentResidence,
          pathToPermanentResidenceNote: route.pathToPermanentResidenceNote,
          renewable: route.renewable,
          renewableNote: route.renewableNote,
          // Validate on write so no malformed detail blob can reach the column.
          details: parseRouteDetails(route.details),
          reviewStatus: route.reviewStatus ?? "needs_review",
          confidence: route.confidence ?? "low",
          isDemo: true,
        })
        .returning(),
    );

    for (const code of route.applicableTo) {
      const citizenshipId = citizenshipIds.get(code);
      if (!citizenshipId) {
        throw new Error(`Route "${route.key}" references unknown citizenship "${code}".`);
      }
      await db.insert(routeApplicability).values({ routeId: row.id, citizenshipId });
    }

    if (route.sources?.length) {
      await db.insert(routeSources).values(
        route.sources.map((source) => ({
          routeId: row.id,
          type: source.type,
          label: source.label,
          url: source.url,
          lastReviewedAt: source.lastReviewedAt,
        })),
      );
    }
  }

  for (const context of data.arrivalContext) {
    const citizenshipId = citizenshipIds.get(context.citizenship);
    const destinationCountryId = destinationIds.get(context.destination);
    if (!citizenshipId || !destinationCountryId) {
      throw new Error(
        `Arrival context references unknown pair "${context.citizenship}" x "${context.destination}".`,
      );
    }
    await db.insert(arrivalContext).values({
      citizenshipId,
      destinationCountryId,
      visaFreeDays: context.visaFreeDays,
      summary: context.summary,
      reviewStatus: context.reviewStatus ?? "needs_review",
      confidence: context.confidence ?? "low",
      isDemo: true,
    });
  }
}
