#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const ROOT = process.cwd();
const BOARD_PATH = path.join(ROOT, "docs/coord/BUILD_BOARD.yaml");
const VALID_STATUS = new Set(["backlog", "in_progress", "review", "blocked", "done"]);
const VALID_OWNER = new Set(["claude", "codex", "shared", "pablo"]);

const issues = [];

function main() {
  if (!fs.existsSync(BOARD_PATH)) fail("board file missing: docs/coord/BUILD_BOARD.yaml");

  const board = yaml.load(fs.readFileSync(BOARD_PATH, "utf8"));
  if (!board || typeof board !== "object") fail("board yaml did not parse to an object");
  if (!Array.isArray(board.tasks)) fail("board.tasks must be an array");

  const taskIds = new Set();
  const tasksById = new Map();

  for (const [index, task] of board.tasks.entries()) {
    const scope = `tasks[${index}]`;
    required(task.id, `${scope}.id`);
    required(task.title, `${scope}.title`);
    required(task.owner, `${scope}.owner`);
    required(task.reviewer, `${scope}.reviewer`);
    required(task.status, `${scope}.status`);
    if (!Array.isArray(task.depends_on)) addIssue(`${task.id ?? scope}.depends_on must be an array`);
    if (!Array.isArray(task.dod) || task.dod.length === 0) addIssue(`${task.id ?? scope}.dod must be a non-empty array`);
    if (task.claimed_by && !VALID_OWNER.has(task.claimed_by)) addIssue(`${task.id}.claimed_by invalid: ${task.claimed_by}`);
    if (task.claimed_by && task.claim_expires_at && Number.isNaN(new Date(task.claim_expires_at).getTime())) {
      addIssue(`${task.id}.claim_expires_at invalid date: ${task.claim_expires_at}`);
    }

    if (task.id) {
      if (taskIds.has(task.id)) addIssue(`duplicate task id: ${task.id}`);
      taskIds.add(task.id);
      tasksById.set(task.id, task);
    }

    if (task.status && !VALID_STATUS.has(task.status)) addIssue(`${task.id}.status invalid: ${task.status}`);
    if (task.owner && !VALID_OWNER.has(task.owner)) addIssue(`${task.id}.owner invalid: ${task.owner}`);
    if (task.reviewer && !VALID_OWNER.has(task.reviewer)) addIssue(`${task.id}.reviewer invalid: ${task.reviewer}`);
  }

  for (const task of board.tasks) {
    for (const dep of task.depends_on ?? []) {
      if (!taskIds.has(dep)) addIssue(`${task.id}.depends_on references missing task: ${dep}`);
      if (dep === task.id) addIssue(`${task.id}.depends_on cannot reference itself`);
    }
  }

  detectCycles(tasksById);

  if (issues.length > 0) {
    for (const issue of issues) console.error(`BOARD_LINT ${issue}`);
    process.exit(1);
  }

  console.log(`coord board OK (${board.tasks.length} tasks)`);
}

function detectCycles(tasksById) {
  const visiting = new Set();
  const visited = new Set();

  function visit(id, stack) {
    if (visiting.has(id)) {
      addIssue(`dependency cycle: ${[...stack, id].join(" -> ")}`);
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    const task = tasksById.get(id);
    for (const dep of task?.depends_on ?? []) {
      if (tasksById.has(dep)) visit(dep, [...stack, id]);
    }
    visiting.delete(id);
    visited.add(id);
  }

  for (const id of tasksById.keys()) visit(id, []);
}

function required(value, pathName) {
  if (value === undefined || value === null || value === "") addIssue(`${pathName} is required`);
}

function addIssue(message) {
  issues.push(message);
}

function fail(message) {
  console.error(`BOARD_LINT ${message}`);
  process.exit(1);
}

main();
