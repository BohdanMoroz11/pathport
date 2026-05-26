import { Controller, Get } from "@nestjs/common";
import type { HealthResponse } from "@pathport/contracts";
// biome-ignore lint/style/useImportType: NestJS dependency injection needs runtime constructor metadata.
import { HealthService } from "./health.service";

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get("health")
  health(): HealthResponse {
    return this.healthService.health();
  }

  @Get("ready")
  ready(): HealthResponse {
    return this.healthService.ready();
  }
}
