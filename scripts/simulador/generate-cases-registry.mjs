#!/usr/bin/env node
// Emite un REGISTRO tipado de todos los casos ensamblados, para que el runtime
// productivo config-driven (RuntimeExperienceV2) los juegue sin leer YAML en
// runtime (que rompe en serverless) ni meter js-yaml en el bundle de TS.
//
//   Fuente:  docs/simulador/contrato_v0/cases_assembled/*.yaml
//   Salida:  lib/simulador/cases-registry.generated.ts
//
// Production-like: en producción este registro se reemplaza por una lectura de
// la base (caso por empresa); la forma PlayableCase es la misma. Los campos
// judge_internal (hint/example/issue/goodWhen) se remueven aquí (paridad con el
// shell del demo). NO editar la salida a mano.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const ROOT = process.cwd();
const CASES_DIR = path.join(ROOT, "docs/simulador/contrato_v0/cases_assembled");
const OUTPUT = path.join(ROOT, "lib/simulador/cases-registry.generated.ts");

const JUDGE_INTERNAL = new Set(["hint", "example", "issue", "goodWhen"]);
function stripJudge(value) {
  if (Array.isArray(value)) return value.map(stripJudge);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (JUDGE_INTERNAL.has(k)) continue;
      out[k] = stripJudge(v);
    }
    return out;
  }
  return value;
}

function toPlayable(ca) {
  const sections = (ca.sections ?? []).map((sec) => {
    const slides = [...(sec.slides ?? [])]
      .sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0))
      .map((sl) => ({
        slideId: `${sec.id}-${sl.slot}`,
        blockId: sl.block_id,
        title: sl.title ?? "",
        body: sl.body ?? "",
        caseContext:
          sl.content && typeof sl.content === "object"
            ? stripJudge(sl.content)
            : undefined,
      }));
    return { id: sec.id, name: sec.name ?? sec.id, slides };
  });
  return {
    caseId: ca.case_id ?? "",
    version: ca.version ?? 1,
    meta: ca.meta ?? {},
    managerOutcome: ca.manager_outcome ?? {},
    sections,
    totalSlides: sections.reduce((n, s) => n + s.slides.length, 0),
  };
}

const cases = {};
if (fs.existsSync(CASES_DIR)) {
  for (const file of fs.readdirSync(CASES_DIR).sort()) {
    if (!file.endsWith(".yaml") && !file.endsWith(".yml")) continue;
    const doc = yaml.load(fs.readFileSync(path.join(CASES_DIR, file), "utf8"));
    const ca = doc?.case_assembly;
    if (ca?.case_id) cases[ca.case_id] = toPlayable(ca);
  }
}

const header = `// AUTO-GENERADO por scripts/simulador/generate-cases-registry.mjs
// Fuente: docs/simulador/contrato_v0/cases_assembled/*.yaml
// NO editar a mano. Correr: node scripts/simulador/generate-cases-registry.mjs

import type { ExerciseBlockId } from "@/lib/simulador/exercise-blocks.generated";

export interface PlayableSlide {
  slideId: string;
  blockId: ExerciseBlockId;
  title: string;
  body: string;
  caseContext?: Record<string, unknown>;
}
export interface PlayableSection {
  id: string;
  name: string;
  slides: PlayableSlide[];
}
export interface PlayableCase {
  caseId: string;
  version: number;
  meta: Record<string, unknown>;
  managerOutcome: Record<string, unknown>;
  sections: PlayableSection[];
  totalSlides: number;
}
`;

const body = `\nexport const PLAYABLE_CASES: Record<string, PlayableCase> = ${JSON.stringify(cases, null, 2)};\n`;

fs.writeFileSync(OUTPUT, header + body, "utf8");
console.log(
  `generated cases-registry -> lib/simulador/cases-registry.generated.ts (${Object.keys(cases).length} casos)`,
);
