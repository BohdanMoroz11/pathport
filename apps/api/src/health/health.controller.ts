import { Controller, Get, Inject } from "@nestjs/common";
import type { HealthResponse } from "@pathport/contracts";
import { HealthService } from "./health.service";

@Controller()
export class HealthController {
  constructor(@Inject(HealthService) private readonly healthService: HealthService) {}

  @Get("health")
  health(): HealthResponse {
    return this.healthService.health();
  }

  @Get("ready")
  ready(): Promise<HealthResponse> {
    return this.healthService.ready();
  }
}
