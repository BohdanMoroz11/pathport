import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type ApiTestContext, startApiTestContext, stopApiTestContext } from "./testing/test-app";

describe("Local write API", () => {
  let ctx: ApiTestContext;
  const http = () => ctx.http();

  beforeAll(async () => {
    ctx = await startApiTestContext();
  }, 120_000);

  afterAll(async () => {
    await stopApiTestContext(ctx);
  });

  it("upserts scoped destination content blocks with validation", async () => {
    await http().post("/local-write/content-blocks").send({}).expect(400);

    const response = await http()
      .post("/local-write/content-blocks")
      .send({
        destinationCode: "DE",
        sectionKey: "living",
        blockKey: "test-rent-note",
        scope: "assumption",
        assumptions: { household: "single renter" },
        content: { summary: "Writable demo note." },
        targetPath: "DE.living.test-rent-note",
        reviewStatus: "needs_review",
        confidence: "low",
        isDemo: true,
      })
      .expect(201);

    expect(response.body).toMatchObject({
      sectionKey: "living",
      blockKey: "test-rent-note",
      scope: "assumption",
      targetPath: "DE.living.test-rent-note",
      isDemo: true,
    });
  });

  it("creates route, applicability, source document, and citation records", async () => {
    const routeResponse = await http()
      .post("/local-write/routes")
      .send({
        destinationCode: "DE",
        type: "other",
        title: "S6 Test Route",
        summary: "Route created through the local write API.",
        workPermission: "limited",
        familyInclusion: false,
        pathToPermanentResidence: "none",
        renewable: false,
        details: { caveats: ["Test-only route."] },
        reviewStatus: "draft",
        confidence: "low",
        isDemo: true,
      })
      .expect(201);
    const routeId = routeResponse.body.id as string;
    expect(routeId).toMatch(/^[0-9a-f-]{36}$/);

    await http()
      .post("/local-write/route-applicability")
      .send({ routeId, citizenshipCode: "USA", note: "Test applicability.", isDemo: true })
      .expect(201);

    const sourceResponse = await http()
      .post("/local-write/source-documents")
      .send({
        type: "official",
        label: "Test source",
        url: "https://example.test/pathport-s6-write-api",
      })
      .expect(201);

    await http()
      .post("/local-write/citations")
      .send({
        sourceDocumentId: sourceResponse.body.id,
        targetType: "route",
        targetId: routeId,
        fieldPath: "details.caveats",
      })
      .expect(201);
  });
});
