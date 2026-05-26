import { coverageConfig, defineWorkspaceTestConfig } from "../../vitest.shared";

export default defineWorkspaceTestConfig({
  test: {
    coverage: {
      ...coverageConfig,
      exclude: [...coverageConfig.exclude, "src/main.ts"],
      provider: "v8",
      reporter: ["text", "html"],
    },
    environment: "node",
    globals: true,
  },
});
