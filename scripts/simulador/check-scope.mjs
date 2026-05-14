#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const scopedPrefixes = [
  "app/simulator-design/",
  "app/api/transcribe/",
  "lib/simulador/",
  "scripts/simulador/",
];

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

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const typecheck = run(npx, ["tsc", "--noEmit", "--pretty", "false"]);
const typecheckOutput = `${typecheck.stdout}${typecheck.stderr}`;
const lines = typecheckOutput.split(/\r?\n/).filter(Boolean);
const scopedErrors = lines.filter((line) => {
  const normalized = line.replace(/^\.\//, "");
  return scopedPrefixes.some((prefix) => normalized.startsWith(prefix));
});
const allErrors = lines.filter((line) => /\berror TS\d+:/u.test(line));

if (scopedErrors.length > 0) {
  console.error("\nScoped typecheck failed:");
  for (const line of scopedErrors) console.error(line);
  process.exit(1);
}

console.log(
  `Scoped typecheck OK (${allErrors.length} legacy TypeScript errors ignored outside simulator scope).`,
);
