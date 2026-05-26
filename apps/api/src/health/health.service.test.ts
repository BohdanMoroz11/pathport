import { describe, expect, it } from "vitest";
import { HealthService } from "./health.service";

describe("HealthService", () => {
  const databaseService = {
    assertReady: async () => undefined,
  } as never;

  it("returns health status", () => {
    const service = new HealthService(databaseService);

    expect(service.health()).toEqual({
      ok: true,
      service: "api",
    });
  });

  it("returns readiness status", async () => {
    const service = new HealthService(databaseService);

    await expect(service.ready()).resolves.toEqual({
      ok: true,
      service: "api",
    });
  });
});
