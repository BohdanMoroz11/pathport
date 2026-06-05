import { describe, expect, it } from "vitest";
import { HealthService } from "./health.service";

// The only real behavior here is `ready()` delegating to the database readiness
// check: it must resolve when the check passes and reject when it fails. Liveness
// (`health()`) is a fixed contract, asserted once.
function healthServiceWith(assertReady: () => Promise<void>): HealthService {
  return new HealthService({ assertReady } as never);
}

describe("HealthService", () => {
  it("reports liveness without touching the database", () => {
    const service = healthServiceWith(async () => {
      throw new Error("ready() must not be called for liveness");
    });

    expect(service.health()).toEqual({ ok: true, service: "api" });
  });

  it("reports ready when the database readiness check passes", async () => {
    const service = healthServiceWith(async () => undefined);

    await expect(service.ready()).resolves.toEqual({ ok: true, service: "api" });
  });

  it("rejects readiness when the database is unreachable", async () => {
    const service = healthServiceWith(async () => {
      throw new Error("connection refused");
    });

    await expect(service.ready()).rejects.toThrow("connection refused");
  });
});
