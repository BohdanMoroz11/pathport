import { Controller, Get, Inject, Param } from "@nestjs/common";
import type { DestinationSummary } from "@pathport/contracts";
import { DestinationsService } from "./destinations.service";

@Controller("citizenships/:citizenshipCode/destinations")
export class DestinationsController {
  constructor(@Inject(DestinationsService) private readonly destinations: DestinationsService) {}

  @Get()
  list(@Param("citizenshipCode") citizenshipCode: string): Promise<DestinationSummary[]> {
    return this.destinations.listForCitizenship(citizenshipCode);
  }
}
