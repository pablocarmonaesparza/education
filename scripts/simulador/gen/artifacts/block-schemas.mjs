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

// Propositos por bloque, en ingles US: estos textos se inyectan en los prompts
// del autor y del repair (el motor autora en ingles; pivot EEUU 2026-07-15).
export const BLOCK_PURPOSE = {
  case_cover: "Case cover. Sets the scenario, the role, and the tools.",
  reading_passive: "Context reading. Informs only, no interaction.",
  reading_message: "Simulated message (email, chat, or ticket). Who writes to whom.",
  reading_data_table: "Data table to read (customers, transactions, leads).",
  reading_image: "Image or screenshot with a description.",
  reading_kpi_cards: "One to three headline metrics (open rate, repeat purchase, churn).",
  reading_timeline: "Timeline of the case's events.",
  reading_attachment: "Attached document (policy, contract, brief).",
  ai_textfield_free:
    "The participant writes to the AI tool with no guidance. Measures how they structure the request.",
  ai_textfield_guided:
    "The participant builds the request by choosing goal, audience, and limits.",
  model_tradeoff_sliders:
    "The participant reasons through tradeoffs (autonomy, safety, cost) for sensitive data.",
  categorize_rows:
    "For each row, the participant picks an action (data or message triage).",
  ai_output_review:
    "The participant flags risky segments in an output produced by the AI tool.",
  ai_comparison:
    "The participant picks the best of 4 options (always 4) and justifies the choice.",
  workflow_builder: "Order and enable the steps of a workflow.",
  dashboard_pivot: "Read a dashboard and bring one takeaway to the lead.",
  tradeoff_decision_memo:
    "The participant picks an action with real benefits and costs and writes a memo.",
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
  if (req.length) lines.push(`${indent}required keys: ${req.join(", ")}`);
  for (const [k, n] of Object.entries(spec.min_array ?? {}))
    lines.push(`${indent}key "${k}" is an array with at least ${n} elements`);
  for (const [k, n] of Object.entries(spec.exact_array ?? {}))
    lines.push(`${indent}key "${k}" is an array with exactly ${n} elements`);
  for (const [k, fields] of Object.entries(spec.element_required ?? {}))
    if (fields.length)
      lines.push(
        `${indent}each element of array "${k}" is an object with these keys: ${fields.join(", ")}`,
      );
  for (const [k, enums] of Object.entries(spec.element_enum ?? {}))
    for (const [f, vals] of Object.entries(enums))
      lines.push(
        `${indent}in each element of "${k}", key ${f} may only be: ${vals.join(" | ")}`,
      );
  for (const k of spec.string_array_keys ?? [])
    lines.push(`${indent}key "${k}" is an array of strings`);
  for (const [k, fields] of Object.entries(spec.element_unique ?? {}))
    lines.push(
      `${indent}key ${fields.join(",")} is distinct in every element of "${k}"`,
    );
  for (const [k, sub] of Object.entries(spec.nested ?? {})) {
    lines.push(`${indent}key "${k}" is an object with:`);
    lines.push(...describeSpec(sub, indent + "  "));
  }
  return lines;
}

export function describeBlock(blockId) {
  const spec = CONTENT_SCHEMAS[blockId];
  const purpose = BLOCK_PURPOSE[blockId] ?? "";
  const lines = [`block ${blockId} (${family(blockId)}): ${purpose}`];
  if (spec?.not_data_driven) {
    lines.push("  DO NOT use: this block does not consume case content yet.");
    return lines.join("\n");
  }
  const contract = describeSpec(spec, "  content.");
  if (contract.length) lines.push(...contract);
  else lines.push("  content: optional (only title and body on the slide).");
  const forbidden = forbiddenKeys(blockId);
  if (forbidden.length)
    lines.push(
      `  FORBIDDEN in content (these are participant answers, never prefill): ${forbidden.join(", ")}`,
    );
  const internal = judgeInternalFields(blockId);
  if (internal.length)
    lines.push(
      `  author-only fields (used by the judge, stripped before the client): ${internal.join(", ")}`,
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
