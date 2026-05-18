#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();

const PRE_SUBMIT_FILES = [
  "app/api/field-test/sessions/route.ts",
  "app/api/field-test/sessions/[session_id]/route.ts",
  "app/api/field-test/sessions/[session_id]/responses/route.ts",
  "app/api/field-test/sessions/[session_id]/llm/route.ts",
  "app/api/field-test/sessions/[session_id]/events/route.ts",
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

for (const file of PRE_SUBMIT_FILES) {
  const full = path.join(ROOT, file);
  const src = fs.readFileSync(full, "utf8");
  for (const token of forbiddenApiTokens) {
    if (src.includes(token)) {
      issues.push(`${file}: pre-submit API leaks forbidden token "${token}"`);
    }
  }
}

for (const file of RUNTIME_FILES) {
  const runtime = fs.readFileSync(path.join(ROOT, file), "utf8");
  for (const snippet of forbiddenRuntimeSnippets) {
    if (runtime.includes(snippet)) {
      issues.push(`${file}: runtime still contains spoiler "${snippet}"`);
    }
  }
}

if (issues.length > 0) {
  for (const issue of issues) console.error(`FIELD_TEST_SPOILER ${issue}`);
  process.exit(1);
}

console.log("field-test spoiler check OK");
