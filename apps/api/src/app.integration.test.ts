import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type ApiTestContext, startApiTestContext, stopApiTestContext } from "./testing/test-app";

// `/health` is liveness only and is covered by the health unit tests; the value
// of testing it here is `/ready`, which runs its readiness query against a real
// database. We only need the schema to exist, not the demo rows, so skip seeding.
describe("App readiness", () => {
  let ctx: ApiTestContext;

  beforeAll(async () => {
    ctx = await startApiTestContext({ seed: false });
  }, 120_000);

  afterAll(async () => {
    await stopApiTestContext(ctx);
  });

  it("reports ready once the database is reachable", async () => {
    const response = await ctx.http().get("/ready").expect(200);

    expect(response.body).toEqual({ ok: true, service: "api" });
  });
});
