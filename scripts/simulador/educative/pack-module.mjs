#!/usr/bin/env node

/**
 * E3 · empacar — tercer paso del motor educativo (EDUCATIVE_ENGINE_SPEC §4).
 *
 * Toma el JSON que devuelve el workflow `educative-module` (E1 explicación +
 * E2 ejercicios con feedback) y lo empaca al YAML de practice_beat
 * (formative_slides) que valida y siembra seed-practice-beats.mjs (gate R-10).
 * Sin llamadas de IA: es empaquetado puro.
 *
 * Uso:
 *   node scripts/simulador/educative/pack-module.mjs \
 *     --module <salida-del-workflow.json> \
 *     --id module_claude5_fable_n1 \
 *     [--out docs/simulador/contrato_v0/practice_beats/<id>.yaml]
 *
 * Después: npm run simulador:seed-practice-beats -- --apply
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const modulePath = arg("module");
const id = arg("id");
if (!modulePath || !id) {
  console.error("Uso: pack-module.mjs --module <output.json> --id <module_id> [--out <path>]");
  process.exit(1);
}
const outPath =
  arg("out") ?? path.join("docs/simulador/contrato_v0/practice_beats", `${id}.yaml`);

const mod = JSON.parse(fs.readFileSync(modulePath, "utf8"));
const { e1_reading, cover, closing, principle, exercises, brief_tool, level } = mod;

if (!e1_reading?.body || !Array.isArray(exercises) || exercises.length === 0) {
  console.error("El JSON del módulo no trae e1_reading/exercises — ¿corrió E1/E2?");
  process.exit(1);
}

// Dimensión primaria del módulo = la más tocada por los ejercicios.
const dimCount = {};
for (const ex of exercises) {
  for (const d of ex.evaluates_dimensions ?? []) dimCount[d] = (dimCount[d] ?? 0) + 1;
}
const dimension =
  Object.entries(dimCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "ejecucion_ia";

const levelNum = Number(String(level ?? "N1").replace(/\D/g, "")) || 1;
const minutes = 2 + exercises.length * 2; // portada+lectura ~2min, ~2min por ejercicio

const slides = [
  {
    id: "portada",
    kind: "cover",
    title: cover.title,
    body: cover.body,
    // Copy del producto en inglés de EEUU (pivot 2026-07-15); coincide con
    // module_claude5_fable_n1.yaml ya relocalizado.
    chips: [`N${levelNum} · Fundamentals`, "AI update", `${minutes} min`],
  },
  {
    id: "contexto",
    kind: "reading",
    title: e1_reading.title,
    body: e1_reading.body,
  },
  ...exercises.map((ex, i) => ({
    id: `ejercicio_${i + 1}`,
    kind: "exercise",
    blockId: ex.block_id,
    title: ex.title,
    body: ex.body,
    caseContext: ex.content,
    feedback: ex.feedback,
  })),
  {
    id: "cierre",
    kind: "closing",
    title: closing.title,
    body: closing.body,
  },
];

const beat = {
  practice_beat: {
    id,
    status: "active",
    // Módulo de TEMA (broadcast): lo dispara un update del mercado de IA, no
    // un gap del operativo. triggered_by_gap vacío + career_key general.
    dimension,
    level: levelNum,
    career_key: "general",
    triggered_by_gap: [],
    duration_max_seconds: minutes * 60,
    module_kind: "topic",
    topic: brief_tool,
    principle_card: {
      headline: principle.headline,
      body: principle.body,
    },
    practice_exercise: {
      type: "formative_slides",
      blocks: exercises.map((ex) => ex.block_id),
      prompt: `AI update practice: ${brief_tool}. ${cover.body}`,
    },
    completion_criteria:
      "Complete every exercise (each row and each segment answered) and review the feedback for each one.",
    exit: { contributes_to_resim_score: false },
    slides,
  },
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, yaml.dump(beat, { lineWidth: 100, quotingType: '"' }));
console.log(`✓ módulo empacado → ${outPath}`);
console.log(`  dimension: ${dimension} · slides: ${slides.length} · ~${minutes} min`);
console.log(`  siguiente: npm run simulador:seed-practice-beats -- --apply`);
