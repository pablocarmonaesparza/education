#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const ROOT = process.cwd();
const BOARD_PATH = path.join(ROOT, "docs/coord/BUILD_BOARD.yaml");
const LOCK_PATH = path.join(ROOT, "docs/coord/.coord-board.lock");
const STALE_LOCK_SECONDS = 30;

const args = parseArgs(process.argv.slice(2));
const agent = args.agent;
const taskId = args.task;
const leaseMinutes = Number(args.lease ?? "120");
const refresh = Boolean(args.refresh);

if (!agent || !["claude", "codex"].includes(agent)) fail("usage: npm run coord:claim -- --agent claude|codex [--task TASK_ID|--next] [--lease 120] [--refresh]");
if (!taskId && !args.next) fail("provide --task TASK_ID or --next");

withBoardLock(() => {
  const board = readBoard();
  releaseExpiredClaims(board);
  const task = taskId ? board.tasks.find((item) => item.id === taskId) : findNextTask(board, agent);
  if (!task) fail(args.next ? `no claimable task for ${agent}` : `task not found: ${taskId}`);
  if (!canClaim(task, agent, refresh)) {
    fail(`task ${task.id} cannot be claimed by ${agent}; owner=${task.owner}, status=${task.status}, claimed_by=${task.claimed_by ?? "none"}`);
  }

  const expires = new Date(Date.now() + leaseMinutes * 60_000).toISOString();
  task.status = task.status === "backlog" ? "in_progress" : task.status;
  task.claimed_by = agent;
  task.claim_expires_at = expires;
  board.updated_at = new Date().toISOString();
  writeBoard(board);
  console.log(`claimed ${task.id} by ${agent} until ${expires}`);
});

function parseArgs(argv) {
  const out = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (item === "--next") out.next = true;
    else if (item.startsWith("--")) out[item.slice(2)] = argv[index + 1];
  }
  return out;
}

function findNextTask(board, agent) {
  const done = new Set(board.tasks.filter((task) => task.status === "done").map((task) => task.id));
  return board.tasks.find((task) => canClaim(task, agent, false) && (task.depends_on ?? []).every((dep) => done.has(dep)));
}

function canClaim(task, agent, allowRefresh) {
  if (!["backlog", "in_progress"].includes(task.status)) return false;
  if (task.owner !== agent && task.owner !== "shared") return false;
  if (task.claimed_by && !isExpired(task.claim_expires_at)) {
    return allowRefresh && task.claimed_by === agent;
  }
  return true;
}

function releaseExpiredClaims(board) {
  for (const task of board.tasks) {
    if (!task.claimed_by || !isExpired(task.claim_expires_at)) continue;
    task.claimed_by = null;
    task.claim_expires_at = null;
    if (task.status === "in_progress") task.status = "backlog";
    task.notes = `${task.notes ?? ""} | claim expired and released by claim-task`.trim();
  }
}

function isExpired(value) {
  if (!value) return true;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) || date.getTime() < Date.now();
}

function readBoard() {
  return yaml.load(fs.readFileSync(BOARD_PATH, "utf8"));
}

function writeBoard(board) {
  fs.writeFileSync(BOARD_PATH, yaml.dump(board, { lineWidth: 120, noRefs: true }));
}

function withBoardLock(fn) {
  const lock = acquireLock();
  try {
    fn();
  } finally {
    fs.closeSync(lock);
    fs.rmSync(LOCK_PATH, { force: true });
  }
}

function acquireLock() {
  clearStaleLock();
  try {
    return fs.openSync(LOCK_PATH, "wx");
  } catch (error) {
    if (error.code === "EEXIST") fail("board lock already held; retry shortly");
    throw error;
  }
}

function clearStaleLock() {
  if (!fs.existsSync(LOCK_PATH)) return;
  const stat = fs.statSync(LOCK_PATH);
  const ageSeconds = (Date.now() - stat.mtimeMs) / 1000;
  if (ageSeconds > STALE_LOCK_SECONDS) fs.rmSync(LOCK_PATH, { force: true });
}

function fail(message) {
  console.error(`CLAIM_TASK ${message}`);
  process.exit(1);
}
