import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type {
  ArrivalContext,
  DestinationProfile,
  DestinationSummary,
  RouteType,
} from "@pathport/contracts";
import {
  arrivalContext,
  citizenships,
  destinationCountries,
  routeApplicability,
  routes,
} from "@pathport/db";
import { and, asc, countDistinct, eq, min, sql } from "drizzle-orm";
import { DatabaseService } from "../database/database.service";
import { toDestinationProfile } from "./destination-profile.mapper";

@Injectable()
export class DestinationsService {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  /**
   * Destinations reachable by the given citizenship: any destination with at
   * least one applicable route, with its applicable-route count and the
   * arrival context for this citizenship × destination pair.
   */
  async listForCitizenship(citizenshipCode: string): Promise<DestinationSummary[]> {
    const citizenshipId = await this.requireCitizenshipId(citizenshipCode);

    const destinations = await this.database.client
      .select({
        code: destinationCountries.code,
        name: destinationCountries.name,
        flag: destinationCountries.flag,
        region: destinationCountries.region,
        tagline: destinationCountries.tagline,
        routeCount: countDistinct(routes.id),
        // Distinct route types available to this citizenship, and the cheapest /
        // fastest applicable route — the comparison aggregates the explore page
        // filters and lines up. NULLs (routes without cost/timeline) are ignored
        // by MIN; currency is paired loosely (demo uses one currency per country).
        // Cast the enum to text inside the aggregate: node-postgres parses a
        // text[] (OID 1009) into a real array, but leaves a custom-enum[] as its
        // raw `{a,b}` string.
        routeTypes: sql<RouteType[]>`array_agg(distinct ${routes.type}::text)`,
        startingCostAmount: min(routes.costMin),
        startingCostCurrency: min(routes.costCurrency),
        fastestMonths: min(routes.timelineMinMonths),
      })
      .from(destinationCountries)
      .innerJoin(routes, eq(routes.destinationCountryId, destinationCountries.id))
      .innerJoin(
        routeApplicability,
        and(
          eq(routeApplicability.routeId, routes.id),
          eq(routeApplicability.citizenshipId, citizenshipId),
        ),
      )
      .groupBy(
        destinationCountries.id,
        destinationCountries.code,
        destinationCountries.name,
        destinationCountries.flag,
        destinationCountries.region,
        destinationCountries.tagline,
      )
      .orderBy(asc(destinationCountries.name));

    const contexts = await this.arrivalContextsByDestination(citizenshipId);

    return destinations.map((destination) => {
      // node-postgres returns COUNT/MIN as strings; coerce so the contract's
      // numbers are honest rather than a lie the type system can't see.
      const startingCostAmount =
        destination.startingCostAmount === null ? null : Number(destination.startingCostAmount);
      return {
        code: destination.code,
        name: destination.name,
        flag: destination.flag,
        region: destination.region,
        tagline: destination.tagline,
        routeCount: Number(destination.routeCount),
        // array_agg has no ordering guarantee; sort so the chips/filters are stable.
        routeTypes: [...destination.routeTypes].sort(),
        startingCost:
          startingCostAmount === null || destination.startingCostCurrency === null
            ? null
            : { amount: startingCostAmount, currency: destination.startingCostCurrency },
        fastestMonths:
          destination.fastestMonths === null ? null : Number(destination.fastestMonths),
        arrivalContext: contexts.get(destination.code) ?? null,
      };
    });
  }

  /**
   * The full destination shell for a citizenship × destination: identity plus
   * the destination-level sections and the reader-specific pairing content,
   * assembled and validated by {@link toDestinationProfile}. 404s when either
   * code is unknown; a known pair with no authored pairing row still resolves
   * (the mapper degrades the reader-specific reads to a "being gathered" stub).
   */
  async getProfile(citizenshipCode: string, destinationCode: string): Promise<DestinationProfile> {
    const [citizenship] = await this.database.client
      .select({
        id: citizenships.id,
        code: citizenships.code,
        name: citizenships.name,
        flag: citizenships.flag,
      })
      .from(citizenships)
      .where(eq(citizenships.code, citizenshipCode.toUpperCase()))
      .limit(1);
    if (!citizenship) {
      throw new NotFoundException(`Unknown citizenship "${citizenshipCode}".`);
    }

    const [destination] = await this.database.client
      .select({
        id: destinationCountries.id,
        code: destinationCountries.code,
        name: destinationCountries.name,
        flag: destinationCountries.flag,
        tagline: destinationCountries.tagline,
        region: destinationCountries.region,
        description: destinationCountries.description,
        profile: destinationCountries.profile,
      })
      .from(destinationCountries)
      .where(eq(destinationCountries.code, destinationCode.toUpperCase()))
      .limit(1);
    if (!destination) {
      throw new NotFoundException(`Unknown destination "${destinationCode}".`);
    }

    const [pairing] = await this.database.client
      .select({ profile: arrivalContext.profile })
      .from(arrivalContext)
      .where(
        and(
          eq(arrivalContext.citizenshipId, citizenship.id),
          eq(arrivalContext.destinationCountryId, destination.id),
        ),
      )
      .limit(1);

    return toDestinationProfile({ citizenship, destination, pairing: pairing ?? null });
  }

  private async arrivalContextsByDestination(
    citizenshipId: string,
  ): Promise<Map<string, ArrivalContext>> {
    const rows = await this.database.client
      .select({
        destinationCode: destinationCountries.code,
        visaFreeDays: arrivalContext.visaFreeDays,
        summary: arrivalContext.summary,
        reviewStatus: arrivalContext.reviewStatus,
        confidence: arrivalContext.confidence,
        isDemo: arrivalContext.isDemo,
      })
      .from(arrivalContext)
      .innerJoin(
        destinationCountries,
        eq(destinationCountries.id, arrivalContext.destinationCountryId),
      )
      .where(eq(arrivalContext.citizenshipId, citizenshipId));

    return new Map(rows.map(({ destinationCode, ...context }) => [destinationCode, context]));
  }

  private async requireCitizenshipId(citizenshipCode: string): Promise<string> {
    const [citizenship] = await this.database.client
      .select({ id: citizenships.id })
      .from(citizenships)
      .where(eq(citizenships.code, citizenshipCode.toUpperCase()))
      .limit(1);

    if (!citizenship) {
      throw new NotFoundException(`Unknown citizenship "${citizenshipCode}".`);
    }

    return citizenship.id;
  }
}
