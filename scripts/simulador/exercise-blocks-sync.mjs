#!/usr/bin/env node
/**
 * exercise-blocks-sync.mjs
 *
 * Valida que los IDs de bloques de ejercicio sean coherentes entre las capas:
 *
 *   1. YAML canónico        docs/simulador/case_factory/EXERCISE_BLOCK_CATALOG.yaml
 *   2. Generated TS         lib/simulador/exercise-blocks.generated.ts
 *   3. UI lab               app/exercise-lab/ExerciseLabClient.tsx (exerciseList)
 *   4. case-lab slide types lib/simulador/case-lab-cases.ts (DemoSlideType enum)
 *
 * Falla con exit 1 si encuentra drift. Diseñado para correr en pre-commit o CI.
 *
 * Uso:
 *   node scripts/simulador/exercise-blocks-sync.mjs        # validar
 *   bun run simulador:check-blocks                          # alias
 *
 * Notas:
 * - Capa 1 es la única autoridad. Si capa 2 tiene IDs que no están en 1, falla
 *   (probablemente el generator está stale → corre simulador:gen-blocks).
 * - Capa 3 actualmente usa kebab-español (textfield-ia-libre, tabla-datos, ...)
 *   por inercia histórica. El script tolera esto vía SHIM_LAB_TO_CANONICAL
 *   mapping documentado abajo; este shim debe vaciarse en el Día 3 cuando los
 *   renderers se extraigan a archivos por ID canónico.
 * - Capa 4 (DemoSlideType enum) NO sincroniza 1:1 con bloques canónicos hoy
 *   — el shim TYPE_TO_CANONICAL mapea cada slide type a 0..1 bloques canónicos.
 *   Reglas:
 *     reading → null (no es un bloque, es un slide pasivo)
 *     ai_textfield → ai_textfield_free
 *     guided_prompt → ai_textfield_guided
 *     data_table → data_table_triage
 *     output_review → ai_output_review
 *     decision → null (decision standalone no es bloque del catálogo)
 *     memo → tradeoff_decision_memo (combinado con decision)
 *     agent_brief → agent_brief_builder
 *     permission_matrix → permission_matrix
 *     log_review → run_log_review
 *     dashboard_pivot → dashboard_pivot
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../..");

const YAML_PATH = resolve(
  REPO_ROOT,
  "docs/simulador/case_factory/EXERCISE_BLOCK_CATALOG.yaml",
);
const GENERATED_TS = resolve(
  REPO_ROOT,
  "lib/simulador/exercise-blocks.generated.ts",
);
const LAB_CLIENT = resolve(
  REPO_ROOT,
  "app/exercise-lab/ExerciseLabClient.tsx",
);
const CASE_LAB_TYPES = resolve(REPO_ROOT, "lib/simulador/case-lab-cases.ts");

// Mapeo histórico kebab-español → ID canónico del YAML.
// Día 3 del plan elimina este shim cuando los renderers se renombren.
const SHIM_LAB_TO_CANONICAL = {
  "textfield-ia-libre": "ai_textfield_free",
  "textfield-ia-guiado": "ai_textfield_guided",
  "tabla-datos": "data_table_triage",
  "matriz-permisos": "permission_matrix",
  "revision-output": "ai_output_review",
  "comparacion-ia": "ai_comparison",
  "workflow-builder": "workflow_builder",
  "agent-brief": "agent_brief_builder",
  logs: "run_log_review",
  "dashboard-pivot": "dashboard_pivot",
  "decision-memo": "tradeoff_decision_memo",
};

// case-lab DemoSlideType → bloque canónico (null si no aplica).
const TYPE_TO_CANONICAL = {
  reading: null,
  ai_textfield: "ai_textfield_free",
  guided_prompt: "ai_textfield_guided",
  data_table: "data_table_triage",
  output_review: "ai_output_review",
  decision: null,
  memo: "tradeoff_decision_memo",
  agent_brief: "agent_brief_builder",
  permission_matrix: "permission_matrix",
  log_review: "run_log_review",
  dashboard_pivot: "dashboard_pivot",
};

// --------------------------------------------------------------------------
// Loaders
// --------------------------------------------------------------------------

function loadYamlIds() {
  const raw = readFileSync(YAML_PATH, "utf8");
  const doc = yaml.load(raw);
  return new Set(doc.exercise_block_catalog.blocks.map((b) => b.id));
}

function loadGeneratedIds() {
  const src = readFileSync(GENERATED_TS, "utf8");
  const match = src.match(/exerciseBlockIds: ExerciseBlockId\[\] = \[([^\]]+)\]/);
  if (!match) throw new Error("No se pudo extraer exerciseBlockIds del generated TS");
  return new Set(
    match[1]
      .split(",")
      .map((s) => s.trim().replace(/['"]/g, ""))
      .filter(Boolean),
  );
}

function loadLabIds() {
  const src = readFileSync(LAB_CLIENT, "utf8");
  // Captura todos los `id: "..."` dentro de objetos del exerciseList.
  // El exerciseList es el bloque que enumera los ejercicios renderizados.
  // Hacemos parsing por regex sobre los IDs conocidos en SHIM para
  // evitar falsos positivos de otros `id:` del archivo (ej. modelGroups).
  const ids = new Set();
  for (const labId of Object.keys(SHIM_LAB_TO_CANONICAL)) {
    const re = new RegExp(`\\bid:\\s*["']${labId}["']`);
    if (re.test(src)) ids.add(labId);
  }
  return ids;
}

function loadCaseLabSlideTypes() {
  const src = readFileSync(CASE_LAB_TYPES, "utf8");
  const match = src.match(/export type DemoSlideType =([\s\S]*?);/);
  if (!match) throw new Error("No se pudo extraer DemoSlideType de case-lab-cases.ts");
  return new Set(
    match[1]
      .split("|")
      .map((s) => s.trim().replace(/['"]/g, ""))
      .filter((s) => s.length > 0),
  );
}

// --------------------------------------------------------------------------
// Validations
// --------------------------------------------------------------------------

function checkYamlVsGenerated(yamlIds, genIds) {
  const onlyInYaml = [...yamlIds].filter((id) => !genIds.has(id));
  const onlyInGen = [...genIds].filter((id) => !yamlIds.has(id));
  const errors = [];
  if (onlyInYaml.length > 0) {
    errors.push(
      `IDs en YAML pero NO en generated TS: ${onlyInYaml.join(", ")}\n` +
        `  → corre: bun run simulador:gen-blocks`,
    );
  }
  if (onlyInGen.length > 0) {
    errors.push(
      `IDs en generated TS pero NO en YAML: ${onlyInGen.join(", ")}\n` +
        `  → el generador está leyendo del YAML, esto no debería pasar.`,
    );
  }
  return errors;
}

function checkLabVsYaml(labIds, yamlIds) {
  const errors = [];
  for (const labId of labIds) {
    const canonical = SHIM_LAB_TO_CANONICAL[labId];
    if (!canonical) {
      errors.push(
        `Lab ID "${labId}" no tiene mapping a canónico. Agregar al SHIM o renombrar.`,
      );
      continue;
    }
    if (!yamlIds.has(canonical)) {
      errors.push(
        `Lab ID "${labId}" mapea a "${canonical}" pero ese ID no existe en YAML.`,
      );
    }
  }
  return errors;
}

function checkCaseLabTypesVsYaml(types, yamlIds) {
  const errors = [];
  for (const type of types) {
    if (!(type in TYPE_TO_CANONICAL)) {
      errors.push(
        `DemoSlideType "${type}" no tiene mapping. Agregar a TYPE_TO_CANONICAL o quitar del enum.`,
      );
      continue;
    }
    const canonical = TYPE_TO_CANONICAL[type];
    if (canonical !== null && !yamlIds.has(canonical)) {
      errors.push(
        `DemoSlideType "${type}" mapea a "${canonical}" pero ese ID no existe en YAML.`,
      );
    }
  }
  return errors;
}

// --------------------------------------------------------------------------
// Run
// --------------------------------------------------------------------------

function main() {
  console.log("→ Validando sincronía de exercise blocks…\n");

  const yamlIds = loadYamlIds();
  const genIds = loadGeneratedIds();
  const labIds = loadLabIds();
  const slideTypes = loadCaseLabSlideTypes();

  console.log(`  YAML canónico            : ${yamlIds.size} IDs`);
  console.log(`  Generated TS             : ${genIds.size} IDs`);
  console.log(`  Lab UI (exerciseList)    : ${labIds.size} IDs (via shim)`);
  console.log(`  case-lab DemoSlideType   : ${slideTypes.size} types`);
  console.log("");

  const errors = [
    ...checkYamlVsGenerated(yamlIds, genIds),
    ...checkLabVsYaml(labIds, yamlIds),
    ...checkCaseLabTypesVsYaml(slideTypes, yamlIds),
  ];

  if (errors.length === 0) {
    console.log("✓ sync OK — todas las capas alineadas con el YAML canónico");
    process.exit(0);
  }

  console.error(`✗ sync FAILED — ${errors.length} error(es):\n`);
  for (const err of errors) {
    console.error(`  • ${err}\n`);
  }
  process.exit(1);
}

main();
