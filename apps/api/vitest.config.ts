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
    coverage: {
      ...coverageConfig,
      // `src/main.ts` is the bootstrap; `src/testing/**` is the test harness.
      exclude: [...coverageConfig.exclude, "src/main.ts", "src/testing/**"],
      provider: "v8",
      reporter: ["text", "html"],
    },
    // Two tiers: `unit` is fast and Docker-free; `integration` boots a real
    // Postgres. `vitest run --project unit` runs one; `--coverage` (no project)
    // runs both, which the 60% thresholds rely on. See docs/testing.md.
    projects: [
      {
        extends: true,
        test: { name: "unit", exclude: unitExclude },
      },
      {
        extends: true,
        test: { name: "integration", include: [integrationGlob], exclude: testExclude },
      },
    ],
  },
});
