import { describe, expect, it } from "vitest";
import { assertBudgetAvailable, BudgetExceededError, estimateCostMicros } from "./budget";

const pricing = { inputMicrosPerMillion: 300_000, outputMicrosPerMillion: 1_200_000 };

describe("research budgets", () => {
  it("calculates input and output costs separately", () => {
    expect(estimateCostMicros({ inputTokens: 1_000, outputTokens: 500 }, pricing)).toBe(900);
  });

  it("admits an exact token ceiling", () => {
    expect(() =>
      assertBudgetAvailable({
        spentTokens: 100,
        spentCostMicros: 0,
        reservedInputTokens: 400,
        reservedOutputTokens: 500,
        tokenBudget: 1_000,
        costCeilingMicros: null,
        pricing,
      }),
    ).not.toThrow();
  });

  it("refuses a call before it can exceed a ceiling", () => {
    expect(() =>
      assertBudgetAvailable({
        spentTokens: 101,
        spentCostMicros: 0,
        reservedInputTokens: 400,
        reservedOutputTokens: 500,
        tokenBudget: 1_000,
        costCeilingMicros: null,
        pricing,
      }),
    ).toThrow(BudgetExceededError);
  });
});
