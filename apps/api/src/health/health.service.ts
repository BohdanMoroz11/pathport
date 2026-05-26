import { Inject, Injectable } from "@nestjs/common";
import type { HealthResponse } from "@pathport/contracts";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class HealthService {
  constructor(@Inject(DatabaseService) private readonly databaseService: DatabaseService) {}

  health(): HealthResponse {
    return {
      ok: true,
      service: "api",
    };
  }

  async ready(): Promise<HealthResponse> {
    await this.databaseService.assertReady();

    return {
      ok: true,
      service: "api",
    };
  }
}
