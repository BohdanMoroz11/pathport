import { coverageConfig, defineWorkspaceTestConfig, testExclude } from "../../vitest.shared";

export default defineWorkspaceTestConfig({
  test: {
    coverage: {
      ...coverageConfig,
      provider: "v8",
      reporter: ["text", "html"],
    },
    environment: "node",
    exclude: testExclude,
    globals: true,
  },
});
