import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ArrivalContext, DestinationSummary } from "@pathport/contracts";
import {
  arrivalContext,
  citizenships,
  destinationCountries,
  routeApplicability,
  routes,
} from "@pathport/db";
import { and, asc, countDistinct, eq } from "drizzle-orm";
import { DatabaseService } from "../database/database.service";

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
        routeCount: countDistinct(routes.id),
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
      .groupBy(destinationCountries.id, destinationCountries.code, destinationCountries.name)
      .orderBy(asc(destinationCountries.name));

    const contexts = await this.arrivalContextsByDestination(citizenshipId);

    return destinations.map((destination) => ({
      code: destination.code,
      name: destination.name,
      routeCount: destination.routeCount,
      arrivalContext: contexts.get(destination.code) ?? null,
    }));
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
