import { getRequiredEnv, getResearchAgentConfig } from "@pathport/config";
import { RENT_RESEARCH_TARGET } from "@pathport/contracts";
import { describe, expect, it } from "vitest";
import { estimateCostMicros } from "../budget";
import { MiniMaxResearchAgent } from "../minimax-research-agent";

const runLive = process.env.RUN_LIVE_AI_EVAL === "1";
const maxAttempts = Number(process.env.RING3_MAX_ATTEMPTS ?? 2);

describe.skipIf(!runLive)("Ring 3 MiniMax rent eval", () => {
  it(
    "discovers, researches, cites, and judges the golden target within budget",
    async () => {
      let lastError: unknown;
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          await runGoldenTargetEval();
          return;
        } catch (error) {
          lastError = error;
          console.warn(`Ring 3 attempt ${attempt}/${maxAttempts} failed`, error);
        }
      }
      throw lastError;
    },
    180_000 * maxAttempts,
  );
});

async function runGoldenTargetEval(): Promise<void> {
  const config = getResearchAgentConfig();
  const agent = new MiniMaxResearchAgent(getRequiredEnv("MINIMAX_API_KEY"), config);
  const discovery = await agent.discover({
    target: RENT_RESEARCH_TARGET.path,
    allowedTargets: [RENT_RESEARCH_TARGET.path],
  });
  expect(discovery.value.subtargets).toEqual([RENT_RESEARCH_TARGET.path]);

  const search = await agent.searchRentEvidence({ target: RENT_RESEARCH_TARGET.path });
  const draft = await agent.extractRent({
    target: RENT_RESEARCH_TARGET.path,
    evidence: search.value,
  });
  const extraction = { ...draft.value, evidence: search.value };
  expect(extraction.rent.rows.length).toBeGreaterThan(0);
  expect(extraction.evidence.length).toBeGreaterThan(0);
  expect(extraction.citations.note.length).toBeGreaterThan(0);
  expect(extraction.citations.rows.length).toBeGreaterThan(0);
  // Contract rows are monthly EUR apartment totals, not €/m² rates.
  expect(Math.min(...extraction.rent.rows.map((row) => row.centre))).toBeGreaterThanOrEqual(200);

  const judge = await agent.judge(extraction);
  expect(judge.value.claims).toHaveLength(2);
  expect(
    Math.min(...judge.value.claims.map((claim) => claim.scoreBasisPoints)),
  ).toBeGreaterThanOrEqual(5_000);

  const usage = [discovery, search, draft, judge].reduce(
    (total, result) => ({
      inputTokens: total.inputTokens + result.usage.inputTokens,
      outputTokens: total.outputTokens + result.usage.outputTokens,
    }),
    { inputTokens: 0, outputTokens: 0 },
  );
  const costMicros = estimateCostMicros(usage, config.pricing);
  expect(usage.inputTokens + usage.outputTokens).toBeLessThanOrEqual(config.cascadeTokenBudget);
  expect(costMicros).toBeLessThanOrEqual(config.cascadeCostCeilingMicros);
  console.info(
    JSON.stringify({
      target: RENT_RESEARCH_TARGET.path,
      rows: extraction.rent.rows.length,
      evidence: extraction.evidence.length,
      minimumJudgeScore: Math.min(...judge.value.claims.map((claim) => claim.scoreBasisPoints)),
      usage,
      costMicros,
    }),
  );
}
