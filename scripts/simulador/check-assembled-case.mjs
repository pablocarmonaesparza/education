#!/usr/bin/env node

// Valida los casos ensamblados (docs/simulador/contrato_v0/cases_assembled/*.yaml)
// contra CASE_ASSEMBLY_SCHEMA.yaml, que es la AUTORIDAD del modelo de 5 secciones.
// Esto es lo que faltaba: ningun check validaba los casos ensamblados, asi que
// un error de ratio o de seccion se podia colar. Reglas verificadas por caso:
//   - 5 secciones con los nombres y el orden de section_names
//   - 5 slots 1..5 por seccion (25 slides totales)
//   - primer slide = first_slide; ultimo slide en last_section_must_close_with
//   - ratio ai_native >= ai_native_ratio_min (contado por FAMILIA del catalogo)
//   - ratio pasivos <= passive_ratio_max
//   - al menos 1 bloque activo por seccion (salvo las de at_least_one_active_per_section_except)
//   - seccion permitida por bloque (block_section_constraints) · nivel (block_level_constraints)
//   - cada slide trae content
//
// NOTA: la autoridad de secciones es block_section_constraints del schema, NO el
// runtime_sections del catalogo (que describe el runtime productivo legacy de 6
// secciones). Ver el comentario en EXERCISE_BLOCK_CATALOG.yaml.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const ROOT = process.cwd();
const FACTORY_DIR = path.join(ROOT, "docs/simulador/case_factory");
const CASES_DIR = path.join(ROOT, "docs/simulador/contrato_v0/cases_assembled");

const issues = [];
const check = (condition, message) => {
  if (!condition) issues.push(message);
};

function loadYaml(fullPath) {
  return yaml.load(fs.readFileSync(fullPath, "utf8"));
}

// ---- Autoridad: schema de ensamble ----
const schema = loadYaml(
  path.join(FACTORY_DIR, "CASE_ASSEMBLY_SCHEMA.yaml"),
)?.case_assembly_schema;
const rules = schema?.rules ?? {};
const SECTION_NAMES = rules.section_names ?? [
  "contexto",
  "datos",
  "ia",
  "revision",
  "cierre",
];
const SLIDES_PER_SECTION = rules.slides_per_section ?? 5;
const TOTAL_SLIDES = rules.total_slides ?? 25;
const FIRST = rules.first_slide ?? {};
const LAST = rules.last_section_must_close_with ?? {};
const AI_MIN = rules.ai_native_ratio_min ?? 0.6;
const PASSIVE_MAX = rules.passive_ratio_max ?? 0.4;
const ACTIVE_EXCEPT = rules.at_least_one_active_per_section_except ?? ["contexto"];
const SECTION_CONSTRAINTS = rules.block_section_constraints ?? {};
const LEVEL_CONSTRAINTS = rules.block_level_constraints ?? {};

// ---- Familia por bloque (del catalogo) ----
const catalogBlocks =
  loadYaml(path.join(FACTORY_DIR, "EXERCISE_BLOCK_CATALOG.yaml"))
    ?.exercise_block_catalog?.blocks ?? [];
const familyById = {};
for (const block of catalogBlocks) familyById[block.id] = block.family;

function levelToken(metaLevel) {
  const match = String(metaLevel ?? "").match(/N[123]/);
  return match ? match[0] : null;
}

// ---- Casos ensamblados ----
if (!fs.existsSync(CASES_DIR)) {
  console.log("assembled cases OK (0 · sin carpeta cases_assembled)");
  process.exit(0);
}

const files = fs
  .readdirSync(CASES_DIR)
  .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));

for (const file of files) {
  const ca = loadYaml(path.join(CASES_DIR, file))?.case_assembly;
  const id = ca?.case_id ?? file;

  if (!ca) {
    check(false, `${file}: falta el top-level case_assembly`);
    continue;
  }

  check(Boolean(ca.case_id), `${id}: falta case_id`);
  check(Boolean(ca.meta?.level), `${id}: falta meta.level`);
  const level = levelToken(ca.meta?.level);
  check(
    Boolean(level),
    `${id}: meta.level no contiene N1/N2/N3 ("${ca.meta?.level}")`,
  );

  const sections = ca.sections ?? [];
  check(
    sections.length === SECTION_NAMES.length,
    `${id}: ${sections.length} secciones, deben ser ${SECTION_NAMES.length}`,
  );
  sections.forEach((sec, i) => {
    if (SECTION_NAMES[i]) {
      check(
        sec.id === SECTION_NAMES[i],
        `${id}: seccion ${i + 1} es "${sec.id}", debe ser "${SECTION_NAMES[i]}"`,
      );
    }
  });

  let totalSlides = 0;
  let aiNative = 0;
  let passive = 0;

  for (const sec of sections) {
    const slides = sec.slides ?? [];
    check(
      slides.length === SLIDES_PER_SECTION,
      `${id}/${sec.id}: ${slides.length} slides, deben ser ${SLIDES_PER_SECTION}`,
    );

    const slots = slides.map((s) => s.slot);
    for (let k = 1; k <= SLIDES_PER_SECTION; k++) {
      check(slots.includes(k), `${id}/${sec.id}: falta slot ${k}`);
    }

    let sectionHasActive = false;
    for (const slide of slides) {
      totalSlides++;
      const bid = slide.block_id;
      const family = familyById[bid];

      check(Boolean(family), `${id}/${sec.id}/slot${slide.slot}: block_id desconocido "${bid}"`);
      if (family === "ai_native") {
        aiNative++;
        sectionHasActive = true;
      } else if (family === "passive") {
        passive++;
      } else if (family) {
        // traditional_* cuenta como activo (no es pasivo) pero NO como ai_native
        sectionHasActive = true;
      }

      const allowedSecs = SECTION_CONSTRAINTS[bid];
      if (allowedSecs) {
        check(
          allowedSecs.includes(sec.id),
          `${id}/${sec.id}/slot${slide.slot}: "${bid}" no permitido en seccion "${sec.id}" (permitido: ${allowedSecs.join(", ")})`,
        );
      }

      const allowedLevels = LEVEL_CONSTRAINTS[bid];
      if (allowedLevels && level) {
        check(
          allowedLevels.includes(level),
          `${id}/${sec.id}/slot${slide.slot}: "${bid}" no permitido en nivel ${level} (permitido: ${allowedLevels.join(", ")})`,
        );
      }

      // content es opcional (reading_passive y ai_textfield_free pueden
      // renderizar solo de title/body). Si viene, debe ser un objeto.
      if (slide.content !== undefined && slide.content !== null) {
        check(
          typeof slide.content === "object" && !Array.isArray(slide.content),
          `${id}/${sec.id}/slot${slide.slot}: "${bid}" content debe ser un objeto`,
        );
      }
    }

    if (!ACTIVE_EXCEPT.includes(sec.id)) {
      check(
        sectionHasActive,
        `${id}/${sec.id}: necesita al menos 1 bloque activo (ai_native o traditional)`,
      );
    }
  }

  check(
    totalSlides === TOTAL_SLIDES,
    `${id}: ${totalSlides} slides totales, deben ser ${TOTAL_SLIDES}`,
  );

  const firstSec = sections.find((s) => s.id === FIRST.section);
  const firstSlide = firstSec?.slides?.find((s) => s.slot === FIRST.slot);
  check(
    firstSlide?.block_id === FIRST.block_id,
    `${id}: primer slide debe ser ${FIRST.block_id} en ${FIRST.section} slot ${FIRST.slot}, es "${firstSlide?.block_id}"`,
  );

  const lastSecName = SECTION_NAMES[SECTION_NAMES.length - 1];
  const lastSec = sections.find((s) => s.id === lastSecName);
  const lastSlot = LAST.slot ?? SLIDES_PER_SECTION;
  const lastSlide = lastSec?.slides?.find((s) => s.slot === lastSlot);
  check(
    (LAST.block_ids ?? []).includes(lastSlide?.block_id),
    `${id}: ultimo slide (${lastSecName} slot ${lastSlot}) debe cerrar con uno de [${(LAST.block_ids ?? []).join(", ")}], es "${lastSlide?.block_id}"`,
  );

  if (totalSlides === TOTAL_SLIDES) {
    const aiRatio = aiNative / TOTAL_SLIDES;
    const passiveRatio = passive / TOTAL_SLIDES;
    check(
      aiRatio >= AI_MIN,
      `${id}: ratio ai_native ${(aiRatio * 100).toFixed(0)}% (${aiNative}/${TOTAL_SLIDES}) por debajo del minimo ${(AI_MIN * 100).toFixed(0)}%`,
    );
    check(
      passiveRatio <= PASSIVE_MAX,
      `${id}: ratio pasivos ${(passiveRatio * 100).toFixed(0)}% (${passive}/${TOTAL_SLIDES}) por encima del maximo ${(PASSIVE_MAX * 100).toFixed(0)}%`,
    );
  }
}

if (issues.length > 0) {
  for (const issue of issues) console.error(`ASSEMBLED_CASE ERROR ${issue}`);
  process.exit(1);
}

console.log(`assembled cases OK (${files.length})`);
