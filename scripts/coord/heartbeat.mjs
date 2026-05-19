#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const ROOT = process.cwd();
const STATUS_PATH = path.join(ROOT, "docs/coord/AGENT_STATUS.md");
const BLOCKERS_PATH = path.join(ROOT, "docs/coord/BLOCKERS.md");
const PABLO_PATH = path.join(ROOT, "docs/coord/PABLO_INPUT_NEEDED.md");
const BOARD_PATH = path.join(ROOT, "docs/coord/BUILD_BOARD.yaml");
const INBOX_PATHS = [
  path.join(ROOT, "docs/coord/INBOX_CLAUDE.md"),
  path.join(ROOT, "docs/coord/INBOX_CODEX.md"),
];
const HOURS_STALE = Number(process.env.COORD_STALE_HOURS ?? "2");

function main() {
  const now = new Date();
  const released = releaseExpiredBoardClaims(now);
  const stale = findStaleAgents(now);
  for (const item of stale) {
    appendBlockerIfMissing({
      id: `heartbeat-stale-${item.agent}-${formatHour(now)}`,
      title: `${item.agent} status stale`,
      body: `needs: ${item.agent} has not updated AGENT_STATUS.md for ${item.hours.toFixed(1)}h\nfiles: [docs/coord/AGENT_STATUS.md]\ndefault_if_no_response: continue with non-blocked tasks and leave inbox note`,
    });
  }

  const escalated = [];
  for (const inboxPath of INBOX_PATHS) {
    const result = escalateExpiredInbox(inboxPath, now);
    escalated.push(...result);
  }

  if (stale.length === 0 && escalated.length === 0 && released.length === 0) {
    console.log("coord heartbeat OK");
    return;
  }
  console.log(`coord heartbeat wrote ${stale.length} stale warnings, ${escalated.length} escalations, ${released.length} released claims`);
}

function releaseExpiredBoardClaims(now) {
  if (!fs.existsSync(BOARD_PATH)) return [];
  const board = yaml.load(fs.readFileSync(BOARD_PATH, "utf8"));
  const released = [];
  for (const task of board.tasks ?? []) {
    if (!task.claimed_by || !task.claim_expires_at) continue;
    const expires = new Date(task.claim_expires_at);
    if (Number.isNaN(expires.getTime()) || expires >= now || ["done", "review"].includes(task.status)) continue;
    const previousAgent = task.claimed_by;
    task.claimed_by = null;
    task.claim_expires_at = null;
    if (task.status === "in_progress") task.status = "backlog";
    task.notes = `${task.notes ?? ""} | claim by ${previousAgent} expired and was released by heartbeat`.trim();
    released.push({ id: task.id, previousAgent });
    appendBlockerIfMissing({
      id: `heartbeat-claim-released-${task.id}-${formatHour(now)}`,
      title: `claim expired for ${task.id}`,
      body: `needs: task claim by ${previousAgent} expired and was released\nfiles: [docs/coord/BUILD_BOARD.yaml]\ndefault_if_no_response: task is available for next eligible agent`,
    });
  }
  if (released.length > 0) {
    board.updated_at = now.toISOString();
    fs.writeFileSync(BOARD_PATH, yaml.dump(board, { lineWidth: 120, noRefs: true }));
  }
  return released;
}

function findStaleAgents(now) {
  if (!fs.existsSync(STATUS_PATH)) return [];
  const text = fs.readFileSync(STATUS_PATH, "utf8");
  const agents = ["claude", "codex"];
  const stale = [];

  for (const agent of agents) {
    const section = getSection(text, `## ${agent}`);
    const dates = [...section.matchAll(/\[(\d{4}-\d{2}-\d{2}T[^\]]+)\]/g)]
      .map((match) => new Date(match[1]))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((a, b) => b.getTime() - a.getTime());
    const latest = dates[0];
    if (!latest) {
      stale.push({ agent, hours: Number.POSITIVE_INFINITY });
      continue;
    }
    const hours = (now.getTime() - latest.getTime()) / 36e5;
    if (hours > HOURS_STALE) stale.push({ agent, hours });
  }
  return stale;
}

function escalateExpiredInbox(inboxPath, now) {
  const { text, inbox } = readInbox(inboxPath);
  if (!text) return [];
  const expired = [];
  let changed = false;

  for (const item of inbox) {
    if (!item.expires_at || item.status !== "open") continue;
    const expires = new Date(item.expires_at);
    if (Number.isNaN(expires.getTime()) || expires >= now) continue;
    item.status = "escalated";
    expired.push(item);
    changed = true;
    appendPabloInputIfMissing(item);
  }

  if (changed) writeInbox(inboxPath, text, inbox);
  return expired;
}

function appendBlockerIfMissing({ id, title, body }) {
  const existing = fs.existsSync(BLOCKERS_PATH) ? fs.readFileSync(BLOCKERS_PATH, "utf8") : "";
  if (existing.includes(`<!-- ${id} -->`)) return;
  const stamp = new Date().toISOString();
  const entry = `\n<!-- ${id} -->\n## [${stamp}] system blocked on coordination by ${title}\n\n${body}\n`;
  fs.appendFileSync(BLOCKERS_PATH, entry);
}

function formatHour(date) {
  return date.toISOString().slice(0, 13).replace(/[-:T]/g, "");
}

function appendPabloInputIfMissing(item) {
  const { text, items } = readPabloInput();
  if (items.some((existing) => existing.id === `esc-${item.id}`)) return;
  const nextItems = [
    ...items,
    {
      id: `esc-${item.id}`,
      from_inbox: item.id,
      topic: item.topic,
      question: item.body,
      options: [],
      recommendation: "lead decides if Pablo does not answer within 24h",
      owner: item.to,
      created_at: new Date().toISOString(),
      status: "open",
    },
  ];
  writePabloInput(text, nextItems);
}

function readInbox(filePath) {
  if (!fs.existsSync(filePath)) return { text: "", inbox: [] };
  const text = fs.readFileSync(filePath, "utf8");
  const match = text.match(/<!-- inbox:data:start -->\s*```yaml\s*([\s\S]*?)```/);
  const parsed = match ? yaml.load(match[1]) : { inbox: [] };
  return { text, inbox: parsed?.inbox ?? [] };
}

function writeInbox(filePath, text, inbox) {
  const dumped = yaml.dump({ inbox }, { lineWidth: 100, noRefs: true });
  const next = text.replace(
    /<!-- inbox:data:start -->\s*```yaml\s*[\s\S]*?```\s*<!-- inbox:data:end -->/,
    `<!-- inbox:data:start -->\n\`\`\`yaml\n${dumped}\`\`\`\n<!-- inbox:data:end -->`,
  );
  fs.writeFileSync(filePath, next);
}

function readPabloInput() {
  if (!fs.existsSync(PABLO_PATH)) return { text: "", items: [] };
  const text = fs.readFileSync(PABLO_PATH, "utf8");
  const match = text.match(/<!-- pablo:data:start -->\s*```yaml\s*([\s\S]*?)```/);
  const parsed = match ? yaml.load(match[1]) : { items: [] };
  return { text, items: parsed?.items ?? [] };
}

function writePabloInput(text, items) {
  const dumped = yaml.dump({ items }, { lineWidth: 100, noRefs: true });
  const next = text.replace(
    /<!-- pablo:data:start -->\s*```yaml\s*[\s\S]*?```\s*<!-- pablo:data:end -->/,
    `<!-- pablo:data:start -->\n\`\`\`yaml\n${dumped}\`\`\`\n<!-- pablo:data:end -->`,
  );
  fs.writeFileSync(PABLO_PATH, next);
}

function getSection(text, heading) {
  const start = text.indexOf(heading);
  if (start === -1) return "";
  const rest = text.slice(start + heading.length);
  const next = rest.search(/\n## /);
  return next === -1 ? rest : rest.slice(0, next);
}

main();
