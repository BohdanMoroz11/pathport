import { defineConfig } from "vitest/config";

export const coverageConfig = {
  all: true,
  exclude: [
    "**/*.config.*",
    "**/*.d.ts",
    "**/dist/**",
    "**/node_modules/**",
    "**/test/**",
    "**/tests/**",
    "**/vitest.setup.*",
  ],
  thresholds: {
    branches: 60,
    functions: 60,
    lines: 60,
    statements: 60,
  },
};

export const testExclude = ["**/dist/**", "**/node_modules/**"];

// Integration tests boot a real Postgres via Testcontainers, so they need Docker.
// They are named `*.integration.test.ts` and run in their own vitest project, so
// the default `test` (unit) tier stays fast and Docker-free. See docs/testing.md.
export const integrationGlob = "**/*.integration.test.ts";

// The unit project excludes integration tests so it never reaches for Docker.
export const unitExclude = [...testExclude, integrationGlob];

export function defineWorkspaceTestConfig(options: Parameters<typeof defineConfig>[0]) {
  return defineConfig(options);
}
