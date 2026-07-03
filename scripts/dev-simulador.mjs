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

function parseJsonFromSupabaseStatus(stdout) {
  const start = stdout.indexOf("{");
  const end = stdout.lastIndexOf("}");
  if (start === -1 || end === -1) return null;

  try {
    return JSON.parse(stdout.slice(start, end + 1));
  } catch {
    return null;
  }
}

function localSupabaseEnv(port) {
  if (process.env.ITERA_USE_REMOTE_SUPABASE === "1") {
    console.log("Using Supabase from .env.local because ITERA_USE_REMOTE_SUPABASE=1.");
    return {};
  }
  if (process.env.ITERA_USE_LOCAL_SUPABASE === "0") {
    console.log("Using Supabase from .env.local because ITERA_USE_LOCAL_SUPABASE=0.");
    return {};
  }

  const result = run("supabase", ["status", "-o", "json"]);
  if (result.status !== 0) {
    console.log("Supabase local is not running; using Supabase from .env.local.");
    return {};
  }

  const status = parseJsonFromSupabaseStatus(result.stdout);
  const apiUrl = status?.API_URL;
  if (!apiUrl || !/^https?:\/\/(127\.0\.0\.1|localhost):/u.test(apiUrl)) {
    console.log("Supabase local status did not expose a local API URL; using .env.local.");
    return {};
  }

  console.log(`Using local Supabase for simulator dev: ${apiUrl}`);
  return {
    NEXT_PUBLIC_SUPABASE_URL: apiUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: status.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY,
    NEXT_PUBLIC_APP_URL: `http://localhost:${port}`,
  };
}

run(process.execPath, ["scripts/kill-dev.mjs"]);

if (process.env.SKIP_CLEAN_NEXT !== "true") {
  console.log("Removing .next cache before simulator dev start.");
  rmSync(".next", { recursive: true, force: true });
}

const port = firstFreePort();
const url = `http://localhost:${port}/`;
const supabaseEnv = localSupabaseEnv(port);

console.log(`Starting Itera simulator dev server on ${url}`);
console.log("Use `npm run kill:dev` to stop Itera dev servers for this repo.");

const child = spawn(process.execPath, ["./node_modules/.bin/next", "dev", "--port", String(port)], {
  stdio: "inherit",
  env: {
    ...process.env,
    ...supabaseEnv,
    PORT: String(port),
  },
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
