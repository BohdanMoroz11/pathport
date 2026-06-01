import { Controller, Get, Inject, Param, ParseUUIDPipe } from "@nestjs/common";
import type { RouteDetail, RouteSummary } from "@pathport/contracts";
import { RoutesService } from "./routes.service";

/** Route summaries for the citizenship-first drill-down into one destination. */
@Controller("citizenships/:citizenshipCode/destinations/:destinationCode/routes")
export class DestinationRoutesController {
  constructor(@Inject(RoutesService) private readonly routes: RoutesService) {}

  @Get()
  list(
    @Param("citizenshipCode") citizenshipCode: string,
    @Param("destinationCode") destinationCode: string,
  ): Promise<RouteSummary[]> {
    return this.routes.listForCitizenshipAndDestination(citizenshipCode, destinationCode);
  }
}

/** A single route's full detail page, addressable on its own. */
@Controller("routes")
export class RoutesController {
  constructor(@Inject(RoutesService) private readonly routes: RoutesService) {}

  @Get(":id")
  detail(@Param("id", ParseUUIDPipe) id: string): Promise<RouteDetail> {
    return this.routes.getDetail(id);
  }
}
