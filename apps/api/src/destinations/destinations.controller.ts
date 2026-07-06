import { Controller, Get, Inject, Param } from "@nestjs/common";
import type { DestinationProfile, DestinationSummary } from "@pathport/contracts";
import { CountryCodePipe } from "../common/country-code.pipe";
import { DestinationsService } from "./destinations.service";

@Controller("citizenships/:citizenshipCode/destinations")
export class DestinationsController {
  constructor(@Inject(DestinationsService) private readonly destinations: DestinationsService) {}

  @Get()
  list(
    @Param("citizenshipCode", CountryCodePipe) citizenshipCode: string,
  ): Promise<DestinationSummary[]> {
    return this.destinations.listForCitizenship(citizenshipCode);
  }

  /** The full destination shell (Overview + deep sections) for one pairing. */
  @Get(":destinationCode/profile")
  profile(
    @Param("citizenshipCode", CountryCodePipe) citizenshipCode: string,
    @Param("destinationCode", CountryCodePipe) destinationCode: string,
  ): Promise<DestinationProfile> {
    return this.destinations.getProfile(citizenshipCode, destinationCode);
  }
}
