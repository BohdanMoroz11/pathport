import { Controller, Get, Inject } from "@nestjs/common";
import type { Citizenship } from "@pathport/contracts";
import { CitizenshipsService } from "./citizenships.service";

@Controller("citizenships")
export class CitizenshipsController {
  constructor(@Inject(CitizenshipsService) private readonly citizenships: CitizenshipsService) {}

  @Get()
  list(): Promise<Citizenship[]> {
    return this.citizenships.list();
  }
}
