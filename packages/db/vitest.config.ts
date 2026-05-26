import { coverageConfig, defineWorkspaceTestConfig, testExclude } from "../../vitest.shared";

export default defineWorkspaceTestConfig({
  test: {
    coverage: {
      ...coverageConfig,
      exclude: [...coverageConfig.exclude, "src/schema.ts"],
      provider: "v8",
      reporter: ["text", "html"],
    },
    environment: "node",
    exclude: testExclude,
    globals: true,
  },
});
