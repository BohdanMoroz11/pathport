import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { RouteDetail, RouteSummary } from "@pathport/contracts";
import {
  citizenships,
  destinationCountries,
  routeApplicability,
  routeSources,
  routes,
} from "@pathport/db";
import { and, asc, eq } from "drizzle-orm";
import { DatabaseService } from "../database/database.service";
import { toRouteDetail, toRouteSummary } from "./route.mapper";

@Injectable()
export class RoutesService {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  /**
   * Route summaries for one destination that apply to the given citizenship.
   * The applicability join is what makes two citizenships see different routes.
   * Ordered by type then title so the cards group predictably.
   */
  async listForCitizenshipAndDestination(
    citizenshipCode: string,
    destinationCode: string,
  ): Promise<RouteSummary[]> {
    const citizenshipId = await this.requireCitizenshipId(citizenshipCode);
    const destinationId = await this.requireDestinationId(destinationCode);

    const rows = await this.database.client
      .select({ route: routes })
      .from(routes)
      .innerJoin(
        routeApplicability,
        and(
          eq(routeApplicability.routeId, routes.id),
          eq(routeApplicability.citizenshipId, citizenshipId),
        ),
      )
      .where(eq(routes.destinationCountryId, destinationId))
      .orderBy(asc(routes.type), asc(routes.title));

    return rows.map((row) => toRouteSummary(row.route));
  }

  /** Full detail for a single route, including its destination and sources. */
  async getDetail(id: string): Promise<RouteDetail> {
    const [row] = await this.database.client
      .select({
        route: routes,
        destinationCode: destinationCountries.code,
        destinationName: destinationCountries.name,
      })
      .from(routes)
      .innerJoin(destinationCountries, eq(destinationCountries.id, routes.destinationCountryId))
      .where(eq(routes.id, id))
      .limit(1);

    if (!row) {
      throw new NotFoundException(`Unknown route "${id}".`);
    }

    const sources = await this.database.client
      .select()
      .from(routeSources)
      .where(eq(routeSources.routeId, id))
      .orderBy(asc(routeSources.label));

    return toRouteDetail(
      row.route,
      { code: row.destinationCode, name: row.destinationName },
      sources,
    );
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

  private async requireDestinationId(destinationCode: string): Promise<string> {
    const [destination] = await this.database.client
      .select({ id: destinationCountries.id })
      .from(destinationCountries)
      .where(eq(destinationCountries.code, destinationCode.toUpperCase()))
      .limit(1);

    if (!destination) {
      throw new NotFoundException(`Unknown destination "${destinationCode}".`);
    }

    return destination.id;
  }
}
