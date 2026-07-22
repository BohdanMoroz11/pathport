import { getRedisUrl } from "@pathport/config";
import { FAKE_RESEARCH_JOB, type FakeResearchJob, INGESTION_QUEUE } from "@pathport/contracts";
import { Worker } from "bullmq";

const redisUrl = new URL(getRedisUrl());
const connection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379),
  username: redisUrl.username || undefined,
  password: redisUrl.password || undefined,
  ...(redisUrl.protocol === "rediss:" ? { tls: {} } : {}),
};

const worker = new Worker<FakeResearchJob>(
  INGESTION_QUEUE,
  async (job) => {
    if (job.name !== FAKE_RESEARCH_JOB) {
      throw new Error(`Unsupported ingestion job: ${job.name}`);
    }
    // S6's deterministic producer is wired in the next slice. Keeping the
    // durable boundary live first makes process lifecycle and Redis independent
    // from proposal production.
    return { runId: job.data.runId };
  },
  { connection },
);

worker.on("failed", (job, error) => {
  console.error("Ingestion job failed", { jobId: job?.id, error });
});

async function shutdown(): Promise<void> {
  await worker.close();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
