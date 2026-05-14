#!/usr/bin/env node

import { spawnSync } from "node:child_process";

function run(command, args) {
  return spawnSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function print(output) {
  if (output.trim()) process.stdout.write(output);
  if (output && !output.endsWith("\n")) process.stdout.write("\n");
}

const validate = run("node", ["scripts/simulador/validate-contracts.mjs"]);
print(validate.stdout);
print(validate.stderr);

if (validate.status !== 0) {
  process.exit(validate.status ?? 1);
}

const typecheck = run("node", ["scripts/simulador/typecheck-scope.mjs"]);
print(typecheck.stdout);
print(typecheck.stderr);

if (typecheck.status !== 0) {
  process.exit(typecheck.status ?? 1);
}
