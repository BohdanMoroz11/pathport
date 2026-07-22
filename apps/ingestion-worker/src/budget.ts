import type { ResearchAgentConfig } from "@pathport/config";
import type { AgentUsage } from "./research-agent.js";

export class BudgetExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BudgetExceededError";
  }
}

export function estimateCostMicros(
  usage: AgentUsage,
  pricing: ResearchAgentConfig["pricing"],
): number {
  return Math.ceil(
    (usage.inputTokens * pricing.inputMicrosPerMillion +
      usage.outputTokens * pricing.outputMicrosPerMillion) /
      1_000_000,
  );
}

export function assertBudgetAvailable(input: {
  spentTokens: number;
  spentCostMicros: number;
  reservedInputTokens: number;
  reservedOutputTokens: number;
  tokenBudget: number | null;
  costCeilingMicros: number | null;
  pricing: ResearchAgentConfig["pricing"];
}): void {
  const reservation = {
    inputTokens: input.reservedInputTokens,
    outputTokens: input.reservedOutputTokens,
  };
  const reservedTokens = reservation.inputTokens + reservation.outputTokens;
  const reservedCost = estimateCostMicros(reservation, input.pricing);
  if (input.tokenBudget !== null && input.spentTokens + reservedTokens > input.tokenBudget) {
    throw new BudgetExceededError("Token budget cannot admit the next model call.");
  }
  if (
    input.costCeilingMicros !== null &&
    input.spentCostMicros + reservedCost > input.costCeilingMicros
  ) {
    throw new BudgetExceededError("Cost ceiling cannot admit the next model call.");
  }
}
