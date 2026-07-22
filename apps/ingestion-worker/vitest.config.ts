import {
  coverageConfig,
  defineWorkspaceTestConfig,
  integrationGlob,
  testExclude,
  unitExclude,
} from "../../vitest.shared";

export default defineWorkspaceTestConfig({
  test: {
    environment: "node",
    globals: true,
    coverage: { ...coverageConfig, exclude: [...coverageConfig.exclude, "src/main.ts"] },
    projects: [
      { extends: true, test: { name: "unit", exclude: unitExclude } },
      {
        extends: true,
        test: { name: "integration", include: [integrationGlob], exclude: testExclude },
      },
    ],
  },
});
