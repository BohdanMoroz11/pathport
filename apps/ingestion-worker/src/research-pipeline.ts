import { createHash, randomUUID } from "node:crypto";
import type { ResearchAgentConfig } from "@pathport/config";
import {
  type DiscoveryResearchJob,
  EXTRACTION_RESEARCH_JOB,
  type ExtractionResearchJob,
  RENT_RESEARCH_TARGET,
  rentProfileSchema,
} from "@pathport/contracts";
import {
  type DatabaseClient,
  destinationContentBlocks,
  destinationCountries,
  ingestionClaimEvidence,
  ingestionClaims,
  ingestionEvidence,
  ingestionProposals,
  ingestionRuns,
} from "@pathport/db";
import type { Queue } from "bullmq";
import { eq } from "drizzle-orm";
import { assertBudgetAvailable, BudgetExceededError, estimateCostMicros } from "./budget.js";
import type { AgentResult, JudgeOutput, RentExtraction, ResearchAgent } from "./research-agent.js";

const INPUT_RESERVATION = 8_000;

export async function runDiscovery(
  db: DatabaseClient,
  queue: Queue,
  agent: ResearchAgent,
  config: ResearchAgentConfig,
  job: DiscoveryResearchJob,
): Promise<{ childRunId: string }> {
  const run = await requireRun(db, job.runId);
  requireTarget(run.target);
  if (run.status === "completed") {
    const [child] = await db
      .select({ id: ingestionRuns.id })
      .from(ingestionRuns)
      .where(eq(ingestionRuns.parentRunId, run.id))
      .limit(1);
    if (!child) throw new Error("Completed discovery run has no durable child.");
    return { childRunId: child.id };
  }
  await startRun(db, run.id);
  try {
    assertCallBudget(run, config, INPUT_RESERVATION, Math.min(config.maxOutputTokens, 1_000));
    const discovery = await agent.discover({
      target: RENT_RESEARCH_TARGET.path,
      allowedTargets: [RENT_RESEARCH_TARGET.path],
    });
    if (
      discovery.value.subtargets.length !== 1 ||
      discovery.value.subtargets[0] !== RENT_RESEARCH_TARGET.path
    ) {
      throw new Error("Discovery must spawn exactly the allowlisted S7 target.");
    }
    const usage = usageTotals(discovery, config);
    const childRunId = randomUUID();
    await db.insert(ingestionRuns).values({
      id: childRunId,
      parentRunId: run.id,
      type: "extraction",
      target: { path: RENT_RESEARCH_TARGET.path },
      modelId: config.modelId,
      promptVersion: config.promptVersion,
      guardrailVersion: config.guardrailVersion,
      agentVersion: config.agentVersion,
      idempotencyKey: `extraction:${run.id}:${RENT_RESEARCH_TARGET.path}`,
      tokenBudget: config.runTokenBudget,
      costCeilingMicros: config.runCostCeilingMicros,
      modelPricing: config.pricing,
    });
    await queue.add(
      EXTRACTION_RESEARCH_JOB,
      { version: 1, runId: childRunId, rootRunId: run.id } satisfies ExtractionResearchJob,
      { jobId: childRunId },
    );
    await db
      .update(ingestionRuns)
      .set({
        status: "completed",
        tokensIn: discovery.usage.inputTokens,
        tokensOut: discovery.usage.outputTokens,
        callCount: 1,
        costEstimateMicros: usage.costMicros,
        finishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(ingestionRuns.id, run.id));
    return { childRunId };
  } catch (error) {
    await failRun(db, run.id, error);
    throw error;
  }
}

export async function runExtraction(
  db: DatabaseClient,
  agent: ResearchAgent,
  config: ResearchAgentConfig,
  job: ExtractionResearchJob,
): Promise<{ proposalId: string | null }> {
  const run = await requireRun(db, job.runId);
  requireTarget(run.target);
  if (run.parentRunId !== job.rootRunId)
    throw new Error("Extraction root does not match parent run.");
  if (run.status === "completed") {
    const [proposal] = await db
      .select({ id: ingestionProposals.id })
      .from(ingestionProposals)
      .where(eq(ingestionProposals.runId, run.id))
      .limit(1);
    return { proposalId: proposal?.id ?? null };
  }
  const root = await requireRun(db, job.rootRunId);
  await startRun(db, run.id);
  try {
    const rootSpentTokens =
      root.tokensIn + root.tokensOut + root.childTokensIn + root.childTokensOut;
    assertBudgetAvailable({
      spentTokens: rootSpentTokens,
      spentCostMicros: root.costEstimateMicros + root.childCostEstimateMicros,
      reservedInputTokens: INPUT_RESERVATION * 2,
      reservedOutputTokens: config.maxOutputTokens * 2,
      tokenBudget: root.tokenBudget,
      costCeilingMicros: root.costCeilingMicros,
      pricing: config.pricing,
    });
    assertCallBudget(run, config, INPUT_RESERVATION * 2, config.maxOutputTokens * 2);

    const existingRent = await loadExistingRent(db);
    const extraction = await agent.extractRent({
      target: RENT_RESEARCH_TARGET.path,
      existingRent,
    });
    const extractionUsage = usageTotals(extraction, config);

    assertBudgetAvailable({
      spentTokens: extractionUsage.tokens,
      spentCostMicros: extractionUsage.costMicros,
      reservedInputTokens: INPUT_RESERVATION,
      reservedOutputTokens: Math.min(config.maxOutputTokens, 2_000),
      tokenBudget: run.tokenBudget,
      costCeilingMicros: run.costCeilingMicros,
      pricing: config.pricing,
    });
    const judge = await agent.judge(extraction.value);
    const judgeUsage = usageTotals(judge, config);
    const totals = {
      tokensIn: extraction.usage.inputTokens + judge.usage.inputTokens,
      tokensOut: extraction.usage.outputTokens + judge.usage.outputTokens,
      costMicros: extractionUsage.costMicros + judgeUsage.costMicros,
    };
    enforceActualSpend(run, totals);
    enforceActualCascade(root, totals);

    const proposalId = await persistProposal(db, run.id, extraction.value, judge.value);
    await db
      .update(ingestionRuns)
      .set({
        status: "completed",
        tokensIn: totals.tokensIn,
        tokensOut: totals.tokensOut,
        callCount: 3,
        costEstimateMicros: totals.costMicros,
        finishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(ingestionRuns.id, run.id));
    await db
      .update(ingestionRuns)
      .set({
        childTokensIn: root.childTokensIn + totals.tokensIn,
        childTokensOut: root.childTokensOut + totals.tokensOut,
        childCostEstimateMicros: root.childCostEstimateMicros + totals.costMicros,
        updatedAt: new Date(),
      })
      .where(eq(ingestionRuns.id, root.id));
    return { proposalId };
  } catch (error) {
    await failRun(db, run.id, error);
    throw error;
  }
}

async function persistProposal(
  db: DatabaseClient,
  runId: string,
  extraction: RentExtraction,
  judge: JudgeOutput,
): Promise<string | null> {
  const [destination] = await db
    .select({ id: destinationCountries.id })
    .from(destinationCountries)
    .where(eq(destinationCountries.code, RENT_RESEARCH_TARGET.destinationCode))
    .limit(1);
  if (!destination) throw new Error("Research requires the seeded DE destination.");
  const contentHash = createHash("sha256").update(JSON.stringify(extraction.rent)).digest("hex");
  const judgeByPath = new Map(judge.claims.map((claim) => [claim.fieldPath, claim]));
  const scores = judge.claims.map((claim) => claim.scoreBasisPoints);
  const minimumScore = Math.min(...scores);
  const confidence = minimumScore >= 8_000 ? "high" : minimumScore >= 5_000 ? "medium" : "low";

  return db.transaction(async (tx) => {
    const evidenceRows = await tx
      .insert(ingestionEvidence)
      .values(
        extraction.evidence.map((evidence) => ({
          runId,
          url: evidence.url,
          sourceType: evidence.sourceType,
          title: evidence.title,
          publisher: evidence.publisher,
          retrievedAt: new Date(),
          contentHash: createHash("sha256").update(evidence.excerpt).digest("hex"),
          snapshot: { excerpt: evidence.excerpt },
          trustTier: evidence.trustTier,
        })),
      )
      .returning({ id: ingestionEvidence.id });
    const [proposal] = await tx
      .insert(ingestionProposals)
      .values({
        runId,
        targetKind: "content_block",
        operation: "update",
        target: {
          researchPath: RENT_RESEARCH_TARGET.path,
          canonicalTargetPath: RENT_RESEARCH_TARGET.canonicalTargetPath,
          mergePath: RENT_RESEARCH_TARGET.mergePath,
          destinationId: destination.id,
        },
        contractVersion: "destination-rent/v1",
        payload: { rent: extraction.rent },
        dedupKey: `${RENT_RESEARCH_TARGET.path}:${contentHash}`,
        decisionSummary: { minimumJudgeScoreBasisPoints: minimumScore, risk: confidence },
      })
      .onConflictDoNothing({ target: ingestionProposals.dedupKey })
      .returning({ id: ingestionProposals.id });
    if (!proposal) return null;

    const claimInputs = [
      {
        fieldPath: "content.rent.note" as const,
        value: extraction.rent.note,
        evidenceIndexes: extraction.citations.note,
      },
      {
        fieldPath: "content.rent.rows" as const,
        value: extraction.rent.rows,
        evidenceIndexes: extraction.citations.rows,
      },
    ];
    for (const claimInput of claimInputs) {
      const judged = judgeByPath.get(claimInput.fieldPath);
      if (!judged) throw new Error(`Judge omitted ${claimInput.fieldPath}.`);
      const [claim] = await tx
        .insert(ingestionClaims)
        .values({
          proposalId: proposal.id,
          fieldPath: claimInput.fieldPath,
          value: claimInput.value,
          required: true,
          confidence,
          judgeScoreBasisPoints: judged.scoreBasisPoints,
          note: judged.explanation,
        })
        .returning({ id: ingestionClaims.id });
      if (!claim) throw new Error("Claim insert returned no row.");
      await tx.insert(ingestionClaimEvidence).values(
        [...new Set(claimInput.evidenceIndexes)].map((index) => {
          const evidence = evidenceRows[index];
          if (!evidence) throw new Error(`Missing persisted evidence at index ${index}.`);
          return { claimId: claim.id, evidenceId: evidence.id };
        }),
      );
    }
    return proposal.id;
  });
}

async function loadExistingRent(db: DatabaseClient) {
  const [block] = await db
    .select({ content: destinationContentBlocks.content })
    .from(destinationContentBlocks)
    .where(eq(destinationContentBlocks.targetPath, RENT_RESEARCH_TARGET.canonicalTargetPath))
    .limit(1);
  if (!block || typeof block.content !== "object" || block.content === null) return undefined;
  const parsed = rentProfileSchema.safeParse((block.content as Record<string, unknown>).rent);
  return parsed.success ? parsed.data : undefined;
}

function assertCallBudget(
  run: typeof ingestionRuns.$inferSelect,
  config: ResearchAgentConfig,
  reservedInputTokens: number,
  reservedOutputTokens: number,
): void {
  assertBudgetAvailable({
    spentTokens: run.tokensIn + run.tokensOut,
    spentCostMicros: run.costEstimateMicros,
    reservedInputTokens,
    reservedOutputTokens,
    tokenBudget: run.tokenBudget,
    costCeilingMicros: run.costCeilingMicros,
    pricing: config.pricing,
  });
}

function usageTotals<T>(result: AgentResult<T>, config: ResearchAgentConfig) {
  return {
    tokens: result.usage.inputTokens + result.usage.outputTokens,
    costMicros: estimateCostMicros(result.usage, config.pricing),
  };
}

function enforceActualSpend(
  run: typeof ingestionRuns.$inferSelect,
  usage: { tokensIn: number; tokensOut: number; costMicros: number },
): void {
  if (run.tokenBudget !== null && usage.tokensIn + usage.tokensOut > run.tokenBudget) {
    throw new BudgetExceededError("Actual model usage exceeded the run token budget.");
  }
  if (run.costCeilingMicros !== null && usage.costMicros > run.costCeilingMicros) {
    throw new BudgetExceededError("Actual model usage exceeded the run cost ceiling.");
  }
}

function enforceActualCascade(
  root: typeof ingestionRuns.$inferSelect,
  usage: { tokensIn: number; tokensOut: number; costMicros: number },
): void {
  const tokens =
    root.tokensIn +
    root.tokensOut +
    root.childTokensIn +
    root.childTokensOut +
    usage.tokensIn +
    usage.tokensOut;
  const cost = root.costEstimateMicros + root.childCostEstimateMicros + usage.costMicros;
  if (root.tokenBudget !== null && tokens > root.tokenBudget) {
    throw new BudgetExceededError("Actual model usage exceeded the cascade token budget.");
  }
  if (root.costCeilingMicros !== null && cost > root.costCeilingMicros) {
    throw new BudgetExceededError("Actual model usage exceeded the cascade cost ceiling.");
  }
}

async function requireRun(db: DatabaseClient, id: string) {
  const [run] = await db.select().from(ingestionRuns).where(eq(ingestionRuns.id, id)).limit(1);
  if (!run) throw new Error(`Unknown ingestion run "${id}".`);
  return run;
}

function requireTarget(target: Record<string, unknown>): void {
  if (target.path !== RENT_RESEARCH_TARGET.path) {
    throw new Error(`Unsupported research target "${String(target.path)}".`);
  }
}

async function startRun(db: DatabaseClient, id: string): Promise<void> {
  await db
    .update(ingestionRuns)
    .set({ status: "running", startedAt: new Date(), updatedAt: new Date() })
    .where(eq(ingestionRuns.id, id));
}

async function failRun(db: DatabaseClient, id: string, error: unknown): Promise<void> {
  await db
    .update(ingestionRuns)
    .set({
      status: error instanceof BudgetExceededError ? "budget_exceeded" : "failed",
      error: error instanceof Error ? error.message : String(error),
      finishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(ingestionRuns.id, id));
}
