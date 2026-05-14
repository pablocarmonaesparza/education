#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import process from "node:process";
import { rmSync } from "node:fs";

const preferredPort = Number(process.env.PORT || 3003);
const maxPort = Number(process.env.MAX_PORT || preferredPort + 10);

function run(command, args) {
  return spawnSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function portIsFree(port) {
  const result = run("lsof", [`-tiTCP:${port}`, "-sTCP:LISTEN"]);
  return result.stdout.trim().length === 0;
}

function firstFreePort() {
  for (let port = preferredPort; port <= maxPort; port += 1) {
    if (portIsFree(port)) return port;
  }
  throw new Error(`No free port found between ${preferredPort} and ${maxPort}.`);
}

run(process.execPath, ["scripts/kill-dev.mjs"]);

if (process.env.SKIP_CLEAN_NEXT !== "true") {
  console.log("Removing .next cache before simulator dev start.");
  rmSync(".next", { recursive: true, force: true });
}

const port = firstFreePort();
const url = `http://localhost:${port}/simulator-design`;

console.log(`Starting Itera simulator dev server on ${url}`);
console.log("Use `npm run kill:dev` to stop Itera dev servers for this repo.");

const child = spawn(process.execPath, ["./node_modules/.bin/next", "dev", "--port", String(port)], {
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: String(port),
  },
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
