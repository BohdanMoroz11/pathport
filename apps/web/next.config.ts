import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  reactStrictMode: true,
  // Emit a self-contained server bundle for the production Docker image. In a
  // pnpm monorepo the file tracer must root at the repo so it follows the
  // symlinked workspace packages; otherwise the standalone output misses them.
  output: "standalone",
  outputFileTracingRoot: fileURLToPath(new URL("../../", import.meta.url)),
};

export default nextConfig;
