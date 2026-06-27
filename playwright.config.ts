import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  expect: {
    timeout: 5_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  testDir: "./tests/e2e",
  // Seed the throwaway dev DB with the Phase 1 demo data before the run so the
  // explorer journey asserts against known content.
  globalSetup: "./tests/e2e/global-setup.ts",
  use: {
    baseURL: "http://127.0.0.1:4310",
    trace: "on-first-retry",
  },
  // The explorer pages are server-rendered and read the API over HTTP, so the
  // API has to be up alongside the web app (it connects to the seeded DB).
  webServer: [
    {
      command: "pnpm dev:api",
      port: 4311,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "pnpm dev:web",
      port: 4310,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
