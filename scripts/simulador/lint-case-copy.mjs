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

// Claves que NO se renderizan como prosa al participante: judge_internal +
// estructurales (ids, urls, tipos, canales). No se revisan para evitar falsos
// positivos (ej. un acrónimo en una URL o en un id).
const SKIP_KEYS = new Set([
  // judge_internal
  "hint", "example", "issue", "goodWhen",
  // estructurales / no-prosa
  "id", "src", "kind", "channel", "block_id", "slot", "direction",
  "actionStyle", "key", "timestamp", "avatar",
]);

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

const ACRONYM_RE_G = new RegExp(`\\b(${FORBIDDEN_ACRONYMS.join("|")})\\b`, "g");

function checkString(str, where) {
  if (/[—–]/.test(str)) {
    issues.push(`${where}: em dash prohibido · "${snippet(str)}"`);
  }
  const found = new Set();
  for (const m of str.matchAll(ACRONYM_RE_G)) found.add(m[1]);
  for (const a of found) {
    issues.push(`${where}: acrónimo prohibido "${a}" · "${snippet(str)}"`);
  }
}

// Anti-spoiler determinista. El texto VISIBLE de una opción debe describir o
// encarnar la elección, nunca EVALUARLA ni revelar cuál es la correcta. Estas
// frases (veredicto, meta-comentario, "la correcta") son lo que el juez narrativo
// cazaba a mano; aquí cerramos el hueco para la clase clara, barato y siempre.
// Principio de diseño de evaluación: la clave no se telegrafía en las opciones.
// Veredicto/meta-comentario que evalúa la opción (aplica a título y cuerpo).
const SPOILER_PATTERNS = [
  /cumple (con )?(todo|lo pedido|la regla|los requisitos|las reglas)/i,
  /\bno cumple\b/i,
  /\bes (un|el) error\b/i,
  /\bno se debe/i,
  /\bes (lo|la) correct[oa]\b/i,
  /\bes (correcto|incorrect[oa])\b/i,
  /\b(la|una|el|lo) (mejor|peor) (opci[óo]n|versi[óo]n|respuesta|elecci[óo]n)\b/i,
  /\b(opci[óo]n|respuesta) (correcta|esperada|recomendada)\b/i,
  /\bno es (el |un )?(segmento|lote)\b/i,
  /\b(no )?(es )?(apta|apto) para env[íi]o\b/i,
  /\bno es de env[íi]o\b/i,
  /\belegir(lo|la) (es|ser[íi]a)\b/i,
  /\b(viola|incumple|rompe) (la )?(regla|pol[íi]tica)\b/i,
];

// Títulos que NOMBRAN la falla del distractor (telegrafían sin decir "error").
// Solo se aplican a títulos de opción, no a cuerpos (un cuerpo puede describir
// contenido sensible legítimamente; un título que lo etiqueta es spoiler).
const TITLE_SPOILER_PATTERNS = [
  /\b(con|tono de) presi[oó]n\b/i,
  /\bsin enlace (de baja|para darse de baja)\b/i,
  /\bcon dato(s)? (de salud|sensible(s)?|personal(es)?)\b/i,
  /\bsin consentimiento\b/i,
  /\bpromete (monto|reembolso|resultado|plazo|descuento|fecha)\b/i,
  /\b(cifra|dato|monto|n[úu]mero)s? inventad[oa]s?\b/i,
  // Adjetivos de tono con valencia: como TÍTULO de una opción telegrafían cuál
  // "suena bien/mal" cuando el tono es parte de lo evaluado. (Neutros como
  // "directo", "formal", "breve", "sobrio" NO entran: describen forma, no calidad.)
  /^\s*(tono )?(agresivo|culposo|amenazante|insistente|cordial|c[áa]lido|urgente|apremiante|hostil|brusco)\s*$/i,
];

function checkSpoiler(str, where, isTitle = false) {
  for (const re of SPOILER_PATTERNS) {
    if (re.test(str)) {
      issues.push(`${where}: spoiler · el texto visible revela o evalúa la opción · "${snippet(str)}"`);
      return;
    }
  }
  if (isTitle) {
    for (const re of TITLE_SPOILER_PATTERNS) {
      if (re.test(str)) {
        issues.push(`${where}: spoiler · el título nombra la falla del distractor · "${snippet(str)}"`);
        return;
      }
    }
  }
}

// Fixtures anti-spoiler: regresión de la clase. `--selftest` los corre contra los
// patrones reales (deben marcar los spoilers y dejar pasar el copy limpio).
function runSpoilerSelfTest() {
  const fixtures = [
    // [texto, esTitulo, debeMarcar]
    ["Cumple todo", false, true],
    ["No es segmento de envío: elegirlo es el error", false, true],
    ["No se debe", false, true],
    ["Respuesta esperada", false, true],
    ["Respuesta recomendada", false, true],
    ["Opción recomendada", false, true],
    ["Con presión", true, true],
    ["Tono de presión", true, true],
    ["Con dato de salud", true, true],
    ["Promete monto", true, true],
    ["Montos inventados", true, true],
    ["Insistente", true, true],
    ["Cordial", true, true],
    // limpios (NO deben marcar)
    ["Te contactaremos con el resultado en un máximo de 72 horas.", false, false],
    ["Disponibilidad", true, false],
    ["Versión 1", true, false],
    ["Con evidencia", true, false],
    ["Formal", true, false],
    ["El reclamo de robo de $3,400 que todavía no tiene evidencia adjunta.", false, false],
  ];
  let fail = 0;
  for (const [str, isTitle, expect] of fixtures) {
    const before = issues.length;
    checkSpoiler(str, "selftest", isTitle);
    const flagged = issues.length > before;
    if (flagged !== expect) {
      console.error(`SELFTEST FAIL: "${str}" (title=${isTitle}) flagged=${flagged} expected=${expect}`);
      fail++;
    }
  }
  issues.length = 0;
  if (fail) {
    console.error(`anti-spoiler selftest: ${fail} fallo(s)`);
    process.exit(1);
  }
  console.log(`anti-spoiler selftest OK (${fixtures.length} fixtures)`);
  process.exit(0);
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
      if (SKIP_KEYS.has(key)) continue; // judge_internal o estructural no visible
      walk(value, where ? `${where}.${key}` : key);
    }
  }
}

const rawArgs = process.argv.slice(2);
const jsonMode = rawArgs.includes("--json");
if (rawArgs.includes("--selftest")) runSpoilerSelfTest();
const argPath = rawArgs.find((a) => !a.startsWith("--"));
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
      // Anti-spoiler: bloques donde el participante ELIGE entre opciones. El
      // texto visible de cada opción no debe revelar ni evaluar cuál es correcta.
      if (slide.block_id === "ai_comparison") {
        (slide.content?.options ?? []).forEach((opt, i) => {
          checkSpoiler(String(opt.title ?? ""), `${where}.options[${i}].title`, true);
          checkSpoiler(String(opt.body ?? ""), `${where}.options[${i}].body`);
        });
      }
      if (slide.block_id === "tradeoff_decision_memo") {
        (slide.content?.decisions ?? []).forEach((d, i) => {
          checkSpoiler(String(d.title ?? ""), `${where}.decisions[${i}].title`, true);
          checkSpoiler(String(d.detail ?? ""), `${where}.decisions[${i}].detail`);
        });
      }
    });
  });
  // El correo de asignación y el brief también son copy visible.
  if (ca.manager_outcome?.assignment_brief) {
    checkString(String(ca.manager_outcome.assignment_brief), `${id}/assignment_brief`);
  }
}

function parseIssue(msg) {
  const m = String(msg).match(/^([a-z0-9_]+)\/([a-z]+)\/slot(\d+)/i);
  return {
    gate: "copy",
    section: m?.[2] ?? null,
    slot: m?.[3] ? Number(m[3]) : null,
    message: String(msg),
  };
}

if (jsonMode) {
  console.log(JSON.stringify(issues.map(parseIssue)));
  process.exit(issues.length > 0 ? 1 : 0);
}

if (issues.length > 0) {
  for (const issue of issues) console.error(`COPY_LINT ERROR ${issue}`);
  process.exit(1);
}

console.log(`copy lint OK (${targets.length})`);
