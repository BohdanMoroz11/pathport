import { getRedisUrl, getRequiredEnv } from "@pathport/config";
import { FAKE_RESEARCH_JOB, type FakeResearchJob, INGESTION_QUEUE } from "@pathport/contracts";
import { createDatabaseClient, createDatabasePool, ingestionRuns } from "@pathport/db";
import { Worker } from "bullmq";
import { config as loadEnv } from "dotenv";
import { eq } from "drizzle-orm";
import { produceFakeRentProposal } from "./fake-producer.js";

loadEnv({ path: [".env", "../../.env"], quiet: true });

const redisUrl = new URL(getRedisUrl());
const connection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379),
  username: redisUrl.username || undefined,
  password: redisUrl.password || undefined,
  ...(redisUrl.protocol === "rediss:" ? { tls: {} } : {}),
};
const pool = createDatabasePool(getRequiredEnv("DATABASE_URL"));
const db = createDatabaseClient(pool);

const worker = new Worker<FakeResearchJob>(
  INGESTION_QUEUE,
  async (job) => {
    if (job.name !== FAKE_RESEARCH_JOB) {
      throw new Error(`Unsupported ingestion job: ${job.name}`);
    }
    try {
      return await produceFakeRentProposal(db, job.data.runId);
    } catch (error) {
      await db
        .update(ingestionRuns)
        .set({
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
          finishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(ingestionRuns.id, job.data.runId));
      throw error;
    }
  },
  { connection },
);

worker.on("failed", (job, error) => {
  console.error("Ingestion job failed", { jobId: job?.id, error });
});
worker.on("ready", () => {
  console.info(`Ingestion worker ready on queue "${INGESTION_QUEUE}".`);
});

let shutdownPromise: Promise<void> | undefined;

function shutdown(): Promise<void> {
  shutdownPromise ??= (async () => {
    await worker.close();
    await pool.end();
  })();
  return shutdownPromise;
}

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
