import { execSync } from "node:child_process";

/**
 * Seed the demo data before the end-to-end run so the explorer renders known
 * content. `db:seed` drops and recreates the throwaway dev schema, then loads
 * the Phase 1 demo data, against `DATABASE_URL` (defaults to the local
 * docker-compose Postgres). Dev/test only — see packages/db/src/seed/run.ts.
 */
export default function globalSetup(): void {
  execSync("pnpm db:seed", { stdio: "inherit" });
}
