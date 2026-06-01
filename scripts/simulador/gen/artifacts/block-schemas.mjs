// Deriva, por block_id, el CONTRATO DE CONTENIDO que el autor debe respetar.
// Fuente de verdad: BLOCK_CONTENT_SCHEMAS.yaml + EXERCISE_BLOCK_CATALOG.yaml (los
// mismos que valida check-assembled-case.mjs). Asi el prompt del autor y el
// validador hablan del mismo contrato y no driftan.
//
// Exports:
//   describeBlock(blockId)   -> texto del contrato (para prompts)
//   contentSchema(blockId)   -> JSON Schema del objeto content (para tool_use / repair)
//   forbiddenKeys(blockId)   -> campos prohibidos (prefill de respuesta)
//   BLOCK_PURPOSE            -> proposito corto por bloque

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const ROOT = process.cwd();
const FACTORY = path.join(ROOT, "docs/simulador/case_factory");

const CONTENT_SCHEMAS =
  yaml.load(fs.readFileSync(path.join(FACTORY, "BLOCK_CONTENT_SCHEMAS.yaml"), "utf8"))
    ?.block_content_schemas?.blocks ?? {};

const CATALOG =
  yaml.load(fs.readFileSync(path.join(FACTORY, "EXERCISE_BLOCK_CATALOG.yaml"), "utf8"))
    ?.exercise_block_catalog?.blocks ?? [];

const catalogById = {};
for (const b of CATALOG) catalogById[b.id] = b;

export const BLOCK_PURPOSE = {
  case_cover: "Portada del caso. Da el escenario, el rol y las herramientas.",
  reading_passive: "Lectura de contexto. Solo informa, sin interaccion.",
  reading_message: "Mensaje simulado (correo, chat o ticket). Quien escribe a quien.",
  reading_data_table: "Tabla de datos para leer (clientes, transacciones, leads).",
  reading_image: "Imagen o captura de pantalla con descripcion.",
  reading_kpi_cards: "Una a tres metricas grandes (apertura, recompra, churn).",
  reading_timeline: "Cronologia de eventos del caso.",
  reading_attachment: "Documento adjunto (politica, contrato, brief).",
  ai_textfield_free:
    "El participante le escribe a la inteligencia artificial sin guia. Mide estructura del pedido.",
  ai_textfield_guided:
    "El participante arma el pedido eligiendo objetivo, audiencia y limites.",
  model_tradeoff_sliders:
    "El participante razona tradeoffs (autonomia, seguridad, costo) para datos sensibles.",
  categorize_rows:
    "Por cada fila, el participante elige una accion (triaje de datos o de mensaje).",
  ai_output_review:
    "El participante marca segmentos de riesgo en un output de la inteligencia artificial.",
  ai_comparison:
    "El participante elige la mejor entre 4 opciones (siempre 4) y justifica.",
  workflow_builder: "Ordena y habilita pasos de un flujo.",
  dashboard_pivot: "Lee un tablero y lleva un aprendizaje al lider.",
  tradeoff_decision_memo:
    "El participante elige una accion con ventajas y costos y escribe un memo.",
};

export function family(blockId) {
  return catalogById[blockId]?.family ?? "unknown";
}

export function forbiddenKeys(blockId) {
  const fromSchema = CONTENT_SCHEMAS[blockId]?.forbidden_keys ?? [];
  const fromCatalog = catalogById[blockId]?.default_empty_fields ?? [];
  return [...new Set([...fromSchema, ...fromCatalog])];
}

export function judgeInternalFields(blockId) {
  return catalogById[blockId]?.judge_internal_fields ?? [];
}

// ---- Descripcion textual del contrato (para el prompt del autor) ----
function describeSpec(spec, indent = "") {
  if (!spec) return [];
  const lines = [];
  const req = spec.required_keys ?? [];
  if (req.length) lines.push(`${indent}claves requeridas: ${req.join(", ")}`);
  for (const [k, n] of Object.entries(spec.min_array ?? {}))
    lines.push(`${indent}la clave "${k}" es un arreglo de al menos ${n} elementos`);
  for (const [k, n] of Object.entries(spec.exact_array ?? {}))
    lines.push(`${indent}la clave "${k}" es un arreglo de exactamente ${n} elementos`);
  for (const [k, fields] of Object.entries(spec.element_required ?? {}))
    if (fields.length)
      lines.push(
        `${indent}cada elemento del arreglo "${k}" es un objeto con estas claves: ${fields.join(", ")}`,
      );
  for (const [k, enums] of Object.entries(spec.element_enum ?? {}))
    for (const [f, vals] of Object.entries(enums))
      lines.push(
        `${indent}en cada elemento de "${k}", la clave ${f} solo puede valer: ${vals.join(" | ")}`,
      );
  for (const k of spec.string_array_keys ?? [])
    lines.push(`${indent}la clave "${k}" es un arreglo de textos`);
  for (const [k, fields] of Object.entries(spec.element_unique ?? {}))
    lines.push(
      `${indent}la clave ${fields.join(",")} es distinta en cada elemento de "${k}"`,
    );
  for (const [k, sub] of Object.entries(spec.nested ?? {})) {
    lines.push(`${indent}la clave "${k}" es un objeto con:`);
    lines.push(...describeSpec(sub, indent + "  "));
  }
  return lines;
}

export function describeBlock(blockId) {
  const spec = CONTENT_SCHEMAS[blockId];
  const purpose = BLOCK_PURPOSE[blockId] ?? "";
  const lines = [`bloque ${blockId} (${family(blockId)}): ${purpose}`];
  if (spec?.not_data_driven) {
    lines.push("  NO usar: este bloque aun no consume contenido del caso.");
    return lines.join("\n");
  }
  const contract = describeSpec(spec, "  content.");
  if (contract.length) lines.push(...contract);
  else lines.push("  content: opcional (solo title y body en el slide).");
  const forbidden = forbiddenKeys(blockId);
  if (forbidden.length)
    lines.push(
      `  PROHIBIDO en content (son respuestas del participante, no prefill): ${forbidden.join(", ")}`,
    );
  const internal = judgeInternalFields(blockId);
  if (internal.length)
    lines.push(
      `  campos solo-autor (utiles para el juez, se remueven antes del cliente): ${internal.join(", ")}`,
    );
  return lines.join("\n");
}

// ---- JSON Schema del content (para tool_use en el repair por slide) ----
function elementSchema(arrayKey, spec) {
  const fields = spec.element_required?.[arrayKey] ?? [];
  const enums = spec.element_enum?.[arrayKey] ?? {};
  const properties = {};
  for (const f of fields) {
    properties[f] = enums[f]
      ? { type: "string", enum: enums[f] }
      : { type: "string" };
  }
  if (fields.length === 0) return { type: "object" };
  return { type: "object", properties, required: fields };
}

export function contentSchema(blockId) {
  const spec = CONTENT_SCHEMAS[blockId];
  if (!spec || spec.not_data_driven) return { type: "object" };
  const properties = {};
  const required = [...(spec.required_keys ?? [])];
  const arrayKeys = new Set([
    ...Object.keys(spec.min_array ?? {}),
    ...Object.keys(spec.exact_array ?? {}),
  ]);
  for (const k of arrayKeys) {
    if (spec.string_array_keys?.includes(k))
      properties[k] = { type: "array", items: { type: "string" } };
    else properties[k] = { type: "array", items: elementSchema(k, spec) };
  }
  for (const [k, sub] of Object.entries(spec.nested ?? {})) {
    properties[k] = nestedSchema(sub);
  }
  for (const k of spec.required_keys ?? []) {
    if (!properties[k]) properties[k] = { type: "string" };
  }
  return { type: "object", properties, required };
}

function nestedSchema(spec) {
  const properties = {};
  const required = [...(spec.required_keys ?? [])];
  const arrayKeys = new Set([
    ...Object.keys(spec.min_array ?? {}),
    ...Object.keys(spec.exact_array ?? {}),
  ]);
  for (const k of arrayKeys) {
    if (spec.string_array_keys?.includes(k))
      properties[k] = { type: "array", items: { type: "string" } };
    else properties[k] = { type: "array", items: elementSchema(k, spec) };
  }
  for (const [k, sub] of Object.entries(spec.nested ?? {}))
    properties[k] = nestedSchema(sub);
  for (const k of spec.required_keys ?? [])
    if (!properties[k]) properties[k] = { type: "string" };
  return { type: "object", properties, required };
}
