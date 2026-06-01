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
      startServerCommand: "pnpm dev:web",
      startServerReadyPattern: "Ready",
      url: ["http://localhost:3000"],
    },
    upload: {
      outputDir: ".lighthouseci",
      target: "filesystem",
    },
  },
};
