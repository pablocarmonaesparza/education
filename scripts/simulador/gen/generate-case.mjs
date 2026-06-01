#!/usr/bin/env node
// CLI del generador de casos.
//   node scripts/simulador/gen/generate-case.mjs <brief.yaml> [--out <dir>]
//
// Bloque A: una pasada del pipeline + corre los gates deterministas y reporta.
// El loop de autocorreccion (Bloque B) se agrega despues.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";
import { runPipeline, toYaml } from "./pipeline.mjs";
import { runDeterministicGates, summarizeGates } from "./gates/run-gates.mjs";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? true];
    }),
);
const briefPath = args.find((a) => !a.startsWith("--"));

if (!briefPath) {
  console.error("uso: node scripts/simulador/gen/generate-case.mjs <brief.yaml> [--out <dir>]");
  process.exit(2);
}

const rawBrief = yaml.load(fs.readFileSync(briefPath, "utf8"));

function ts() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

const log = (m) => console.log(m);

const { brief, bible, blueprint, caseAssembly } = await runPipeline(rawBrief, {
  log,
});

const runDir =
  flags.out ??
  path.join(
    ROOT,
    "docs/simulador/case_factory/runs",
    `${ts()}__${brief.case_id}`,
  );
fs.mkdirSync(runDir, { recursive: true });

fs.writeFileSync(
  path.join(runDir, "brief.normalized.json"),
  JSON.stringify(brief, null, 2),
);
fs.writeFileSync(path.join(runDir, "bible.json"), JSON.stringify(bible, null, 2));
fs.writeFileSync(
  path.join(runDir, "blueprint.json"),
  JSON.stringify(blueprint.slides, null, 2),
);
const attemptPath = path.join(runDir, "attempt-1.yaml");
fs.writeFileSync(attemptPath, toYaml(caseAssembly));

log("");
log(`artefactos en: ${path.relative(ROOT, runDir)}`);
log("corriendo gates deterministas...");
const gates = runDeterministicGates(attemptPath);
log(`gates: ${summarizeGates(gates)}`);
if (!gates.assembled.pass) {
  log("--- check-assembled (primeros errores) ---");
  log(gates.assembled.stderr.split("\n").slice(0, 12).join("\n"));
}
if (!gates.copy.pass) {
  log("--- lint-copy (primeros errores) ---");
  log(gates.copy.stderr.split("\n").slice(0, 8).join("\n"));
}
log("");
log(gates.pass ? "RESULTADO: PASS (Bloque A)" : "RESULTADO: FAIL (esperado en Bloque A, sin loop todavia)");
