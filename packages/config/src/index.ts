export function getRequiredEnv(name: string, env: NodeJS.ProcessEnv = process.env): string {
  const value = env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getRedisUrl(env: NodeJS.ProcessEnv = process.env): string {
  return env.REDIS_URL || "redis://127.0.0.1:4313";
}

export type ResearchAgentConfig = {
  modelId: string;
  promptVersion: string;
  guardrailVersion: string;
  agentVersion: string;
  runTokenBudget: number;
  cascadeTokenBudget: number;
  runCostCeilingMicros: number;
  cascadeCostCeilingMicros: number;
  maxOutputTokens: number;
  maxSteps: number;
  pricing: { inputMicrosPerMillion: number; outputMicrosPerMillion: number };
};

export function getResearchAgentConfig(env: NodeJS.ProcessEnv = process.env): ResearchAgentConfig {
  return {
    modelId: env.INGESTION_MODEL_ID || "MiniMax-M3",
    promptVersion: env.INGESTION_PROMPT_VERSION || "rent-research-v1",
    guardrailVersion: env.INGESTION_GUARDRAIL_VERSION || "rent-guardrails-v1",
    agentVersion: env.INGESTION_AGENT_VERSION || "research-agent-v1",
    runTokenBudget: integerEnv(env, "INGESTION_RUN_TOKEN_BUDGET", 40_000),
    cascadeTokenBudget: integerEnv(env, "INGESTION_CASCADE_TOKEN_BUDGET", 100_000),
    runCostCeilingMicros: integerEnv(env, "INGESTION_RUN_COST_CEILING_MICROS", 100_000),
    cascadeCostCeilingMicros: integerEnv(env, "INGESTION_CASCADE_COST_CEILING_MICROS", 250_000),
    maxOutputTokens: integerEnv(env, "INGESTION_MAX_OUTPUT_TOKENS", 8_000),
    maxSteps: integerEnv(env, "INGESTION_MAX_STEPS", 5),
    pricing: {
      inputMicrosPerMillion: integerEnv(env, "INGESTION_INPUT_MICROS_PER_MILLION", 300_000),
      outputMicrosPerMillion: integerEnv(env, "INGESTION_OUTPUT_MICROS_PER_MILLION", 1_200_000),
    },
  };
}

function integerEnv(env: NodeJS.ProcessEnv, name: string, fallback: number): number {
  const raw = env[name];
  if (raw === undefined || raw === "") return fallback;
  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative safe integer.`);
  }
  return parsed;
}
