import {
  contentCitations,
  createDatabaseClient,
  destinationContentBlocks,
  ingestionClaimEvidence,
  ingestionClaims,
  ingestionEvidence,
  ingestionProposals,
  ingestionRuns,
} from "@pathport/db";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type ApiTestContext, startApiTestContext, stopApiTestContext } from "./testing/test-app";

describe("local ingestion review and publish API", () => {
  let context: ApiTestContext;

  beforeAll(async () => {
    context = await startApiTestContext();
  }, 120_000);

  afterAll(async () => stopApiTestContext(context));

  it("reviews claims and publishes a cited canonical content block", async () => {
    const db = createDatabaseClient(context.pool);
    const [run] = await db
      .insert(ingestionRuns)
      .values({
        type: "fake",
        target: { path: "DE.living.rent" },
        status: "completed",
        promptVersion: "fake-v1",
        guardrailVersion: "fake-v1",
        agentVersion: "fake-v1",
        idempotencyKey: "api-publish-integration",
      })
      .returning();
    if (!run) throw new Error("Run insert returned no row.");
    const [proposal] = await db
      .insert(ingestionProposals)
      .values({
        runId: run.id,
        targetKind: "content_block",
        operation: "create",
        target: { path: "DE.living.rent" },
        contractVersion: "destination-content-block/v1",
        payload: {},
        dedupKey: "api-publish-integration-proposal",
      })
      .returning();
    if (!proposal) throw new Error("Proposal insert returned no row.");
    const values = [
      ["destinationCode", "DE"],
      ["sectionKey", "living"],
      ["blockKey", "rent"],
      ["scope", "assumption"],
      ["assumptions.persona", "single renter"],
      ["content.summary", "Reviewed rent example"],
      ["content.amount", 1_100],
      ["targetPath", "DE.living.rent"],
    ] as const;
    const claims = await db
      .insert(ingestionClaims)
      .values(
        values.map(([fieldPath, value]) => ({
          proposalId: proposal.id,
          fieldPath,
          value,
          required: true,
          confidence: "high" as const,
        })),
      )
      .returning();
    const [evidence] = await db
      .insert(ingestionEvidence)
      .values({
        runId: run.id,
        url: "https://example.test/rent",
        sourceType: "official",
        title: "Rent source",
        retrievedAt: new Date(),
        contentHash: "api-publish-evidence",
        trustTier: "primary",
      })
      .returning();
    if (!evidence) throw new Error("Evidence insert returned no row.");
    await db
      .insert(ingestionClaimEvidence)
      .values(
        claims
          .filter((claim) => claim.fieldPath.startsWith("content."))
          .map((claim) => ({ claimId: claim.id, evidenceId: evidence.id })),
      );

    for (const claim of claims) {
      await context
        .http()
        .post(`/local-ingestion/claims/${claim.id}/review`)
        .send({ decision: "approved", reviewer: "integration-test" })
        .expect(201);
    }
    const published = await context
      .http()
      .post(`/local-ingestion/proposals/${proposal.id}/publish`)
      .expect(201);
    expect(published.body.status).toBe("applied");

    const [block] = await db
      .select()
      .from(destinationContentBlocks)
      .where(eq(destinationContentBlocks.targetPath, "DE.living.rent"));
    expect(block?.content).toMatchObject({ amount: 1_100, summary: "Reviewed rent example" });
    expect(block?.sourceProposalId).toBe(proposal.id);
    const citations = await db
      .select()
      .from(contentCitations)
      .where(eq(contentCitations.targetId, block?.id ?? "00000000-0000-0000-0000-000000000000"));
    expect(citations.length).toBeGreaterThan(0);
  });
});
