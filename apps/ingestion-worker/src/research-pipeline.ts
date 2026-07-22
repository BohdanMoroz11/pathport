import { createHash } from "node:crypto";
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
import {
  type AgentResult,
  type JudgeOutput,
  type RentExtraction,
  type ResearchAgent,
  validateExtractionCitations,
} from "./research-agent.js";

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
  const [existingChild] = await db
    .select({ id: ingestionRuns.id })
    .from(ingestionRuns)
    .where(eq(ingestionRuns.parentRunId, run.id))
    .limit(1);
  if (run.status === "completed") {
    if (!existingChild) throw new Error("Completed discovery run has no durable child.");
    return { childRunId: existingChild.id };
  }
  await startRun(db, run.id);
  try {
    if (run.callCount === 0 && !existingChild) {
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
      await db
        .update(ingestionRuns)
        .set({
          tokensIn: discovery.usage.inputTokens,
          tokensOut: discovery.usage.outputTokens,
          callCount: 1,
          costEstimateMicros: usage.costMicros,
          updatedAt: new Date(),
        })
        .where(eq(ingestionRuns.id, run.id));
    }
    const childRunId = deterministicUuid(`extraction:${run.id}:${RENT_RESEARCH_TARGET.path}`);
    await db
      .insert(ingestionRuns)
      .values({
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
      })
      .onConflictDoNothing({ target: ingestionRuns.idempotencyKey });
    await queue.add(
      EXTRACTION_RESEARCH_JOB,
      { version: 1, runId: childRunId, rootRunId: run.id } satisfies ExtractionResearchJob,
      { jobId: childRunId },
    );
    await db
      .update(ingestionRuns)
      .set({
        status: "completed",
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
  let direct = {
    tokensIn: run.tokensIn,
    tokensOut: run.tokensOut,
    costMicros: run.costEstimateMicros,
    callCount: run.callCount,
  };
  let descendants = {
    tokensIn: root.childTokensIn,
    tokensOut: root.childTokensOut,
    costMicros: root.childCostEstimateMicros,
  };
  try {
    const existingRent = await loadExistingRent(db);
    admitModelCall(run, root, direct, descendants, config, INPUT_RESERVATION, 4_000);
    const search = await agent.searchRentEvidence({ target: RENT_RESEARCH_TARGET.path });
    ({ direct, descendants } = await recordChildUsage(
      db,
      run.id,
      root.id,
      direct,
      descendants,
      search,
      config,
    ));
    enforceRecordedSpend(run, root, direct, descendants);

    admitModelCall(
      run,
      root,
      direct,
      descendants,
      config,
      INPUT_RESERVATION,
      config.maxOutputTokens,
    );
    const draft = await agent.extractRent({
      target: RENT_RESEARCH_TARGET.path,
      evidence: search.value,
      existingRent,
    });
    ({ direct, descendants } = await recordChildUsage(
      db,
      run.id,
      root.id,
      direct,
      descendants,
      draft,
      config,
    ));
    enforceRecordedSpend(run, root, direct, descendants);
    const extraction = validateExtractionCitations({
      ...draft.value,
      evidence: search.value,
    });

    admitModelCall(run, root, direct, descendants, config, INPUT_RESERVATION, 2_000);
    const judge = await agent.judge(extraction);
    ({ direct, descendants } = await recordChildUsage(
      db,
      run.id,
      root.id,
      direct,
      descendants,
      judge,
      config,
    ));
    enforceRecordedSpend(run, root, direct, descendants);

    const proposalId = await persistProposal(db, run.id, extraction, judge.value);
    await db
      .update(ingestionRuns)
      .set({
        status: "completed",
        finishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(ingestionRuns.id, run.id));
    return { proposalId };
  } catch (error) {
    await failRun(db, run.id, error);
    if (error instanceof BudgetExceededError) await failRun(db, root.id, error);
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
  const uniqueEvidence: RentExtraction["evidence"] = [];
  const persistedIndexByOriginal = new Map<number, number>();
  const uniqueIndexByHash = new Map<string, number>();
  extraction.evidence.forEach((evidence, originalIndex) => {
    const hash = createHash("sha256").update(evidence.excerpt).digest("hex");
    let uniqueIndex = uniqueIndexByHash.get(hash);
    if (uniqueIndex === undefined) {
      uniqueIndex = uniqueEvidence.length;
      uniqueEvidence.push(evidence);
      uniqueIndexByHash.set(hash, uniqueIndex);
    }
    persistedIndexByOriginal.set(originalIndex, uniqueIndex);
  });

  return db.transaction(async (tx) => {
    const evidenceRows = await tx
      .insert(ingestionEvidence)
      .values(
        uniqueEvidence.map((evidence) => ({
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
        [
          ...new Set(
            claimInput.evidenceIndexes.map((index) => persistedIndexByOriginal.get(index)),
          ),
        ].map((index) => {
          const evidence = index === undefined ? undefined : evidenceRows[index];
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

function deterministicUuid(value: string): string {
  const hex = createHash("sha256").update(value).digest("hex").slice(0, 32).split("");
  hex[12] = "4";
  hex[16] = ((Number.parseInt(hex[16] ?? "0", 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8).join("")}-${hex.slice(8, 12).join("")}-${hex
    .slice(12, 16)
    .join("")}-${hex.slice(16, 20).join("")}-${hex.slice(20).join("")}`;
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

type DirectSpend = {
  tokensIn: number;
  tokensOut: number;
  costMicros: number;
  callCount: number;
};

type DescendantSpend = Omit<DirectSpend, "callCount">;

function admitModelCall(
  run: typeof ingestionRuns.$inferSelect,
  root: typeof ingestionRuns.$inferSelect,
  direct: DirectSpend,
  descendants: DescendantSpend,
  config: ResearchAgentConfig,
  reservedInputTokens: number,
  reservedOutputTokens: number,
): void {
  assertBudgetAvailable({
    spentTokens: direct.tokensIn + direct.tokensOut,
    spentCostMicros: direct.costMicros,
    reservedInputTokens,
    reservedOutputTokens,
    tokenBudget: run.tokenBudget,
    costCeilingMicros: run.costCeilingMicros,
    pricing: config.pricing,
  });
  assertBudgetAvailable({
    spentTokens: root.tokensIn + root.tokensOut + descendants.tokensIn + descendants.tokensOut,
    spentCostMicros: root.costEstimateMicros + descendants.costMicros,
    reservedInputTokens,
    reservedOutputTokens,
    tokenBudget: root.tokenBudget,
    costCeilingMicros: root.costCeilingMicros,
    pricing: config.pricing,
  });
}

async function recordChildUsage<T>(
  db: DatabaseClient,
  runId: string,
  rootId: string,
  direct: DirectSpend,
  descendants: DescendantSpend,
  result: AgentResult<T>,
  config: ResearchAgentConfig,
): Promise<{ direct: DirectSpend; descendants: DescendantSpend }> {
  const cost = estimateCostMicros(result.usage, config.pricing);
  const nextDirect = {
    tokensIn: direct.tokensIn + result.usage.inputTokens,
    tokensOut: direct.tokensOut + result.usage.outputTokens,
    costMicros: direct.costMicros + cost,
    callCount: direct.callCount + 1,
  };
  const nextDescendants = {
    tokensIn: descendants.tokensIn + result.usage.inputTokens,
    tokensOut: descendants.tokensOut + result.usage.outputTokens,
    costMicros: descendants.costMicros + cost,
  };
  await db.transaction(async (tx) => {
    await tx
      .update(ingestionRuns)
      .set({
        tokensIn: nextDirect.tokensIn,
        tokensOut: nextDirect.tokensOut,
        costEstimateMicros: nextDirect.costMicros,
        callCount: nextDirect.callCount,
        updatedAt: new Date(),
      })
      .where(eq(ingestionRuns.id, runId));
    await tx
      .update(ingestionRuns)
      .set({
        childTokensIn: nextDescendants.tokensIn,
        childTokensOut: nextDescendants.tokensOut,
        childCostEstimateMicros: nextDescendants.costMicros,
        updatedAt: new Date(),
      })
      .where(eq(ingestionRuns.id, rootId));
  });
  return { direct: nextDirect, descendants: nextDescendants };
}

function enforceRecordedSpend(
  run: typeof ingestionRuns.$inferSelect,
  root: typeof ingestionRuns.$inferSelect,
  direct: DirectSpend,
  descendants: DescendantSpend,
): void {
  if (run.tokenBudget !== null && direct.tokensIn + direct.tokensOut > run.tokenBudget) {
    throw new BudgetExceededError("Actual model usage exceeded the run token budget.");
  }
  if (run.costCeilingMicros !== null && direct.costMicros > run.costCeilingMicros) {
    throw new BudgetExceededError("Actual model usage exceeded the run cost ceiling.");
  }
  const tokens = root.tokensIn + root.tokensOut + descendants.tokensIn + descendants.tokensOut;
  const cost = root.costEstimateMicros + descendants.costMicros;
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
