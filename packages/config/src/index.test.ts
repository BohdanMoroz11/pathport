import { describe, expect, it } from "vitest";
import { getRequiredEnv } from "./index";

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
