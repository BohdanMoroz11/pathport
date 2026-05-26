import { Test } from "@nestjs/testing";
import { describe, expect, it } from "vitest";
import { DatabaseService } from "../database/database.service";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";

describe("HealthController", () => {
  it("returns health status from the service", async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: DatabaseService,
          useValue: {
            assertReady: async () => undefined,
          },
        },
      ],
    }).compile();

    const controller = moduleRef.get(HealthController);

    expect(controller.health()).toEqual({
      ok: true,
      service: "api",
    });
  });
});
