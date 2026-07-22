import { parseDestinationDetail, parseDestinationPairing } from "@pathport/contracts";
import type { DatabaseClient } from "../client.js";
import {
  arrivalSummaryTargetPath,
  destinationTargetPath,
  pairingTargetPath,
  routeApplicabilityTargetPath,
  routeTargetPath,
  splitDestinationDetailIntoBlocks,
  splitDestinationPairingIntoBlocks,
} from "../content-blocks.js";
import { parseRouteDetails } from "../route-details.js";
import {
  citizenships,
  contentCitations,
  destinationContentBlocks,
  destinationCountries,
  routeApplicability,
  routes,
  sourceDocuments,
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
        .values({ code: citizenship.code, name: citizenship.name, flag: citizenship.flag })
        .returning(),
    );
    citizenshipIds.set(citizenship.code, row.id);
  }

  const destinationIds = new Map<string, string>();
  for (const destination of data.destinations) {
    const profile = destination.profile ? parseDestinationDetail(destination.profile) : {};
    const row = insertedRow(
      await db
        .insert(destinationCountries)
        .values({
          code: destination.code,
          name: destination.name,
          flag: destination.flag,
          tagline: destination.tagline,
          region: destination.region,
          description: destination.description,
          isDemo: true,
        })
        .returning(),
    );
    destinationIds.set(destination.code, row.id);

    const blocks = splitDestinationDetailIntoBlocks(profile);
    if (blocks.length > 0) {
      await db.insert(destinationContentBlocks).values(
        blocks.map((block) => ({
          destinationCountryId: row.id,
          sectionKey: block.sectionKey,
          blockKey: block.blockKey,
          scope: block.scope,
          assumptions: block.assumptions ?? {},
          content: block.content,
          targetPath: destinationTargetPath(destination.code, block.blockKey),
          reviewStatus: destination.reviewStatus ?? "needs_review",
          confidence: destination.confidence ?? "low",
          isDemo: true,
        })),
      );
    }
  }

  for (const route of data.routes) {
    const destinationCountryId = destinationIds.get(route.destination);
    if (!destinationCountryId) {
      throw new Error(
        `Route "${route.key}" references unknown destination "${route.destination}".`,
      );
    }

    const details = parseRouteDetails(route.details);
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
          details,
          reviewStatus: route.reviewStatus ?? "needs_review",
          confidence: route.confidence ?? "low",
          isDemo: true,
        })
        .returning(),
    );

    await db.insert(destinationContentBlocks).values({
      destinationCountryId,
      sectionKey: "routes",
      blockKey: route.key,
      scope: "route",
      routeId: row.id,
      content: details,
      targetPath: routeTargetPath(route.destination, route.key),
      reviewStatus: route.reviewStatus ?? "needs_review",
      confidence: route.confidence ?? "low",
      isDemo: true,
    });

    for (const code of route.applicableTo) {
      const citizenshipId = citizenshipIds.get(code);
      if (!citizenshipId) {
        throw new Error(`Route "${route.key}" references unknown citizenship "${code}".`);
      }
      await db.insert(routeApplicability).values({
        routeId: row.id,
        citizenshipId,
        reviewStatus: route.reviewStatus ?? "needs_review",
        confidence: route.confidence ?? "low",
        isDemo: true,
      });
      await db.insert(destinationContentBlocks).values({
        destinationCountryId,
        sectionKey: "routes",
        blockKey: "applicability",
        scope: "route_citizenship",
        citizenshipId,
        routeId: row.id,
        content: { note: null },
        targetPath: routeApplicabilityTargetPath(code, route.destination, route.key),
        reviewStatus: route.reviewStatus ?? "needs_review",
        confidence: route.confidence ?? "low",
        isDemo: true,
      });
    }

    if (route.sources?.length) {
      const documents = await db
        .insert(sourceDocuments)
        .values(
          route.sources.map((source) => ({
            type: source.type,
            label: source.label,
            url: source.url,
            lastReviewedAt: source.lastReviewedAt,
          })),
        )
        .onConflictDoNothing({ target: sourceDocuments.url })
        .returning();

      if (documents.length > 0) {
        await db.insert(contentCitations).values(
          documents.map((source) => ({
            sourceDocumentId: source.id,
            targetType: "route" as const,
            targetId: row.id,
            fieldPath: "details",
          })),
        );
      }
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

    const profile = context.profile ? parseDestinationPairing(context.profile) : {};
    await db.insert(destinationContentBlocks).values({
      destinationCountryId,
      citizenshipId,
      sectionKey: "overview",
      blockKey: "arrivalSummary",
      scope: "citizenship_destination",
      content: { visaFreeDays: context.visaFreeDays, summary: context.summary },
      targetPath: arrivalSummaryTargetPath(context.citizenship, context.destination),
      reviewStatus: context.reviewStatus ?? "needs_review",
      confidence: context.confidence ?? "low",
      isDemo: true,
    });

    const blocks = splitDestinationPairingIntoBlocks(profile);
    if (blocks.length > 0) {
      await db.insert(destinationContentBlocks).values(
        blocks.map((block) => ({
          destinationCountryId,
          citizenshipId,
          sectionKey: block.sectionKey,
          blockKey: block.blockKey,
          scope: block.scope,
          content: block.content,
          targetPath: pairingTargetPath(context.citizenship, context.destination, block.blockKey),
          reviewStatus: context.reviewStatus ?? "needs_review",
          confidence: context.confidence ?? "low",
          isDemo: true,
        })),
      );
    }
  }
}
