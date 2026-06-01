#!/usr/bin/env node
// CLI del generador de casos · pipeline + loop de autocorreccion.
//   node scripts/simulador/gen/generate-case.mjs <brief.yaml> [--out <dir>] [--max-attempts 3]
//
// Pipeline: brief -> normaliza -> biblia -> blueprint (receta) -> autor.
// Loop: corre gates (deterministas + juez narrativo); si fallan, repara los
// slides señalados y reintenta. Maximo 3 intentos; si no pasa, HUMAN_REVIEW con
// el diagnostico. Artefactos auditables por corrida en runs/<ts>__<case_id>/.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { runPipeline, toYaml } from "./pipeline.mjs";
import {
  runDeterministicGates,
  runNarrativeJudge,
  groupFindingsBySlide,
  summarizeFindings,
} from "./gates/run-gates.mjs";
import { repairSlide, autofixCopy } from "./steps/repair-slide.mjs";
import yaml from "js-yaml";

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
  console.error("uso: node scripts/simulador/gen/generate-case.mjs <brief.yaml> [--out dir] [--max-attempts 3]");
  process.exit(2);
}
const maxAttempts = Number(flags["max-attempts"] ?? 3);
const log = (m) => console.log(m);

function ts() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function buildStory(ca) {
  return (ca.sections ?? [])
    .map(
      (s) =>
        `${s.id}: ` +
        (s.slides ?? []).map((sl) => `(${sl.slot}) ${sl.title}`).join(" | "),
    )
    .join("\n");
}

const rawBrief = yaml.load(fs.readFileSync(briefPath, "utf8"));
const { brief, bible, blueprint, caseAssembly } = await runPipeline(rawBrief, {
  log,
});

const runDir =
  flags.out ??
  path.join(ROOT, "docs/simulador/case_factory/runs", `${ts()}__${brief.case_id}`);
fs.mkdirSync(runDir, { recursive: true });
fs.writeFileSync(path.join(runDir, "brief.normalized.json"), JSON.stringify(brief, null, 2));
const biblePath = path.join(runDir, "bible.json");
fs.writeFileSync(biblePath, JSON.stringify(bible, null, 2));
fs.writeFileSync(path.join(runDir, "blueprint.json"), JSON.stringify(blueprint.slides, null, 2));

// ---- Loop de autocorreccion ----
const ca = caseAssembly.case_assembly;
const attemptsLog = [];
let result = "PASS";

log("");
log(`loop de autocorreccion (max ${maxAttempts} intentos)`);
for (let attempt = 1; ; attempt++) {
  autofixCopy(ca); // barato: quita guiones largos antes de gastar el gate
  const attemptPath = path.join(runDir, `attempt-${attempt}.yaml`);
  fs.writeFileSync(attemptPath, toYaml({ case_assembly: ca }));

  const det = runDeterministicGates(attemptPath);
  let narrative = { pass: true, findings: [] };
  if (det.pass) narrative = runNarrativeJudge(attemptPath, biblePath);
  const findings = [...det.findings, ...narrative.findings];
  const passed = det.pass && narrative.pass;

  log(
    `  intento ${attempt}: deterministas=${det.pass ? "PASS" : "FAIL"} · juez=${det.pass ? (narrative.pass ? "PASS" : "FAIL") : "(no corrido)"} · ${summarizeFindings(findings)}`,
  );
  attemptsLog.push({
    n: attempt,
    deterministic: det.pass,
    narrative: det.pass ? narrative.pass : null,
    findings,
  });

  if (passed) {
    fs.writeFileSync(path.join(runDir, "final.yaml"), toYaml({ case_assembly: ca }));
    break;
  }
  if (attempt >= maxAttempts) {
    result = "HUMAN_REVIEW";
    break;
  }

  // Reparacion por slide.
  const groups = groupFindingsBySlide(findings);
  const story = buildStory(ca);
  for (const [key, fnds] of Object.entries(groups)) {
    if (key === "_global") {
      log(`     findings sin slide concreto (${fnds.length}); van a diagnostico`);
      continue;
    }
    const [secId, slotStr] = key.split("/");
    const slot = Number(slotStr);
    const sec = ca.sections.find((s) => s.id === secId);
    const slide = sec?.slides.find((sl) => sl.slot === slot);
    if (!slide) continue;
    log(`     reparando ${key} (${fnds.length} findings)...`);
    const repaired = await repairSlide(slide, fnds, bible, secId, story);
    Object.assign(slide, repaired);
  }
}

// ---- Run record ----
const lastFindings = attemptsLog[attemptsLog.length - 1].findings;
const runRecord = {
  case_id: brief.case_id,
  level: brief.level,
  result,
  attempts: attemptsLog.map((a) => ({
    n: a.n,
    deterministic: a.deterministic,
    narrative: a.narrative,
    findingsCount: a.findings.length,
  })),
  unresolved: result === "HUMAN_REVIEW" ? lastFindings : [],
};
fs.writeFileSync(path.join(runDir, "run-record.json"), JSON.stringify(runRecord, null, 2));

log("");
log(`artefactos: ${path.relative(ROOT, runDir)}`);
if (result === "PASS") {
  log(`RESULTADO: PASS · final.yaml en ${attemptsLog.length} intento(s)`);
} else {
  log(`RESULTADO: HUMAN_REVIEW tras ${attemptsLog.length} intentos`);
  log("diagnostico (findings sin resolver):");
  for (const f of lastFindings.slice(0, 12))
    log(`  - [${f.gate}] ${f.section ?? "?"}/${f.slot ?? "?"}: ${f.message ?? f.criterion ?? f.type}`);
}
process.exit(result === "PASS" ? 0 : 1);
