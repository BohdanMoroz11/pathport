import { resolve } from "node:path";
import { coverageConfig, defineWorkspaceTestConfig } from "../../vitest.shared";

export default defineWorkspaceTestConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    coverage: {
      ...coverageConfig,
      exclude: [...coverageConfig.exclude, "next-env.d.ts", "src/app/layout.tsx"],
      provider: "v8",
      reporter: ["text", "html"],
    },
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
