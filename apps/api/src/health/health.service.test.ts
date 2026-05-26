import { describe, expect, it } from "vitest";
import { HealthService } from "./health.service";

describe("HealthService", () => {
  it("returns health status", () => {
    const service = new HealthService();

    expect(service.health()).toEqual({
      ok: true,
      service: "api",
    });
  });

  it("returns readiness status", () => {
    const service = new HealthService();

    expect(service.ready()).toEqual({
      ok: true,
      service: "api",
    });
  });
});
