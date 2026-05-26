import { Injectable } from "@nestjs/common";
import type { HealthResponse } from "@pathport/contracts";

@Injectable()
export class HealthService {
  health(): HealthResponse {
    return {
      ok: true,
      service: "api",
    };
  }

  ready(): HealthResponse {
    return {
      ok: true,
      service: "api",
    };
  }
}
