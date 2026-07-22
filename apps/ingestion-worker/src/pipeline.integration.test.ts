import { FAKE_RESEARCH_JOB, INGESTION_QUEUE } from "@pathport/contracts";
import {
  createDatabaseClient,
  createDatabasePool,
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
import { describe, expect, it } from "vitest";
import { produceFakeRentProposal } from "./fake-producer";

describe("deterministic BullMQ producer", () => {
  it("persists a run, evidence, proposal, and field claims", async () => {
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
    const worker = new Worker(
      INGESTION_QUEUE,
      (job) => produceFakeRentProposal(db, job.data.runId),
      { connection },
    );

    try {
      await resetSchema(pool);
      await seedDatabase(db);
      const [run] = await db
        .insert(ingestionRuns)
        .values({
          type: "fake",
          target: { path: "DE.living.rent" },
          promptVersion: "fake-v1",
          guardrailVersion: "fake-v1",
          agentVersion: "fake-v1",
          idempotencyKey: "integration-fake-run",
        })
        .returning();
      if (!run) throw new Error("Run insert returned no row.");
      await events.waitUntilReady();
      const job = await queue.add(FAKE_RESEARCH_JOB, { runId: run.id });
      await job.waitUntilFinished(events, 30_000);

      const [storedRun] = await db.select().from(ingestionRuns).where(eq(ingestionRuns.id, run.id));
      const proposals = await db
        .select()
        .from(ingestionProposals)
        .where(eq(ingestionProposals.runId, run.id));
      const claims = await db
        .select()
        .from(ingestionClaims)
        .where(
          eq(
            ingestionClaims.proposalId,
            proposals[0]?.id ?? "00000000-0000-0000-0000-000000000000",
          ),
        );
      const evidence = await db
        .select()
        .from(ingestionEvidence)
        .where(eq(ingestionEvidence.runId, run.id));
      expect(storedRun?.status).toBe("completed");
      expect(proposals).toHaveLength(1);
      expect(claims.length).toBeGreaterThan(5);
      expect(evidence).toHaveLength(1);

      const [duplicateRun] = await db
        .insert(ingestionRuns)
        .values({
          type: "fake",
          target: { path: "DE.living.rent" },
          promptVersion: "fake-v1",
          guardrailVersion: "fake-v1",
          agentVersion: "fake-v1",
          idempotencyKey: "integration-duplicate-run",
        })
        .returning();
      if (!duplicateRun) throw new Error("Duplicate run insert returned no row.");
      await expect(produceFakeRentProposal(db, duplicateRun.id)).resolves.toEqual({
        proposalId: null,
      });
    } finally {
      await worker.close();
      await events.close();
      await queue.close();
      await pool.end();
      await Promise.all([postgres.stop(), redis.stop()]);
    }
  }, 120_000);
});
