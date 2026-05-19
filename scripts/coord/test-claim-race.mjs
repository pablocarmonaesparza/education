#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import yaml from "js-yaml";

const ROOT = process.cwd();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "itera-claim-race-"));
const boardPath = path.join(tmp, "docs/coord/BUILD_BOARD.yaml");
const scriptPath = path.join(ROOT, "scripts/coord/claim-task.mjs");

fs.mkdirSync(path.dirname(boardPath), { recursive: true });
fs.writeFileSync(boardPath, yaml.dump({
  version: 1,
  tasks: [
    {
      id: "RACE-001",
      title: "race test",
      owner: "codex",
      reviewer: "claude",
      status: "backlog",
      depends_on: [],
      dod: ["one claimant"],
      notes: "synthetic",
    },
  ],
}));

const [one, two] = await Promise.all([
  runClaim(["--agent", "codex", "--task", "RACE-001"]),
  runClaim(["--agent", "codex", "--task", "RACE-001"]),
]);
const board = yaml.load(fs.readFileSync(boardPath, "utf8"));
const task = board.tasks[0];
const successes = [one, two].filter((result) => result.status === 0).length;

if (successes !== 1 || task.claimed_by !== "codex") {
  console.error("CLAIM_RACE failed");
  console.error({ one: one.status, two: two.status, task });
  process.exit(1);
}

console.log("claim race OK");

function runClaim(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [scriptPath, ...args], { cwd: tmp, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("close", (status) => resolve({ status, stdout, stderr }));
  });
}
