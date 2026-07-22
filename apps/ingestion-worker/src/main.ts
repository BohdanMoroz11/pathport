import { getRedisUrl, getRequiredEnv, getResearchAgentConfig } from "@pathport/config";
import {
  DISCOVERY_RESEARCH_JOB,
  type DiscoveryResearchJob,
  EXTRACTION_RESEARCH_JOB,
  type ExtractionResearchJob,
  FAKE_RESEARCH_JOB,
  INGESTION_QUEUE,
  type IngestionJob,
} from "@pathport/contracts";
import { createDatabaseClient, createDatabasePool, ingestionRuns } from "@pathport/db";
import { Queue, Worker } from "bullmq";
import { config as loadEnv } from "dotenv";
import { eq } from "drizzle-orm";
import { produceFakeRentProposal } from "./fake-producer.js";
import { MiniMaxResearchAgent } from "./minimax-research-agent.js";
import { runDiscovery, runExtraction } from "./research-pipeline.js";

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
const queue = new Queue<IngestionJob>(INGESTION_QUEUE, { connection });
const researchConfig = getResearchAgentConfig();
let researchAgent: MiniMaxResearchAgent | undefined;

function getResearchAgent(): MiniMaxResearchAgent {
  researchAgent ??= new MiniMaxResearchAgent(getRequiredEnv("MINIMAX_API_KEY"), researchConfig);
  return researchAgent;
}

const worker = new Worker<IngestionJob>(
  INGESTION_QUEUE,
  async (job) => {
    try {
      if (job.name === FAKE_RESEARCH_JOB) {
        return await produceFakeRentProposal(db, job.data.runId);
      }
      if (job.name === DISCOVERY_RESEARCH_JOB) {
        return await runDiscovery(
          db,
          queue,
          getResearchAgent(),
          researchConfig,
          job.data as DiscoveryResearchJob,
        );
      }
      if (job.name === EXTRACTION_RESEARCH_JOB) {
        return await runExtraction(
          db,
          getResearchAgent(),
          researchConfig,
          job.data as ExtractionResearchJob,
        );
      }
      throw new Error(`Unsupported ingestion job: ${job.name}`);
    } catch (error) {
      if (job.name === FAKE_RESEARCH_JOB) {
        await db
          .update(ingestionRuns)
          .set({
            status: "failed",
            error: error instanceof Error ? error.message : String(error),
            finishedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(ingestionRuns.id, job.data.runId));
      }
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
    await queue.close();
    await pool.end();
  })();
  return shutdownPromise;
}

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
