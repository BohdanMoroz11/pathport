import { coverageConfig, defineWorkspaceTestConfig } from "../../vitest.shared";

export default defineWorkspaceTestConfig({
  test: {
    coverage: {
      ...coverageConfig,
      provider: "v8",
      reporter: ["text", "html"],
    },
    environment: "node",
    globals: true,
  },
});
