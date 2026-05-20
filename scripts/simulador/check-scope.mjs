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

const spoiler = run("node", ["scripts/simulador/check-field-test-spoilers.mjs"]);
print(spoiler.stdout);
print(spoiler.stderr);

if (spoiler.status !== 0) {
  process.exit(spoiler.status ?? 1);
}

const analytics = run("node", ["scripts/simulador/check-analytics-catalog.mjs"]);
print(analytics.stdout);
print(analytics.stderr);

if (analytics.status !== 0) {
  process.exit(analytics.status ?? 1);
}

const emailTemplates = run("node", [
  "scripts/simulador/check-email-templates.mjs",
]);
print(emailTemplates.stdout);
print(emailTemplates.stderr);

if (emailTemplates.status !== 0) {
  process.exit(emailTemplates.status ?? 1);
}

const calibration = run("node", ["scripts/simulador/check-judge-calibration.mjs"]);
print(calibration.stdout);
print(calibration.stderr);

if (calibration.status !== 0) {
  process.exit(calibration.status ?? 1);
}

const caseFactory = run("node", ["scripts/simulador/check-case-factory.mjs"]);
print(caseFactory.stdout);
print(caseFactory.stderr);

if (caseFactory.status !== 0) {
  process.exit(caseFactory.status ?? 1);
}

const typecheck = run("node", ["scripts/simulador/typecheck-scope.mjs"]);
print(typecheck.stdout);
print(typecheck.stderr);

if (typecheck.status !== 0) {
  process.exit(typecheck.status ?? 1);
}
