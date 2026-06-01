// Corre los gates deterministas sobre un YAML de caso ensamblado y devuelve un
// resultado estructurado. Bloque A: por exit code. Bloque B agrega parsing de
// findings (--json) para la reparacion por slide.

import { execFileSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();

function runOne(script, file, extraArgs = []) {
  try {
    const stdout = execFileSync(
      "node",
      [path.join("scripts/simulador", script), file, ...extraArgs],
      { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" },
    );
    return { pass: true, stdout, stderr: "" };
  } catch (err) {
    return {
      pass: false,
      stdout: err.stdout?.toString?.() ?? "",
      stderr: err.stderr?.toString?.() ?? String(err.message ?? err),
    };
  }
}

/**
 * @param {string} yamlPath
 * @param {{structureOnly?:boolean}} [opts]
 */
export function runDeterministicGates(yamlPath, opts = {}) {
  const assembledArgs = opts.structureOnly ? ["--structure-only"] : [];
  const assembled = runOne("check-assembled-case.mjs", yamlPath, assembledArgs);
  const copy = runOne("lint-case-copy.mjs", yamlPath);
  return {
    pass: assembled.pass && copy.pass,
    assembled,
    copy,
  };
}

export function summarizeGates(result) {
  const parts = [
    `assembled=${result.assembled.pass ? "PASS" : "FAIL"}`,
    `copy=${result.copy.pass ? "PASS" : "FAIL"}`,
  ];
  return parts.join(" · ");
}
