import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type ApiTestContext, startApiTestContext, stopApiTestContext } from "./testing/test-app";

// The health endpoints are wired through the controller; integration is the right
// altitude to cover that routing (the service logic itself is unit-tested). The
// point of testing `/ready` here is that it runs its query against a real
// database — we only need the schema to exist, not the demo rows, so skip seeding.
describe("Health endpoints", () => {
  let ctx: ApiTestContext;

  beforeAll(async () => {
    ctx = await startApiTestContext({ seed: false });
  }, 120_000);

  afterAll(async () => {
    await stopApiTestContext(ctx);
  });

  it("reports liveness on /health", async () => {
    const response = await ctx.http().get("/health").expect(200);

    expect(response.body).toEqual({ ok: true, service: "api" });
  });

  it("reports ready on /ready once the database is reachable", async () => {
    const response = await ctx.http().get("/ready").expect(200);

    expect(response.body).toEqual({ ok: true, service: "api" });
  });
});
