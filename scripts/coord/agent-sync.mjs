#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const ROOT = process.cwd();
const BOARD_PATH = path.join(ROOT, "docs/coord/BUILD_BOARD.yaml");
const BLOCKERS_PATH = path.join(ROOT, "docs/coord/BLOCKERS.md");
const INBOX_PATHS = {
  claude: path.join(ROOT, "docs/coord/INBOX_CLAUDE.md"),
  codex: path.join(ROOT, "docs/coord/INBOX_CODEX.md"),
};

const agent = process.argv.includes("--for")
  ? process.argv[process.argv.indexOf("--for") + 1]
  : null;

function main() {
  const board = yaml.load(fs.readFileSync(BOARD_PATH, "utf8"));
  const tasks = board.tasks ?? [];
  const filtered = agent ? tasks.filter((task) => task.owner === agent || task.reviewer === agent || task.owner === "shared") : tasks;

  console.log(`# coord sync${agent ? ` for ${agent}` : ""}`);
  printTasks("in_progress", filtered);
  printTasks("review", filtered);
  printTasks("blocked", filtered);
  printInbox("claude");
  printInbox("codex");
  printOpenBlockers();
}

function printTasks(status, tasks) {
  const matching = tasks.filter((task) => task.status === status);
  console.log(`\n## ${status} (${matching.length})`);
  for (const task of matching) {
    console.log(`- ${task.id} · ${task.owner} -> ${task.reviewer} · ${task.title}`);
  }
}

function printInbox(name) {
  const inbox = readInbox(INBOX_PATHS[name]);
  const open = inbox.filter((item) => item.status === "open" || item.status === "acknowledged");
  console.log(`\n## inbox ${name} (${open.length} open)`);
  for (const item of open) {
    console.log(`- ${item.priority} · ${item.id} · ${item.task_id ?? "no-task"} · ${item.topic}`);
  }
}

function printOpenBlockers() {
  const text = fs.existsSync(BLOCKERS_PATH) ? fs.readFileSync(BLOCKERS_PATH, "utf8") : "";
  const hasOpen = /## open blockers[\s\S]*?(?=\n## |$)/.test(text) && !/## open blockers\s*\n\s*None\./.test(text);
  console.log("\n## blockers");
  console.log(hasOpen ? "Open blockers present. Read docs/coord/BLOCKERS.md." : "No open blockers recorded.");
}

function readInbox(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, "utf8");
  const match = text.match(/<!-- inbox:data:start -->\s*```yaml\s*([\s\S]*?)```/);
  if (!match) return [];
  const parsed = yaml.load(match[1]);
  return parsed?.inbox ?? [];
}

main();
