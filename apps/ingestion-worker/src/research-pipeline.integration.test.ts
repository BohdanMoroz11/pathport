import {
  DISCOVERY_RESEARCH_JOB,
  type DiscoveryResearchJob,
  type ExtractionResearchJob,
  INGESTION_QUEUE,
  RENT_RESEARCH_TARGET,
} from "@pathport/contracts";
import {
  createDatabaseClient,
  createDatabasePool,
  ingestionClaimEvidence,
  ingestionClaims,
  ingestionEvidence,
  ingestionProposals,
  ingestionRuns,
} from "@pathport/db";
import { resetSchema, seedDatabase } from "@pathport/db/testing";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { Queue, QueueEvents, Worker } from "bullmq";
import { eq } from "drizzle-orm";
import { GenericContainer, Wait } from "testcontainers";
import { describe, expect, it, vi } from "vitest";
import type { ResearchAgent } from "./research-agent";
import { runDiscovery, runExtraction } from "./research-pipeline";

const config = {
  modelId: "cassette-model",
  promptVersion: "rent-research-v1",
  guardrailVersion: "rent-guardrails-v1",
  agentVersion: "research-agent-v1",
  runTokenBudget: 40_000,
  cascadeTokenBudget: 100_000,
  runCostCeilingMicros: 100_000,
  cascadeCostCeilingMicros: 250_000,
  maxOutputTokens: 8_000,
  maxSteps: 5,
  pricing: { inputMicrosPerMillion: 300_000, outputMicrosPerMillion: 1_200_000 },
};

function scriptedAgent(): ResearchAgent {
  return {
    discover: vi.fn().mockResolvedValue({
      value: { subtargets: [RENT_RESEARCH_TARGET.path] },
      usage: { inputTokens: 100, outputTokens: 20 },
      modelId: "cassette-model",
    }),
    extractRent: vi.fn().mockResolvedValue({
      value: {
        rent: {
          note: "Representative monthly asking rents in EUR.",
          rows: [{ city: "Berlin", centre: 1500, outer: 1100, family: 2300 }],
        },
        evidence: [
          {
            url: "https://example.test/german-rent-statistics",
            title: "German rent statistics",
            publisher: "Official statistics",
            sourceType: "official",
            trustTier: "primary",
            excerpt: "Berlin representative asking rents: 1500, 1100, 2300 EUR monthly.",
          },
        ],
        citations: { note: [0], rows: [0] },
      },
      usage: { inputTokens: 500, outputTokens: 200 },
      modelId: "cassette-model",
    }),
    judge: vi.fn().mockResolvedValue({
      value: {
        claims: [
          {
            fieldPath: "content.rent.note",
            scoreBasisPoints: 8500,
            explanation: "The note is supported.",
          },
          {
            fieldPath: "content.rent.rows",
            scoreBasisPoints: 9000,
            explanation: "The values match the excerpt.",
          },
        ],
      },
      usage: { inputTokens: 250, outputTokens: 100 },
      modelId: "cassette-model",
    }),
  };
}

describe("durable research pipeline", () => {
  it("spawns one extraction job and leaves a grounded proposal in the gate", async () => {
    const [postgres, redis] = await Promise.all([
      new PostgreSqlContainer("postgres:16-alpine").start(),
      new GenericContainer("redis:7-alpine")
        .withExposedPorts(6379)
        .withWaitStrategy(Wait.forLogMessage("Ready to accept connections"))
        .start(),
    ]);
    const pool = createDatabasePool(postgres.getConnectionUri());
    const db = createDatabaseClient(pool);
    const connection = { host: redis.getHost(), port: redis.getMappedPort(6379) };
    const queue = new Queue(INGESTION_QUEUE, { connection });
    const events = new QueueEvents(INGESTION_QUEUE, { connection });
    const agent = scriptedAgent();
    const worker = new Worker(
      INGESTION_QUEUE,
      (job) =>
        job.name === DISCOVERY_RESEARCH_JOB
          ? runDiscovery(db, queue, agent, config, job.data as DiscoveryResearchJob)
          : runExtraction(db, agent, config, job.data as ExtractionResearchJob),
      { connection },
    );
    try {
      await resetSchema(pool);
      await seedDatabase(db);
      const [root] = await db
        .insert(ingestionRuns)
        .values({
          type: "discovery",
          target: { path: RENT_RESEARCH_TARGET.path },
          modelId: config.modelId,
          promptVersion: config.promptVersion,
          guardrailVersion: config.guardrailVersion,
          agentVersion: config.agentVersion,
          idempotencyKey: "research-integration-root",
          tokenBudget: config.cascadeTokenBudget,
          costCeilingMicros: config.cascadeCostCeilingMicros,
          modelPricing: config.pricing,
        })
        .returning();
      if (!root) throw new Error("Root insert returned no row.");
      await events.waitUntilReady();
      const discoveryJob = await queue.add(
        DISCOVERY_RESEARCH_JOB,
        { version: 1, runId: root.id },
        { jobId: root.id },
      );
      const discoveryResult = (await discoveryJob.waitUntilFinished(events, 30_000)) as {
        childRunId: string;
      };
      const childJob = await queue.getJob(discoveryResult.childRunId);
      if (!childJob) throw new Error("Durable child job was not found.");
      await childJob.waitUntilFinished(events, 30_000);

      const [storedRoot] = await db
        .select()
        .from(ingestionRuns)
        .where(eq(ingestionRuns.id, root.id));
      const [child] = await db
        .select()
        .from(ingestionRuns)
        .where(eq(ingestionRuns.id, discoveryResult.childRunId));
      const [proposal] = await db
        .select()
        .from(ingestionProposals)
        .where(eq(ingestionProposals.runId, child?.id ?? root.id));
      const claims = proposal
        ? await db.select().from(ingestionClaims).where(eq(ingestionClaims.proposalId, proposal.id))
        : [];
      const evidence = child
        ? await db.select().from(ingestionEvidence).where(eq(ingestionEvidence.runId, child.id))
        : [];
      const links = await db.select().from(ingestionClaimEvidence);

      expect(storedRoot).toMatchObject({
        status: "completed",
        callCount: 1,
        childTokensIn: 750,
        childTokensOut: 300,
      });
      expect(child).toMatchObject({
        parentRunId: root.id,
        status: "completed",
        callCount: 3,
        tokensIn: 750,
        tokensOut: 300,
      });
      expect(proposal).toMatchObject({
        status: "pending",
        operation: "update",
        contractVersion: "destination-rent/v1",
      });
      expect(claims.map((claim) => claim.fieldPath).sort()).toEqual([
        "content.rent.note",
        "content.rent.rows",
      ]);
      expect(claims.every((claim) => claim.decision === "pending")).toBe(true);
      expect(claims.every((claim) => claim.judgeScoreBasisPoints !== null)).toBe(true);
      expect(evidence).toHaveLength(1);
      expect(links).toHaveLength(2);

      await expect(
        runDiscovery(db, queue, agent, config, { version: 1, runId: root.id }),
      ).resolves.toEqual({ childRunId: child?.id });
      await expect(
        runExtraction(db, agent, config, {
          version: 1,
          runId: child?.id ?? "",
          rootRunId: root.id,
        }),
      ).resolves.toEqual({ proposalId: proposal?.id });
      expect(agent.discover).toHaveBeenCalledTimes(1);
      expect(agent.extractRent).toHaveBeenCalledTimes(1);
      expect(agent.judge).toHaveBeenCalledTimes(1);

      const blockedAgent = scriptedAgent();
      const [blockedRoot] = await db
        .insert(ingestionRuns)
        .values({
          type: "discovery",
          target: { path: RENT_RESEARCH_TARGET.path },
          modelId: config.modelId,
          promptVersion: config.promptVersion,
          guardrailVersion: config.guardrailVersion,
          agentVersion: config.agentVersion,
          idempotencyKey: "research-integration-budget-blocked",
          tokenBudget: 100,
          costCeilingMicros: config.cascadeCostCeilingMicros,
          modelPricing: config.pricing,
        })
        .returning();
      if (!blockedRoot) throw new Error("Blocked root insert returned no row.");
      await expect(
        runDiscovery(db, queue, blockedAgent, config, { version: 1, runId: blockedRoot.id }),
      ).rejects.toThrow("Token budget cannot admit the next model call.");
      const [storedBlockedRoot] = await db
        .select()
        .from(ingestionRuns)
        .where(eq(ingestionRuns.id, blockedRoot.id));
      expect(storedBlockedRoot?.status).toBe("budget_exceeded");
      expect(blockedAgent.discover).not.toHaveBeenCalled();
    } finally {
      await worker.close();
      await events.close();
      await queue.close();
      await pool.end();
      await Promise.all([postgres.stop(), redis.stop()]);
    }
  }, 120_000);
});
