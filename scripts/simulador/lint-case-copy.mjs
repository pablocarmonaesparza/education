#!/usr/bin/env node

// Lint determinista de copy sobre el copy VISIBLE de un caso ensamblado.
// Reglas (de docs/memory/copy_*.md y CASE_ASSEMBLY_SCHEMA.copy_rules):
//   - Cero em dash (— o –). Usar punto, coma o paréntesis.
//   - Cero acrónimos corporativos/técnicos en prosa (PII, KPI, CRM, ...).
//     "IA" SÍ se permite (es la excepción). "APIs/MCPs" en plural se prohíbe.
// Salta los campos judge_internal (hint, example, issue, goodWhen) porque no se
// renderizan al participante.
//
// Uso:
//   node scripts/simulador/lint-case-copy.mjs <ruta.yaml>   # un archivo
//   node scripts/simulador/lint-case-copy.mjs               # todos en cases_assembled/

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const ROOT = process.cwd();
const CASES_DIR = path.join(ROOT, "docs/simulador/contrato_v0/cases_assembled");

const JUDGE_INTERNAL = new Set(["hint", "example", "issue", "goodWhen"]);

// Acrónimos prohibidos en prosa de casos. NO incluye IA (permitido), ni API/MCP
// en singular. Incluye los plurales prohibidos (APIs, MCPs).
const FORBIDDEN_ACRONYMS = [
  "PII", "KPI", "KPIs", "CRM", "ERP", "ROI", "CTA", "B2B", "B2C", "SaaS",
  "MVP", "NPS", "SLA", "ARR", "MRR", "ICP", "FAQ", "UX", "UI", "CEO", "CFO",
  "CTO", "CMO", "SEO", "SEM", "LTV", "CAC", "OKR", "OKRs", "RFP", "SOP",
  "KYC", "GDPR", "CCPA", "APIs", "MCPs",
];
const ACRONYM_RE = new RegExp(`\\b(${FORBIDDEN_ACRONYMS.join("|")})\\b`);

const issues = [];

function snippet(s) {
  const one = s.replace(/\s+/g, " ").trim();
  return one.length > 70 ? one.slice(0, 70) + "…" : one;
}

function checkString(str, where) {
  if (/[—–]/.test(str)) {
    issues.push(`${where}: em dash prohibido · "${snippet(str)}"`);
  }
  const m = str.match(ACRONYM_RE);
  if (m) {
    issues.push(`${where}: acrónimo prohibido "${m[1]}" · "${snippet(str)}"`);
  }
}

function walk(node, where) {
  if (typeof node === "string") {
    checkString(node, where);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item, i) => walk(item, `${where}[${i}]`));
    return;
  }
  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (JUDGE_INTERNAL.has(key)) continue; // no se renderiza
      walk(value, where ? `${where}.${key}` : key);
    }
  }
}

const argPath = process.argv[2];
const targets = argPath
  ? [argPath]
  : fs.existsSync(CASES_DIR)
    ? fs
        .readdirSync(CASES_DIR)
        .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
        .map((f) => path.join(CASES_DIR, f))
    : [];

for (const fullPath of targets) {
  const ca = yaml.load(fs.readFileSync(fullPath, "utf8"))?.case_assembly;
  const id = ca?.case_id ?? path.basename(fullPath);
  if (!ca) {
    issues.push(`${path.basename(fullPath)}: sin case_assembly`);
    continue;
  }
  (ca.sections ?? []).forEach((sec) => {
    (sec.slides ?? []).forEach((slide) => {
      const where = `${id}/${sec.id}/slot${slide.slot}`;
      checkString(String(slide.title ?? ""), `${where}.title`);
      checkString(String(slide.body ?? ""), `${where}.body`);
      if (slide.content) walk(slide.content, `${where}.content`);
    });
  });
  // El correo de asignación y el brief también son copy visible.
  if (ca.manager_outcome?.assignment_brief) {
    checkString(String(ca.manager_outcome.assignment_brief), `${id}/assignment_brief`);
  }
}

if (issues.length > 0) {
  for (const issue of issues) console.error(`COPY_LINT ERROR ${issue}`);
  process.exit(1);
}

console.log(`copy lint OK (${targets.length})`);
