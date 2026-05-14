#!/usr/bin/env node

import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const targets = [
  "app/simulator-design",
  "app/(app)",
  "app/(public)",
  "app/_data_simulador_temp",
  "app/api/transcribe",
  "lib/simulador",
  "scripts/simulador",
  "scripts/dev-simulador.mjs",
  "scripts/kill-dev.mjs",
];

const existingTargets = targets.filter((target) => existsSync(target));

if (existingTargets.length === 0) {
  console.log("No simulator lint targets found.");
  process.exit(0);
}

const eslint = process.platform === "win32"
  ? "node_modules/.bin/eslint.cmd"
  : "node_modules/.bin/eslint";

const result = spawnSync(eslint, existingTargets, { stdio: "inherit" });
process.exit(result.status ?? 1);
