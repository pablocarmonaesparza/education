// Corre los gates sobre un YAML de caso y devuelve findings ESTRUCTURADOS para
// la reparacion por slide. Orden barato -> caro: deterministas primero; el juez
// narrativo (LLM) solo se corre sobre un caso ya estructuralmente valido.

import { execFileSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();

function runJsonGate(script, file, extraArgs = []) {
  try {
    const stdout = execFileSync(
      "node",
      [path.join("scripts/simulador", script), file, "--json", ...extraArgs],
      { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );
    return { pass: true, findings: safeParse(stdout) };
  } catch (err) {
    return { pass: false, findings: safeParse(err.stdout?.toString?.() ?? "") };
  }
}

function safeParse(s) {
  try {
    return JSON.parse(s || "[]");
  } catch {
    return [];
  }
}

export function runDeterministicGates(yamlPath, opts = {}) {
  const assembled = runJsonGate(
    "check-assembled-case.mjs",
    yamlPath,
    opts.structureOnly ? ["--structure-only"] : [],
  );
  const copy = runJsonGate("lint-case-copy.mjs", yamlPath);
  return {
    pass: assembled.pass && copy.pass,
    findings: [...assembled.findings, ...copy.findings],
    assembled,
    copy,
  };
}

function parseSlideRef(ref) {
  const m = String(ref ?? "").match(/([a-z]+)\/slot\s*(\d+)/i);
  return m ? { section: m[1], slot: Number(m[2]) } : { section: null, slot: null };
}

export function runNarrativeJudge(yamlPath, biblePath, opts = {}) {
  const args = [
    path.join("scripts/simulador", "judge-narrative.mjs"),
    yamlPath,
    "--json",
    "--runs",
    String(opts.runs ?? 2),
  ];
  if (biblePath) args.push("--bible", biblePath);
  let stdout;
  let pass;
  try {
    stdout = execFileSync("node", args, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 16 * 1024 * 1024,
    });
    pass = true;
  } catch (err) {
    stdout = err.stdout?.toString?.() ?? "";
    pass = false;
  }
  const results = safeParse(stdout);
  const findings = [];
  for (const r of results) {
    for (const f of r.grounded ?? []) {
      const { section, slot } = parseSlideRef(f.slide);
      findings.push({
        gate: "narrative",
        judge: r.judge,
        type: f.type,
        section,
        slot,
        evidence: f.evidence,
        fix: f.fix,
        message: `${f.type} @ ${f.slide}: ${f.evidence ?? ""}`,
      });
    }
  }
  return { pass, findings };
}

// Agrupa findings por "<section>/<slot>" para reparar slide por slide. Los que no
// apuntan a un slide concreto van bajo "_global".
export function groupFindingsBySlide(findings) {
  const groups = {};
  for (const f of findings) {
    const key = f.section && f.slot ? `${f.section}/${f.slot}` : "_global";
    (groups[key] ??= []).push(f);
  }
  return groups;
}

export function summarizeFindings(findings) {
  if (findings.length === 0) return "sin findings";
  const byGate = {};
  for (const f of findings) byGate[f.gate] = (byGate[f.gate] ?? 0) + 1;
  return Object.entries(byGate)
    .map(([g, n]) => `${g}:${n}`)
    .join(" · ");
}
