#!/usr/bin/env node

// Lint determinista de copy sobre el copy VISIBLE de un caso ensamblado.
// El copy visible es INGLÉS DE NEGOCIOS DE EEUU (pivot 2026-07-15); los
// patrones anti-spoiler espejan las frases prohibidas de COPY_RULES
// (scripts/simulador/gen/prompts.mjs) y el glosario 00_EN_GLOSSARY.md.
// Reglas (de docs/memory/copy_*.md y CASE_ASSEMBLY_SCHEMA.copy_rules):
//   - Cero em dash (— o –). Usar punto, coma o paréntesis.
//   - Cero acrónimos corporativos/técnicos en prosa (PII, KPI, CRM, ...).
//     "AI" SÍ se permite (es la excepción). "APIs/MCPs" en plural se prohíbe.
//     Leyes US nunca por sigla (CCPA, CPRA, HIPAA, TCPA, CAN-SPAM).
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

// Acrónimos prohibidos en prosa de casos. NO incluye AI (la única sigla
// permitida por COPY_RULES), ni API/MCP en singular. Incluye los plurales
// prohibidos (APIs, MCPs) y las leyes US que nunca se nombran por sigla en
// texto visible (pivot EEUU: CCPA/CPRA/HIPAA/TCPA/CAN-SPAM se parafrasean
// como política de la empresa).
const FORBIDDEN_ACRONYMS = [
  "PII", "KPI", "KPIs", "CRM", "ERP", "ROI", "CTA", "B2B", "B2C", "SaaS",
  "MVP", "NPS", "SLA", "ARR", "MRR", "ICP", "FAQ", "UX", "UI", "CEO", "CFO",
  "CTO", "CMO", "SEO", "SEM", "LTV", "CAC", "OKR", "OKRs", "RFP", "SOP",
  "KYC", "GDPR", "CCPA", "CPRA", "HIPAA", "PHI", "TCPA", "CAN-SPAM", "APIs", "MCPs",
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

// Anti-spoiler determinista, en INGLÉS US (el copy visible de los casos es
// inglés desde el pivot EEUU 2026-07-15; estos patrones espejan las frases
// prohibidas de COPY_RULES en scripts/simulador/gen/prompts.mjs).
// El texto VISIBLE de una opción debe describir o encarnar la elección, nunca
// EVALUARLA ni revelar cuál es la correcta. Estas frases (veredicto,
// meta-comentario, "the correct one") son lo que el juez narrativo cazaba a
// mano; aquí cerramos el hueco para la clase clara, barato y siempre.
// Principio de diseño de evaluación: la clave no se telegrafía en las opciones.
// Veredicto/meta-comentario que evalúa la opción (aplica a título y cuerpo).
const SPOILER_PATTERNS = [
  /\bmeets (all )?(the )?(requirements?|rules?|policy|the ask)\b/i,
  /\bdoes not (meet|comply|follow the (rule|policy))\b/i,
  /\bis (the|a) mistake\b/i,
  /\bshould not be (chosen|picked|selected|sent|used)\b/i,
  /\bis (the )?correct\b/i,
  // "what/which is wrong" es instrucción legítima de un slide de review
  // ("mark what is wrong"); lo evaluativo es "Option B is wrong".
  /\b(?<!what )(?<!which )is (incorrect|wrong)\b/i,
  /\bthe (best|worst|right|wrong) (option|version|answer|choice|response|pick)\b/i,
  /\b(correct|expected|recommended) (option|answer|version|response|choice)\b/i,
  /\bnot the (segment|batch) to (send|use|pick|choose)\b/i,
  /\b(is|are)( not)? (fit|safe|cleared|approved) (for|to) send(ing)?\b/i,
  /\bchoosing (it|this one|that one) (is|would be)\b/i,
  /\b(violates|breaks|breaches) (the )?(rule|policy)\b/i,
  // Reveladores en narrativa/prompt: telegrafían la acción correcta o delatan un
  // distractor antes de decidir (van también sobre slide.body, no solo opciones).
  /\bif you \w+(ed)? (it |them |this |everything )?(right|correctly|properly|as you should)\b/i,
  /\bone (that|you) (must|should) not (touch|be touched|choose|be chosen|use|be used|send|be sent|include|be included)\b/i,
  /\b(nothing|no one|nobody|none of (them|those))[^.]{0,50}\b(appears?|shows? up) here\b/i,
];

// Títulos que NOMBRAN la falla del distractor (telegrafían sin decir "error").
// Solo se aplican a títulos de opción, no a cuerpos (un cuerpo puede describir
// contenido sensible legítimamente; un título que lo etiqueta es spoiler).
const TITLE_SPOILER_PATTERNS = [
  /\b(with|under) pressure\b/i,
  /\bwithout (an? )?(unsubscribe|opt[- ]out) (link|option)\b/i,
  /\bwith (health|sensitive|personal|medical) (data|info|information|details?)\b/i,
  /\bwithout consent\b/i,
  /\bpromises (a |an |the )?(amount|refund|result|deadline|discount|date|timeline)\b/i,
  /\b(made[- ]up|invented|fabricated|unverified) (figure|number|amount|stat|data)s?\b/i,
  // Adjetivos de tono con valencia: como TÍTULO de una opción telegrafían cuál
  // "suena bien/mal" cuando el tono es parte de lo evaluado. (Neutros como
  // "direct", "formal", "brief", "measured" NO entran: describen forma, no calidad.)
  /^\s*(tone[:\s]+)?(aggressive|guilt[- ]tripp(y|ing)|threatening|pushy|insistent|cordial|warm|urgent|hostile|harsh|nagging)( tone)?\s*$/i,
];

// Placeholders de campos de texto: son la PISTA de formato del input, no la
// respuesta. Un placeholder que da la instrucción/respuesta ("do not use the
// address", "remove the amount") spoilea lo que el participante debe escribir.
const PLACEHOLDER_SPOILER_PATTERNS = [
  /\b(do not|don't|never) (use|include|mention|confirm|invent|add|send|give|share|promise)\b/i,
  /\b(remove|delete|drop|exclude|strip|leave out) (the|any|all|your|their)\b/i,
  /\btreat the name\b/i,
  /\buse a generic greeting\b/i,
  /\b(lower|soften|tone down|dial back) the (tone|urgency|pressure)\b/i,
];

function checkPlaceholder(str, where) {
  for (const re of PLACEHOLDER_SPOILER_PATTERNS) {
    if (re.test(str)) {
      issues.push(`${where}: spoiler · el placeholder da la respuesta/instrucción · "${snippet(str)}"`);
      return;
    }
  }
}

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
    // [texto, esTitulo, debeMarcar] · en inglés US, espejo de los originales
    ["Meets all the requirements", false, true],
    ["Not the segment to send: choosing it is the mistake", false, true],
    ["Should not be chosen", false, true],
    ["Expected answer", false, true],
    ["Recommended answer", false, true],
    ["Recommended option", false, true],
    ["With pressure", true, true],
    ["Under pressure", true, true],
    ["With health data", true, true],
    ["Promises a refund", true, true],
    ["Invented figures", true, true],
    ["Insistent", true, true],
    ["Cordial", true, true],
    // reveladores en narrativa/prompt
    ["If you escalated correctly, no claim without evidence appears here.", false, true],
    ["Four possible batches (and one that should not be touched yet).", false, true],
    ["If you excluded the opt-outs, no one who asked to leave shows up here.", false, true],
    // limpios (NO deben marcar)
    ["We will get back to you with the outcome within 72 hours.", false, false],
    ["Availability", true, false],
    ["Version 1", true, false],
    ["With evidence", true, false],
    ["Formal", true, false],
    ["The $3,400 USD theft claim that still has no evidence attached.", false, false],
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
      // El título y el cuerpo (prompt/narrativa) tampoco deben revelar la respuesta.
      checkSpoiler(String(slide.title ?? ""), `${where}.title`);
      checkSpoiler(String(slide.body ?? ""), `${where}.body`);
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
      if (slide.content?.placeholder) {
        checkPlaceholder(String(slide.content.placeholder), `${where}.placeholder`);
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
