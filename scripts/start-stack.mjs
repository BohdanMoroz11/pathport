// Boot the production stack (API then web) for a Lighthouse run, and print
// "STACK READY" once both answer. The explorer pages are server-rendered and
// read the API over HTTP, which in turn needs a seeded database — so a
// meaningful Lighthouse audit has to measure the real chain, not a web server
// pointed at nothing. Lighthouse measures production builds only: `next dev`
// ships unminified bundles and the dev React runtime, so its scores are
// meaningless. Run `pnpm build` (and seed the DB) before this script.
//
// This is used by lighthouserc.cjs as `startServerCommand`; Lighthouse waits
// for the sentinel, runs its audits, then terminates this process — at which
// point we tear the child process groups down.

import { spawn } from "node:child_process";
import process from "node:process";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgres://pathport:pathport@localhost:5433/pathport";
const API_URL = "http://127.0.0.1:4000";
const WEB_URL = "http://127.0.0.1:3000";

/** @type {import("node:child_process").ChildProcess[]} */
const children = [];
let shuttingDown = false;

// `detached: true` puts each child in its own process group so a single signal
// to the negative pid reaps the whole tree (pnpm and the Next process it spawns
// included), rather than orphaning grandchildren.
function run(name, command, args, env) {
  const child = spawn(command, args, {
    stdio: "inherit",
    detached: true,
    env: { ...process.env, ...env },
  });
  child.on("exit", (code) => {
    if (!shuttingDown && code) {
      console.error(`[start-stack] ${name} exited early with code ${code}`);
      shutdown(1);
    }
  });
  children.push(child);
}

function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    try {
      if (child.pid) process.kill(-child.pid, "SIGTERM");
    } catch {
      // Already gone — nothing to reap.
    }
  }
  setTimeout(() => process.exit(code), 500);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

async function waitFor(url, label, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Not listening yet — keep polling.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${label} at ${url}`);
}

run("api", "node", ["apps/api/dist/main.js"], {
  DATABASE_URL,
  API_HOST: "127.0.0.1",
  API_PORT: "4000",
});
// `/ready` verifies the API can reach the database, so it gates web startup.
await waitFor(`${API_URL}/ready`, "API");

run("web", "pnpm", ["--filter", "@pathport/web", "start"], {
  NEXT_PUBLIC_API_BASE_URL: API_URL,
});
await waitFor(WEB_URL, "web");

console.log("STACK READY");
