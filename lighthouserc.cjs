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
      // Audit the production stack, never the dev server — dev bundles are
      // unminified and use the dev React runtime, so their scores are
      // meaningless. The stack is brought up separately and gated on container
      // healthchecks (`pnpm start:stack`, or the CI Lighthouse step); lhci just
      // points at the already-running web service.
      url: ["http://127.0.0.1:3000"],
    },
    upload: {
      outputDir: ".lighthouseci",
      target: "filesystem",
    },
  },
};
