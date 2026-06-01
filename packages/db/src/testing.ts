/**
 * Dev/test-only entrypoint (`@pathport/db/testing`).
 *
 * Bundles the schema-push helpers and the demo seed so tests can stand up a
 * real Postgres database from scratch. Everything here depends on dev tooling
 * (drizzle-kit) and/or throwaway demo data, so it is deliberately kept off the
 * main package index — the API runtime must never import it.
 */
export * from "./push.js";
export * from "./seed/data.js";
export * from "./seed/seed.js";
