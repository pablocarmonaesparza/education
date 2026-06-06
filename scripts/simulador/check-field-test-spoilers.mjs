#!/usr/bin/env node

/**
 * Guarda anti-spoiler sobre las superficies pre-submit y el runtime: ni la API
 * de sesiones autenticada ni el runtime del caso deben filtrar tokens de
 * evaluación (dimensiones, rúbrica, risk events, scoring) ni snippets que
 * revelen cómo se juzga la respuesta del participante.
 *
 * Nota (reconciliación 2026-06-06): la superficie pública de field-test fue
 * retirada (commits de borrado del demo público). Este check antes incluía sus
 * rutas pre-submit (`app/api/field-test/...`); ya no existen, así que el gate
 * quedó enfocado en la API autenticada + el runtime. Se conserva el nombre del
 * archivo para no tocar el encadenado de `check-scope.mjs`.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();

const AUTH_PRE_SUBMIT_FILES = [
  "app/api/sessions/route.ts",
  "app/api/sessions/[session_id]/route.ts",
  "app/api/sessions/[session_id]/responses/route.ts",
];

const RUNTIME_FILES = [
  "app/(app)/case/[case_id]/page.tsx",
  "components/simulador/RuntimeNav.tsx",
  "components/simulador/PublicNav.tsx",
];

const forbiddenApiTokens = [
  "DIMENSIONS",
  "rubric_dimensions",
  "risk_events",
  "gap_definitions",
  "evaluation_runs",
  "JUDGE_TOOL_SCHEMA",
  "scoreSubmission",
  "evaluateFieldTestSession",
];

const forbiddenRuntimeSnippets = [
  "Evaluamos en 5 dimensiones",
  "contexto, privacidad, validación",
  "badge \"PII\"",
  "output del LLM tal cual",
  "Usar revenue para targeting sin consentimiento",
];

const issues = [];

// Si un archivo listado desaparece (otra retirada de superficie), falla con un
// mensaje accionable en vez de un ENOENT opaco que tumbe todo el check.
function readOrFlag(file) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) {
    issues.push(`${file}: archivo del spoiler-check ya no existe — actualiza la lista en check-field-test-spoilers.mjs`);
    return null;
  }
  return fs.readFileSync(full, "utf8");
}

for (const file of AUTH_PRE_SUBMIT_FILES) {
  const src = readOrFlag(file);
  if (src == null) continue;
  for (const token of forbiddenApiTokens) {
    if (src.includes(token)) {
      issues.push(`${file}: authenticated pre-submit API leaks forbidden token "${token}"`);
    }
  }
}

for (const file of RUNTIME_FILES) {
  const runtime = readOrFlag(file);
  if (runtime == null) continue;
  for (const snippet of forbiddenRuntimeSnippets) {
    if (runtime.includes(snippet)) {
      issues.push(`${file}: runtime still contains spoiler "${snippet}"`);
    }
  }
}

if (issues.length > 0) {
  for (const issue of issues) console.error(`PRE_SUBMIT_SPOILER ${issue}`);
  process.exit(1);
}

console.log("pre-submit + runtime spoiler check OK");
