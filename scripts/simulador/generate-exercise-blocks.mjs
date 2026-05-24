#!/usr/bin/env node
/**
 * generate-exercise-blocks.mjs
 *
 * Genera lib/simulador/exercise-blocks.generated.ts desde el catálogo canónico
 * docs/simulador/case_factory/EXERCISE_BLOCK_CATALOG.yaml (v0.2.0+).
 *
 * El YAML es la única fuente de verdad para los IDs de bloques de ejercicio.
 * Este script lo parsea y emite un TS tipado que el resto del repo puede importar.
 *
 * Uso:
 *   node scripts/simulador/generate-exercise-blocks.mjs
 *
 * Hookeado en `package.json` como `prebuild` y `predev` para que el archivo
 * generado siempre esté fresco sin pasos manuales.
 *
 * Decisión Pablo (2026-05-24): el TS manual lib/simulador/exercise-blocks.ts
 * (que tenía 27 bloques desanclados) se borró porque introducía drift. Esta
 * regeneración elimina drift por construcción.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../..");
const YAML_PATH = resolve(
  REPO_ROOT,
  "docs/simulador/case_factory/EXERCISE_BLOCK_CATALOG.yaml",
);
const OUT_PATH = resolve(
  REPO_ROOT,
  "lib/simulador/exercise-blocks.generated.ts",
);

function loadCatalog() {
  const raw = readFileSync(YAML_PATH, "utf8");
  const doc = yaml.load(raw);
  if (!doc?.exercise_block_catalog?.blocks) {
    throw new Error(
      `Schema inválido en ${YAML_PATH}: falta exercise_block_catalog.blocks`,
    );
  }
  return doc.exercise_block_catalog;
}

function quote(value) {
  if (value === null || value === undefined) return "null";
  return JSON.stringify(value);
}

function emitArray(arr) {
  if (!arr || arr.length === 0) return "[]";
  return `[${arr.map(quote).join(", ")}]`;
}

function emitStringArray(arr) {
  if (!arr || arr.length === 0) return "[]";
  return `[\n      ${arr.map(quote).join(",\n      ")},\n    ]`;
}

function emitBlock(block) {
  // Validación mínima de shape: campos requeridos del contrato
  const required = [
    "id",
    "family",
    "levels",
    "profiles",
    "primary_dimensions",
    "runtime_sections",
    "emits",
    "scoring_method",
    "completion",
  ];
  for (const field of required) {
    if (block[field] === undefined) {
      throw new Error(
        `Bloque ${block.id ?? "(sin id)"}: falta campo requerido "${field}"`,
      );
    }
  }

  return `  {
    id: ${quote(block.id)},
    labRef: ${quote(block.lab_ref ?? null)},
    publicName: ${quote(block.public_name ?? block.id)},
    family: ${quote(block.family)},
    levels: ${emitArray(block.levels)},
    profiles: ${emitStringArray(block.profiles)},
    primaryDimensions: ${emitArray(block.primary_dimensions)},
    runtimeSections: ${emitArray(block.runtime_sections)},
    whenToUse: ${emitStringArray(block.when_to_use ?? [])},
    avoidWhen: ${emitStringArray(block.avoid_when ?? [])},
    personalizationKnobs: ${emitStringArray(block.personalization_knobs ?? [])},
    emits: ${emitArray(block.emits)},
    uiPattern: ${quote(block.ui_pattern ?? "")},
    defaultEmptyFields: ${emitArray(block.default_empty_fields ?? [])},
    scoringMethod: ${quote(block.scoring_method)},
    completion: ${quote(block.completion)},
  }`;
}

function generate() {
  const catalog = loadCatalog();
  const blocks = catalog.blocks;
  const blockIds = blocks.map((b) => b.id);
  const families = [...new Set(blocks.map((b) => b.family))];
  const dimensions = [
    ...new Set(blocks.flatMap((b) => b.primary_dimensions ?? [])),
  ];
  const runtimeSections = [
    ...new Set(blocks.flatMap((b) => b.runtime_sections ?? [])),
  ];

  const idUnion = blockIds.map((id) => `"${id}"`).join(" | ");
  const familyUnion = families.map((f) => `"${f}"`).join(" | ");
  const dimensionUnion = dimensions.map((d) => `"${d}"`).join(" | ");
  const sectionUnion = runtimeSections.map((s) => `"${s}"`).join(" | ");

  const ts = `/* eslint-disable */
/**
 * AUTO-GENERATED — NO EDITAR A MANO.
 *
 * Fuente: docs/simulador/case_factory/EXERCISE_BLOCK_CATALOG.yaml v${catalog.version ?? "0.0.0"}
 * Generador: scripts/simulador/generate-exercise-blocks.mjs
 *
 * Para regenerar: \`bun run simulador:gen-blocks\`
 * Para validar sincronía con lab/runtime: \`bun run simulador:check-blocks\`
 *
 * Status del catálogo: ${catalog.status ?? "unknown"}
 * Total bloques: ${blocks.length}
 */

export type ExerciseBlockId = ${idUnion};

export type ExerciseBlockFamily = ${familyUnion};

export type ExerciseBlockDimension = ${dimensionUnion};

export type ExerciseBlockRuntimeSection = ${sectionUnion};

export type ExerciseBlockLevel = "N1" | "N2" | "N3";

export interface ExerciseBlock {
  id: ExerciseBlockId;
  labRef: string | null;
  publicName: string;
  family: ExerciseBlockFamily;
  levels: ExerciseBlockLevel[];
  profiles: string[];
  primaryDimensions: ExerciseBlockDimension[];
  runtimeSections: ExerciseBlockRuntimeSection[];
  whenToUse: string[];
  avoidWhen: string[];
  personalizationKnobs: string[];
  emits: string[];
  uiPattern: string;
  defaultEmptyFields: string[];
  scoringMethod: string;
  completion: string;
}

export const exerciseBlocks: ExerciseBlock[] = [
${blocks.map(emitBlock).join(",\n")},
];

export const exerciseBlockIds: ExerciseBlockId[] = [
${blockIds.map((id) => `  ${quote(id)}`).join(",\n")},
];

export const exerciseBlockById: Record<ExerciseBlockId, ExerciseBlock> =
  Object.fromEntries(exerciseBlocks.map((b) => [b.id, b])) as Record<
    ExerciseBlockId,
    ExerciseBlock
  >;

export const exerciseBlockStats = {
  total: ${blocks.length},
  families: ${JSON.stringify(
    families.reduce(
      (acc, f) => ({
        ...acc,
        [f]: blocks.filter((b) => b.family === f).length,
      }),
      {},
    ),
    null,
    2,
  ).replace(/\n/g, "\n  ")},
  catalogVersion: ${quote(catalog.version ?? "0.0.0")},
  catalogStatus: ${quote(catalog.status ?? "unknown")},
} as const;
`;

  writeFileSync(OUT_PATH, ts);
  console.log(
    `✓ generated ${blocks.length} bloques → lib/simulador/exercise-blocks.generated.ts`,
  );
  console.log(`  ids: ${blockIds.join(", ")}`);
}

try {
  generate();
} catch (err) {
  console.error("✗ generate-exercise-blocks failed:");
  console.error(err);
  process.exit(1);
}
