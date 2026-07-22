import { describe, expect, it } from "vitest";
import { getRedisUrl, getRequiredEnv } from "./index";

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
