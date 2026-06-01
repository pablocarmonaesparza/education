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

// Contexto del simulador para los jueces: algunos slides traen fallas PLANTADAS
// a proposito (es el ejercicio). El juez no debe confundirlas con defectos.
const SIMULATOR_CONTEXT = `CONTEXTO DEL SIMULADOR (leelo antes de juzgar):
Esto es un caso de practica. El participante aprende a trabajar con inteligencia artificial bajo presion. Por diseño, algunos slides traen contenido IMPERFECTO A PROPOSITO para que el participante lo cace:
- Los slides de tipo ai_output_review muestran un BORRADOR de la herramienta de IA que puede traer, plantados a proposito: datos personales reintroducidos, cifras inventadas o no verificables, tono agresivo, o frases vacias reutilizables. ESO NO ES UN DEFECTO DEL CASO; es lo que el participante debe marcar.
- Los slides de tipo ai_comparison muestran 4 opciones de calidad VARIABLE a proposito; el participante elige la mejor.
- Los slides de tipo ai_textfield_free / ai_textfield_guided / categorize_rows / model_tradeoff_sliders / tradeoff_decision_memo son ESPACIOS DE RESPUESTA del participante; su "incompletitud" es normal.
Las fallas plantadas son de CALIDAD (cifras inventadas, tono, datos personales). NO son de identidad: TODOS los mensajes, borradores y opciones de mensaje (incluidas las opciones de un ai_comparison) van dirigidos al MISMO destinatario de la historia, que es un segmento de clientes o usuarios. Si un borrador o una opcion se dirige por su nombre al jefe o al propio participante, ESO SI es una ruptura de historia (recipient_self) aunque este en un borrador o en una opcion: repruebalo.

NO repruebes el caso por el contenido plantado en esos slides. Juzga la COHERENCIA DE LA HISTORIA: rol/empresa/trabajo estables, jefe que asigna y recibe, destinatario del mensaje siempre un segmento (nunca el jefe ni el participante), datos canonicos (base, fechas, metricas) consistentes entre si, y promesas del jefe entregadas.`;

const BLOCK_NOTE = {
  ai_output_review:
    " (BORRADOR de la IA con posibles fallas plantadas a proposito: datos personales, cifras inventadas, tono agresivo. El participante debe cazarlas. NO es defecto del caso.)",
  ai_comparison:
    " (4 opciones de calidad variable a proposito; el participante elige.)",
  ai_textfield_free: " (espacio de respuesta del participante.)",
  ai_textfield_guided: " (el participante arma su pedido.)",
  categorize_rows: " (ejercicio: el participante clasifica filas.)",
  model_tradeoff_sliders: " (ejercicio: el participante razona tradeoffs.)",
  tradeoff_decision_memo: " (el participante decide y escribe el memo.)",
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
  lines.push(`# Caso: ${ca.case_id} (${ca.meta?.level ?? ""})`);
  lines.push(`Pregunta del jefe: ${mo.primary_question ?? ""}`);
  lines.push(`Asignacion: ${mo.assignment_brief ?? ""}`);
  lines.push(
    `Metrica de negocio: ${mo.business_metric ?? ""} · Metrica de riesgo: ${mo.risk_metric ?? ""}`,
  );
  lines.push(`Accion esperada: ${mo.expected_action ?? ""}`);
  lines.push("");
  for (const sec of ca.sections ?? []) {
    lines.push(`## Seccion ${sec.id}`);
    for (const sl of sec.slides ?? []) {
      lines.push(
        `### ${sec.id}/slot ${sl.slot} [${sl.block_id}]${BLOCK_NOTE[sl.block_id] ?? ""}: ${sl.title ?? ""}`,
      );
      if (sl.body) lines.push(sl.body);
      const contentStrings = [];
      walkStrings(sl.content, "content", contentStrings);
      if (contentStrings.length)
        lines.push("contenido: " + contentStrings.join(" | "));
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

// ---- Definicion de los 4 jueces ----
const TEN_QUESTIONS = `Responde, como fact table, estas 10 preguntas de coherencia (cada una SI/NO con evidencia):
1. El escenario del primer slide (rol, empresa, trabajo) se sostiene identico hasta el ultimo.
2. Emisor y receptor de cada mensaje son coherentes con el rol del participante.
3. Es el mismo tipo de trabajo de principio a fin.
4. Todo lo que el jefe pide al inicio se entrega dentro del caso, y todo lo que se entrega se anuncio.
5. Nombres, numeros, empresas y fechas son consistentes entre todos los slides.
6. Ningun dato del caso contradice a otro.
7. Cada instruccion aporta informacion operativa real (cero relleno).
8. Cada personaje, documento o entidad mencionado se vuelve a usar.
9. El destinatario del mensaje que construye el participante es siempre el mismo (un segmento, no una persona del equipo).
10. La identidad de la herramienta de inteligencia artificial esta clara: que hace, que puede, que no puede.`;

const JUDGES = {
  continuity: {
    needsFactTable: true,
    role: "juez de continuidad narrativa",
    instr: `Eres el juez de CONTINUIDAD. Primero extrae la fact_table (rol del participante, empresa, jefe, herramienta de IA, destinatario del mensaje, fechas clave, promesas del jefe, y las respuestas a las 10 preguntas). DESPUES busca rupturas: recipient_self (un mensaje, borrador u opcion se dirige por su nombre a una persona del equipo o al propio participante en vez de a un segmento), promise_unfulfilled (algo que el jefe pidio al inicio no se entrega en el caso), data_contradiction (un dato contradice a otro), job_switch (cambia el tipo de trabajo), tool_inconsistency (la herramienta hace algo que se dijo que no podia), ghost_entity (se menciona algo y nunca se vuelve a usar).

CRUZA LOS NUMEROS Y LAS FECHAS: por cada metrica base (apertura, recompra, quejas, rebote y similares) verifica que el MISMO valor aparezca en todos los slides que la mencionan; si un slide dice un valor para una metrica y otro slide dice un valor distinto para esa misma metrica, es data_contradiction (cita ambos: el primero en evidence, el segundo en evidence2). Igual con las fechas y los nombres.

${TEN_QUESTIONS}

Reglas para no reprobar de mas: para reportar una contradiccion de datos, DEBES citar los dos textos que chocan (pon el primero en "evidence" y el segundo en "evidence2"); si no puedes citar dos valores reales que de verdad se contradigan, NO es un finding. No reportes consejos genericos tipo "asegura la consistencia". Recuerda que el contenido plantado en los slides ai_output_review (cifras inventadas, datos personales, tono) NO es una contradiccion del caso. Verdict PASS si la historia es coherente; FAIL solo con rupturas citadas de verdad.`,
  },
  // El juez de COPY (LLM) se quito a proposito: el linter determinista
  // (lint-case-copy.mjs) ya verifica guion largo y siglas de forma fiable, y el
  // LLM los alucinaba (reprobaba hasta el golden). El copy objetivo es trabajo
  // determinista, no de juez LLM. El panel narrativo cuida la HISTORIA.
  manager_signal: {
    role: "juez de señal para el jefe",
    instr: `Eres el juez de SEÑAL PARA EL JEFE. Verifica que el caso de verdad mide lo que el jefe necesita saber (manager_signal), que termina en una accion observable, y que el resultado distinguiria a alguien con criterio de alguien sin el. Verdict FAIL si el caso no produce una señal accionable para el jefe.`,
  },
  adversarial: {
    role: "juez adversarial",
    instr: `Eres el juez ADVERSARIAL. Tu unico mandato: encontrar UNA razon concreta y citable para REPROBAR este caso a nivel de HISTORIA (no de contenido plantado). Razones validas: el destinatario del mensaje es una persona del equipo o el participante (no un segmento), una promesa del jefe que no se entrega, un dato canonico que contradice a otro (nombres, fechas, empresa, metricas base), un cambio de tipo de trabajo, o la herramienta de IA descrita de forma inconsistente. NO cuentan como razon: las cifras inventadas, los datos personales o el tono agresivo que aparecen DENTRO de un borrador de la IA (slides ai_output_review) ni las opciones flojas de un ai_comparison: eso es contenido plantado a proposito. Para una contradiccion de datos cita los DOS textos que chocan (evidence y evidence2). Si encuentras una razon de historia, verdict FAIL con su cita. Si no hay ninguna, PASS.`,
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
          type: { type: "string", description: "tipo de ruptura" },
          slide: { type: "string", description: "seccion/slot N donde ocurre" },
          evidence: {
            type: "string",
            description: "CITA TEXTUAL exacta tomada del caso (copiala literal)",
          },
          evidence2: {
            type: "string",
            description:
              "segunda cita textual exacta; OBLIGATORIA para contradicciones (el texto que choca con evidence)",
          },
          fix: { type: "string", description: "como corregirlo" },
        },
        required: ["type", "slide", "evidence", "fix"],
      },
    },
  };
  const required = ["judge", "verdict", "findings"];
  if (needsFactTable) {
    props.fact_table = {
      type: "object",
      description: "hechos canonicos extraidos del caso",
      properties: {
        numbers: {
          type: "array",
          description:
            "CADA par (metrica, valor) que aparezca en CUALQUIER slide o nota, con su ubicacion. Incluye todo porcentaje y todo monto. Si la misma metrica aparece en varios slides, lista cada aparicion.",
          items: {
            type: "object",
            properties: {
              metric: { type: "string", description: "que mide, normalizado (ej. recompra a 30 dias)" },
              value: { type: "string", description: "el valor tal cual aparece (ej. 3.4%)" },
              slide: { type: "string", description: "seccion/slot N" },
            },
            required: ["metric", "value", "slide"],
          },
        },
        notes: {
          type: "string",
          description: "rol, empresa, jefe, herramienta de IA, destinatario del mensaje, promesas del jefe",
        },
      },
      required: ["numbers"],
    };
    required.push("fact_table");
  }
  return {
    name: "submit_verdict",
    description: "Veredicto del juez con evidencia citada.",
    schema: { type: "object", properties: props, required },
  };
}

async function runJudge(name, caseText, bibleText) {
  const def = JUDGES[name];
  const system = `Eres un ${def.role} de casos de un simulador corporativo. Trabajas en español neutro de Latinoamerica. Toda afirmacion que hagas debe venir con una CITA TEXTUAL exacta del caso (copiada literal), o no cuenta. No confundas el contenido plantado a proposito (ver contexto) con un defecto.

${SIMULATOR_CONTEXT}

${def.instr}`;
  const user = `${bibleText ? `BIBLIA (verdad canonica del caso):\n${bibleText}\n\n` : ""}CASO A EVALUAR:\n\n${caseText}\n\nEmite tu veredicto. Cada finding DEBE incluir una cita textual exacta ("evidence") copiada del caso.`;

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
      reason: `el juez no devolvio veredicto valido: ${String(err.message ?? err).slice(0, 100)}`,
      findings: [],
      grounded: [],
    };
  }

  // default FAIL si falta verdict o (continuity) fact_table.
  if (out.verdict !== "PASS" && out.verdict !== "FAIL")
    return { judge: name, verdict: "FAIL", reason: "verdict ausente", findings: out.findings ?? [], grounded: [] };
  if (def.needsFactTable && (!out.fact_table || Object.keys(out.fact_table).length === 0))
    return { judge: name, verdict: "FAIL", reason: "fact_table vacia", findings: out.findings ?? [], grounded: [] };

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
  else if (!a.startsWith("--")) positional.push(a);
}
const casePath = positional[0];
if (!casePath) {
  console.error("uso: node scripts/simulador/judge-narrative.mjs <case.yaml> [--bible b.json] [--judge all|...] [--json]");
  process.exit(2);
}

const ca = yaml.load(fs.readFileSync(casePath, "utf8"))?.case_assembly;
if (!ca) {
  console.error("el archivo no tiene case_assembly");
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
        fix: `la metrica "${m}" aparece con valores distintos (${e.map((x) => x[0]).join(", ")}); unifica el valor en todos los slides`,
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
      ? `JUEZ NARRATIVO: PASS (${results.length} jueces)`
      : `JUEZ NARRATIVO: FAIL (${failed.map((r) => r.judge).join(", ")})`,
  );
}

process.exit(failed.length === 0 ? 0 : 1);
