#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const ROOT = process.cwd();
const RESEARCH_DIR = path.join(ROOT, "docs/research");
const BOARD_PATH = path.join(ROOT, "docs/coord/BUILD_BOARD.yaml");

function main() {
  const board = yaml.load(fs.readFileSync(BOARD_PATH, "utf8"));
  const existing = new Set((board.tasks ?? []).map((task) => task.id));
  const decisions = findResearchDecisions();
  let added = 0;

  for (const decision of decisions) {
    if (!decision.id || existing.has(decision.id)) continue;
    board.tasks.push({
      id: decision.id,
      title: decision.decision ?? "research decision",
      owner: decision.owner ?? "shared",
      reviewer: decision.owner === "codex" ? "claude" : "codex",
      status: "backlog",
      depends_on: decision.blocked_by ?? [],
      dod: [
        `apply research decision from ${decision.source_file}`,
        `touch files: ${(decision.files_to_touch ?? []).join(", ") || "TBD"}`,
      ],
      notes: `change_type=${decision.change_type ?? "unknown"}`,
    });
    added += 1;
  }

  if (added > 0) {
    board.updated_at = new Date().toISOString();
    fs.writeFileSync(BOARD_PATH, yaml.dump(board, { lineWidth: 120, noRefs: true }));
  }
  console.log(`research sync OK (${added} tasks added)`);
}

function findResearchDecisions() {
  if (!fs.existsSync(RESEARCH_DIR)) return [];
  const files = walk(RESEARCH_DIR).filter((file) => file.endsWith(".md"));
  const decisions = [];
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(/```yaml\s*([\s\S]*?decisions:[\s\S]*?)```/g)) {
      const parsed = yaml.load(match[1]);
      for (const decision of parsed?.decisions ?? []) {
        decisions.push({ ...decision, source_file: path.relative(ROOT, file) });
      }
    }
  }
  return decisions;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

main();
