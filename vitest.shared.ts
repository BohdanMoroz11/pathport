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

export function defineWorkspaceTestConfig(options: Parameters<typeof defineConfig>[0]) {
  return defineConfig(options);
}
