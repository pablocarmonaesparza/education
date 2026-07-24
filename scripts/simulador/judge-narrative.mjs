#!/usr/bin/env node
// Juez narrativo · 4 jueces LLM independientes (AND) que cazan la incoherencia
// que los gates deterministas no ven. Convierte CASE_NARRATIVE_JUDGE.md en script.
//
//   node scripts/simulador/judge-narrative.mjs <case.yaml> [--bible <bible.json>]
//        [--judge all|continuity|copy|manager_signal|adversarial] [--json]
//
// Exit 0 si TODOS los jueces pedidos dan PASS; exit 1 si alguno da FAIL.
//
// Anti falso-PASS / falso-FAIL (mecanico, no se le pregunta al modelo "cumple?"):
//  - continuity emite primero una fact_table; sin ella el verdict no cuenta.
//  - evidence-gating: cada finding trae una cita; si la cita NO esta textualmente
//    en el caso, se descarta (el modelo la alucino). Un FAIL solo vale si queda
//    al menos un finding con cita real -> protege al golden de FAILs alucinados y
//    le da al repair un objetivo concreto.
//  - default FAIL si el modelo no devuelve tool_use valido o sin verdict.
//  - 4 jueces independientes con AND; el adversarial debe hallar UNA razon citable.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";
import { callTool } from "./gen/llm/client.mjs";

// Los campos judge_internal (hint, example, issue, goodWhen) SI los ve el juez
// (son parte del caso autorado; ahi viven hechos canonicos). Solo se saltan las
// claves estructurales de abajo.
const STRUCTURAL = new Set([
  "block_id",
  "slot",
  "kind",
  "channel",
  "src",
  "key",
  "id",
  "flagIfMarked",
  "timestamp",
  "schema_version",
  "case_id",
  "version",
  "status",
  "profile_pack",
]);

// Contexto del simulador para los jueces (en ingles US: el caso se autora y se
// evalua en ingles; pivot EEUU 2026-07-15): algunos slides traen fallas
// PLANTADAS a proposito (es el ejercicio). El juez no debe confundirlas con
// defectos.
const SIMULATOR_CONTEXT = `SIMULATOR CONTEXT (read this before judging):
This is a practice case. The participant learns to work with AI under pressure. By design, some slides contain content that is IMPERFECT ON PURPOSE so the participant can catch it:
- Slides of type ai_output_review show a DRAFT produced by the AI tool that may contain, planted on purpose: reintroduced personal data, invented or unverifiable figures, aggressive tone, or reusable filler phrases. THAT IS NOT A DEFECT OF THE CASE; it is what the participant must flag.
- Slides of type ai_comparison show 4 options of VARIABLE quality on purpose; the participant picks the best one.
- Slides of type ai_textfield_free / ai_textfield_guided / categorize_rows / model_tradeoff_sliders / tradeoff_decision_memo are the participant's ANSWER SPACES; their "incompleteness" is normal.
Planted flaws are QUALITY flaws (invented figures, tone, personal data). They are NOT identity flaws: ALL messages, drafts, and message options (including the options of an ai_comparison) address the SAME recipient of the story, which is a segment of customers or users. If a draft or an option addresses the manager or the participant by name, THAT IS a story break (recipient_self) even inside a draft or an option: fail it.

Do NOT fail the case for the planted content on those slides. Judge the COHERENCE OF THE STORY: stable role/company/job, a manager who assigns and receives, a message recipient that is always a segment (never the manager nor the participant), canonical data (baselines, dates, metrics) consistent with each other, and manager promises delivered.`;

const BLOCK_NOTE = {
  ai_output_review:
    " (AI DRAFT with flaws possibly planted on purpose: personal data, invented figures, aggressive tone. The participant must catch them. NOT a defect of the case.)",
  ai_comparison:
    " (4 options of variable quality on purpose; the participant picks one.)",
  ai_textfield_free: " (the participant's answer space.)",
  ai_textfield_guided: " (the participant builds their request.)",
  categorize_rows: " (exercise: the participant classifies rows.)",
  model_tradeoff_sliders: " (exercise: the participant reasons through tradeoffs.)",
  tradeoff_decision_memo: " (the participant decides and writes the memo.)",
};

// ---- Render legible del caso (lo que ve el participante) + strings visibles ----
function walkStrings(node, key, out) {
  if (node == null) return;
  if (typeof node === "string") {
    if (!STRUCTURAL.has(key)) out.push(node);
    return;
  }
  if (Array.isArray(node)) {
    for (const el of node) walkStrings(el, key, out);
    return;
  }
  if (typeof node === "object") {
    // Incluye los campos judge_internal (hint, example, issue, goodWhen): el
    // juez es un gate de calidad sobre el caso AUTORADO completo, y ahi viven
    // hechos canonicos (ej. "superar 3.4%") que deben ser consistentes con lo
    // visible. Solo se saltan las claves estructurales (en la rama de string).
    for (const [k, v] of Object.entries(node)) {
      walkStrings(v, k, out);
    }
  }
}

function renderCase(ca) {
  const lines = [];
  const mo = ca.manager_outcome ?? {};
  lines.push(`# Case: ${ca.case_id} (${ca.meta?.level ?? ""})`);
  lines.push(`Manager's question: ${mo.primary_question ?? ""}`);
  lines.push(`Assignment: ${mo.assignment_brief ?? ""}`);
  lines.push(
    `Business metric: ${mo.business_metric ?? ""} · Risk metric: ${mo.risk_metric ?? ""}`,
  );
  lines.push(`Expected action: ${mo.expected_action ?? ""}`);
  lines.push("");
  for (const sec of ca.sections ?? []) {
    lines.push(`## Section ${sec.id}`);
    for (const sl of sec.slides ?? []) {
      lines.push(
        `### ${sec.id}/slot ${sl.slot} [${sl.block_id}]${BLOCK_NOTE[sl.block_id] ?? ""}: ${sl.title ?? ""}`,
      );
      if (sl.body) lines.push(sl.body);
      const contentStrings = [];
      walkStrings(sl.content, "content", contentStrings);
      if (contentStrings.length)
        lines.push("content: " + contentStrings.join(" | "));
      lines.push("");
    }
  }
  return lines.join("\n");
}

function visibleConcat(ca) {
  const out = [];
  walkStrings(ca.manager_outcome, "mo", out);
  for (const sec of ca.sections ?? []) {
    for (const sl of sec.slides ?? []) {
      if (sl.title) out.push(sl.title);
      if (sl.body) out.push(sl.body);
      walkStrings(sl.content, "content", out);
    }
  }
  return normalize(out.join("  "));
}

function normalize(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ---- Definicion de los jueces (prompts en ingles US) ----
const TEN_QUESTIONS = `Answer, as a fact table, these 10 coherence questions (each YES/NO with evidence):
1. The scenario of the first slide (role, company, job) holds identical through the last one.
2. Sender and recipient of every message are coherent with the participant's role.
3. It is the same kind of work from start to finish.
4. Everything the manager asks for at the start is delivered inside the case, and everything delivered was announced.
5. Names, numbers, companies, and dates are consistent across all slides.
6. No fact in the case contradicts another.
7. Every instruction carries real operational information (zero filler).
8. Every character, document, or entity mentioned gets used again.
9. The recipient of the message the participant builds is always the same (a segment, not a member of the team).
10. The identity of the AI tool is clear: what it does, what it can do, what it cannot do.`;

const JUDGES = {
  continuity: {
    needsFactTable: true,
    role: "narrative continuity judge",
    instr: `You are the CONTINUITY judge. First extract the fact_table (participant role, company, manager, AI tool, message recipient, key dates, manager promises, and the answers to the 10 questions). THEN hunt for breaks: recipient_self (a message, draft, or option addresses a team member or the participant by name instead of a segment), promise_unfulfilled (something the manager asked for at the start is not delivered inside the case), data_contradiction (one fact contradicts another), job_switch (the kind of work changes), tool_inconsistency (the tool does something it was said it could not do), ghost_entity (something is mentioned and never used again).

CROSS-CHECK THE NUMBERS AND THE DATES: for every baseline metric (open rate, repeat purchase, complaints, bounce, and similar) verify that the SAME value appears on every slide that mentions it; if one slide states a value for a metric and another slide states a different value for that same metric, it is a data_contradiction (quote both: the first in evidence, the second in evidence2). Same with dates and names.

${TEN_QUESTIONS}

Rules to avoid over-failing: to report a data contradiction you MUST quote the two texts that clash (put the first in "evidence" and the second in "evidence2"); if you cannot quote two real values that genuinely contradict each other, it is NOT a finding. Do not report generic advice like "ensure consistency". Remember that the planted content on ai_output_review slides (invented figures, personal data, tone) is NOT a contradiction of the case. Verdict PASS if the story is coherent; FAIL only with genuinely quoted breaks.`,
  },
  // El juez de COPY (LLM) se quito a proposito: el linter determinista
  // (lint-case-copy.mjs) ya verifica guion largo y siglas de forma fiable, y el
  // LLM los alucinaba (reprobaba hasta el golden). El copy objetivo es trabajo
  // determinista, no de juez LLM. El panel narrativo cuida la HISTORIA.
  manager_signal: {
    role: "manager-signal judge",
    instr: `You are the MANAGER-SIGNAL judge. Verify that the case truly measures what the manager needs to know (manager_signal), that it ends in an observable action, and that the outcome would distinguish someone with judgment from someone without it. Verdict FAIL if the case does not produce an actionable signal for the manager.`,
  },
  adversarial: {
    role: "adversarial judge",
    instr: `You are the ADVERSARIAL judge. Your single mandate: find ONE concrete, quotable reason to FAIL this case at the STORY level (not the planted content). Valid reasons: the message recipient is a team member or the participant (not a segment), a manager promise that is not delivered, a canonical fact that contradicts another (names, dates, company, baseline metrics), a switch in the kind of work, or the AI tool described inconsistently. These do NOT count as reasons: the invented figures, personal data, or aggressive tone that appear INSIDE an AI draft (ai_output_review slides), nor the weak options of an ai_comparison: that is content planted on purpose. For a data contradiction quote the TWO texts that clash (evidence and evidence2). If you find a story-level reason, verdict FAIL with its quote. If there is none, PASS.`,
  },
};

function verdictSchema(name, needsFactTable) {
  const props = {
    judge: { type: "string" },
    verdict: { type: "string", enum: ["PASS", "FAIL"] },
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", description: "kind of break" },
          slide: { type: "string", description: "section/slot N where it happens" },
          evidence: {
            type: "string",
            description: "EXACT VERBATIM QUOTE taken from the case (copy it literally)",
          },
          evidence2: {
            type: "string",
            description:
              "second exact verbatim quote; REQUIRED for contradictions (the text that clashes with evidence)",
          },
          fix: { type: "string", description: "how to fix it" },
        },
        required: ["type", "slide", "evidence", "fix"],
      },
    },
  };
  const required = ["judge", "verdict", "findings"];
  if (needsFactTable) {
    props.fact_table = {
      type: "object",
      description: "canonical facts extracted from the case",
      properties: {
        numbers: {
          type: "array",
          description:
            "EVERY (metric, value) pair that appears on ANY slide or note, with its location. Include every percentage and every amount. If the same metric appears on several slides, list every occurrence.",
          items: {
            type: "object",
            properties: {
              metric: { type: "string", description: "what it measures, normalized (e.g. 30-day repeat purchase)" },
              value: { type: "string", description: "the value exactly as it appears (e.g. 3.4%)" },
              slide: { type: "string", description: "section/slot N" },
            },
            required: ["metric", "value", "slide"],
          },
        },
        notes: {
          type: "string",
          description: "role, company, manager, AI tool, message recipient, manager promises",
        },
      },
      required: ["numbers"],
    };
    required.push("fact_table");
  }
  return {
    name: "submit_verdict",
    description: "The judge's verdict with quoted evidence.",
    schema: { type: "object", properties: props, required },
  };
}

async function runJudge(name, caseText, bibleText) {
  const def = JUDGES[name];
  const system = `You are a ${def.role} for cases in a workplace simulator used by teams at US companies. You work in US business English. Every claim you make must come with an EXACT VERBATIM QUOTE from the case (copied literally), or it does not count. Do not mistake content planted on purpose (see context) for a defect.

${SIMULATOR_CONTEXT}

${def.instr}`;
  const user = `${bibleText ? `BIBLE (canonical truth of the case):\n${bibleText}\n\n` : ""}CASE UNDER REVIEW:\n\n${caseText}\n\nDeliver your verdict. Every finding MUST include an exact verbatim quote ("evidence") copied from the case.`;

  let out;
  try {
    const { value } = await callTool(system, user, verdictSchema(name, def.needsFactTable), {
      role: "judge",
      temperature: 0,
      maxTokens: 4000,
    });
    out = value;
  } catch (err) {
    return {
      judge: name,
      verdict: "FAIL",
      reason: `the judge returned no valid verdict: ${String(err.message ?? err).slice(0, 100)}`,
      findings: [],
      grounded: [],
    };
  }

  // default FAIL si falta verdict o (continuity) fact_table.
  if (out.verdict !== "PASS" && out.verdict !== "FAIL")
    return { judge: name, verdict: "FAIL", reason: "missing verdict", findings: out.findings ?? [], grounded: [] };
  if (def.needsFactTable && (!out.fact_table || Object.keys(out.fact_table).length === 0))
    return { judge: name, verdict: "FAIL", reason: "empty fact_table", findings: out.findings ?? [], grounded: [] };

  return { judge: name, ...out };
}

// ---- CLI ----
const args = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--json") flags.json = true;
  else if (a === "--judge") flags.judge = args[++i];
  else if (a === "--bible") flags.bible = args[++i];
  // --runs se aceptaba desde run-gates pero el parser lo tiraba (y su valor
  // caia a positional); ahora se parsea de verdad.
  else if (a === "--runs") flags.runs = args[++i];
  else if (!a.startsWith("--")) positional.push(a);
}
const casePath = positional[0];
if (!casePath) {
  console.error("usage: node scripts/simulador/judge-narrative.mjs <case.yaml> [--bible b.json] [--judge all|...] [--runs N] [--json]");
  process.exit(2);
}

const ca = yaml.load(fs.readFileSync(casePath, "utf8"))?.case_assembly;
if (!ca) {
  console.error("the file has no case_assembly");
  process.exit(2);
}
const caseText = renderCase(ca);
const visible = visibleConcat(ca);
const bibleText = flags.bible
  ? JSON.stringify(yaml.load(fs.readFileSync(flags.bible, "utf8")), null, 2)
  : null;

const which =
  !flags.judge || flags.judge === "all"
    ? Object.keys(JUDGES)
    : [flags.judge];

// evidence-gating: un finding cuenta solo si su cita esta textualmente en el caso.
function groundedFindings(findings) {
  return (findings ?? []).filter((f) => {
    const ev = normalize(f.evidence ?? "");
    if (ev.length < 6 || !visible.includes(ev)) return false;
    if (/contrad/i.test(f.type ?? "")) {
      const ev2 = normalize(f.evidence2 ?? "");
      if (ev2.length < 3 || ev2 === ev || !visible.includes(ev2)) return false;
    }
    return true;
  });
}

// Extrae numeros de los lugares ESTRUCTURADOS del caso (no depende del LLM, que
// extrae incompleto). Las tarjetas de KPI son la fuente canonica de las metricas
// base; de ahi salen los valores contra los que se cruza la prosa.
function structuredNumbers(ca) {
  const out = [];
  for (const sec of ca.sections ?? []) {
    for (const sl of sec.slides ?? []) {
      const loc = `${sec.id}/slot ${sl.slot}`;
      if (sl.block_id === "reading_kpi_cards") {
        for (const k of sl.content?.kpis ?? []) {
          if (k?.label != null && k?.value != null)
            out.push({ metric: String(k.label), value: String(k.value), slide: loc, canonical: true });
        }
      }
    }
  }
  return out;
}

// El LLM extrae los numeros de la prosa; el codigo compara. Caza una metrica que
// aparece con dos valores distintos (data_contradiction) sin depender de que el
// LLM lo note.
function numberContradictions(numbers) {
  const byMetric = {};
  for (const n of numbers ?? []) {
    const m = normalize(n.metric ?? "");
    const v = normalize(String(n.value ?? ""));
    // Solo valores NUMERICos (con digito): descarta ruido como "flat", "mas alto".
    if (m.length < 3 || !/\d/.test(v) || !visible.includes(v)) continue;
    byMetric[m] ??= { values: new Map(), canonical: false };
    if (n.canonical) byMetric[m].canonical = true;
    if (!byMetric[m].values.has(v)) byMetric[m].values.set(v, n.slide ?? "?");
  }
  const out = [];
  for (const [m, g] of Object.entries(byMetric)) {
    // Solo reporta si la metrica es CANONICA (viene de una tarjeta de KPI) y
    // aparece con 2+ valores. Evita falsos positivos de valores por fila de las
    // tablas de datos (cada cliente tiene su propio monto, no son la misma metrica).
    if (g.canonical && g.values.size >= 2) {
      const e = [...g.values.entries()];
      out.push({
        type: "data_contradiction",
        slide: `${e[0][1]} vs ${e[1][1]}`,
        evidence: e[0][0],
        evidence2: e[1][0],
        fix: `metric "${m}" appears with different values (${e.map((x) => x[0]).join(", ")}); unify the value across all slides`,
      });
    }
  }
  return out;
}

// Ensemble: los jueces LLM tienen varianza aun a temperatura 0. Correr cada juez
// varias veces y UNIR los findings fundamentados sube el recall (lo caza si
// cualquier corrida lo ve), sin subir los falsos positivos (cada finding sigue
// pasando el evidence-gating). RUNS por defecto 2.
const RUNS = Math.max(1, Number(flags.runs ?? 2));
const results = [];
for (const name of which) {
  let union = [];
  let lastR = null;
  let validRuns = 0;
  for (let i = 0; i < RUNS; i++) {
    const r = await runJudge(name, caseText, bibleText);
    lastR = r;
    if (!r.reason) validRuns++;
    let g = groundedFindings(r.findings);
    if (name === "continuity") {
      const allNums = [...(r.fact_table?.numbers ?? []), ...structuredNumbers(ca)];
      g = g.concat(numberContradictions(allNums));
    }
    union = union.concat(g);
  }
  const seen = new Set();
  const grounded = union.filter((f) => {
    const k = `${f.type}|${normalize(f.evidence ?? "")}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  // FAIL si hay evidencia fundamentada, o si NINGUNA corrida produjo veredicto
  // valido (error de formato / API en todas).
  const effective = grounded.length > 0 || validRuns === 0 ? "FAIL" : "PASS";
  results.push({ ...lastR, grounded, effective });
}

const failed = results.filter((r) => r.effective === "FAIL");

if (flags.json) {
  console.log(JSON.stringify(results, null, 2));
} else {
  for (const r of results) {
    const tag = r.effective === "FAIL" ? "FAIL" : "PASS";
    console.log(`[${r.judge}] ${tag}${r.reason ? " · " + r.reason : ""}`);
    for (const f of r.grounded) {
      console.log(`   - ${f.type} @ ${f.slide}: "${(f.evidence ?? "").slice(0, 80)}"`);
      if (f.fix) console.log(`     fix: ${f.fix.slice(0, 100)}`);
    }
  }
  console.log("");
  console.log(
    failed.length === 0
      ? `NARRATIVE JUDGE: PASS (${results.length} judges)`
      : `NARRATIVE JUDGE: FAIL (${failed.map((r) => r.judge).join(", ")})`,
  );
}

process.exit(failed.length === 0 ? 0 : 1);
