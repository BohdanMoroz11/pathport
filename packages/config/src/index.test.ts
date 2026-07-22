import { describe, expect, it } from "vitest";
import { getRedisUrl, getRequiredEnv, getResearchAgentConfig } from "./index";

describe("getRequiredEnv", () => {
  it("returns a configured value", () => {
    expect(getRequiredEnv("DATABASE_URL", { DATABASE_URL: "postgres://localhost/test" })).toBe(
      "postgres://localhost/test",
    );
  });

  it("throws when the value is missing", () => {
    expect(() => getRequiredEnv("DATABASE_URL", {})).toThrow(
      "Missing required environment variable: DATABASE_URL",
    );
  });
});

describe("getRedisUrl", () => {
  it("uses the local compose Redis by default", () => {
    expect(getRedisUrl({})).toBe("redis://127.0.0.1:4313");
  });

  it("uses REDIS_URL when configured", () => {
    expect(getRedisUrl({ REDIS_URL: "rediss://redis.example" })).toBe("rediss://redis.example");
  });
});

describe("getResearchAgentConfig", () => {
  it("provides bounded, provider-replaceable defaults", () => {
    expect(getResearchAgentConfig({})).toMatchObject({
      modelId: "MiniMax-M3",
      runTokenBudget: 40_000,
      cascadeTokenBudget: 100_000,
      maxSteps: 5,
    });
  });

  it("accepts model and budget overrides", () => {
    expect(
      getResearchAgentConfig({
        INGESTION_MODEL_ID: "future/model",
        INGESTION_RUN_TOKEN_BUDGET: "1234",
      }),
    ).toMatchObject({ modelId: "future/model", runTokenBudget: 1234 });
  });

  it("rejects invalid limits", () => {
    expect(() => getResearchAgentConfig({ INGESTION_MAX_STEPS: "-1" })).toThrow(
      "INGESTION_MAX_STEPS must be a non-negative safe integer.",
    );
  });
});
