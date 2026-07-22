export type RunSpend = {
  tokensIn: number;
  tokensOut: number;
  childTokensIn: number;
  childTokensOut: number;
  costEstimateMicros: number;
  childCostEstimateMicros: number;
};

export function budgetState(
  spend: RunSpend,
  limits: { tokenBudget: number | null; costCeilingMicros: number | null },
): { tokens: number; costMicros: number; exceeded: boolean } {
  const tokens = spend.tokensIn + spend.tokensOut + spend.childTokensIn + spend.childTokensOut;
  const costMicros = spend.costEstimateMicros + spend.childCostEstimateMicros;
  return {
    tokens,
    costMicros,
    exceeded:
      (limits.tokenBudget !== null && tokens > limits.tokenBudget) ||
      (limits.costCeilingMicros !== null && costMicros > limits.costCeilingMicros),
  };
}

const RUN_TRANSITIONS = {
  queued: ["running", "failed", "budget_exceeded"],
  running: ["completed", "failed", "budget_exceeded"],
  completed: [],
  failed: [],
  budget_exceeded: [],
} as const;

export type RunStatus = keyof typeof RUN_TRANSITIONS;

export function canTransitionRun(from: RunStatus, to: RunStatus): boolean {
  return (RUN_TRANSITIONS[from] as readonly RunStatus[]).includes(to);
}
