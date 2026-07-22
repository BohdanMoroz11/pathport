import { describe, expect, it } from "vitest";
import { budgetState, canTransitionRun } from "./ingestion-state";

describe("budgetState", () => {
  it("rolls child usage into the cascade total and stops at the ceiling", () => {
    expect(
      budgetState(
        {
          tokensIn: 100,
          tokensOut: 50,
          childTokensIn: 200,
          childTokensOut: 150,
          costEstimateMicros: 100,
          childCostEstimateMicros: 400,
        },
        { tokenBudget: 499, costCeilingMicros: 1_000 },
      ),
    ).toEqual({ tokens: 500, costMicros: 500, exceeded: true });
  });
});

describe("run status transitions", () => {
  it("allows durable execution and rejects reopening terminal runs", () => {
    expect(canTransitionRun("queued", "running")).toBe(true);
    expect(canTransitionRun("running", "completed")).toBe(true);
    expect(canTransitionRun("completed", "running")).toBe(false);
  });
});
