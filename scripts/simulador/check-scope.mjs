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

const assembled = run("node", ["scripts/simulador/check-assembled-case.mjs"]);
print(assembled.stdout);
print(assembled.stderr);

if (assembled.status !== 0) {
  process.exit(assembled.status ?? 1);
}

// Copy lint (em dash, acrónimos, anti-spoiler) sobre TODOS los casos ensamblados.
// Corre aquí además de en el loop del motor, para que un caso editado a mano
// también pase el gate de copy en el check principal.
const copyLint = run("node", ["scripts/simulador/lint-case-copy.mjs"]);
print(copyLint.stdout);
print(copyLint.stderr);

if (copyLint.status !== 0) {
  process.exit(copyLint.status ?? 1);
}

const typecheck = run("node", ["scripts/simulador/typecheck-scope.mjs"]);
print(typecheck.stdout);
print(typecheck.stderr);

if (typecheck.status !== 0) {
  process.exit(typecheck.status ?? 1);
}
