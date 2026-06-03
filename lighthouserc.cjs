module.exports = {
  ci: {
    assert: {
      assertions: {
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],
      },
    },
    collect: {
      numberOfRuns: 3,
      // Measure the production stack (built API + `next start`), never the dev
      // server — dev bundles are unminified and use the dev React runtime, so
      // their scores are meaningless. scripts/start-stack.mjs boots API + web
      // and prints the sentinel below once both answer. Requires `pnpm build`
      // and a seeded database first (see README / CI).
      startServerCommand: "node scripts/start-stack.mjs",
      startServerReadyPattern: "STACK READY",
      url: ["http://127.0.0.1:3000"],
    },
    upload: {
      outputDir: ".lighthouseci",
      target: "filesystem",
    },
  },
};
