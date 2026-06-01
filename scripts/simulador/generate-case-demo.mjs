#!/usr/bin/env node

// Genera los datos del demo /case-demo DESDE el YAML ensamblado, para que el
// demo provenga del archivo (no haya un TSX hand-authored que pueda driftar).
// Mismo patron que generate-exercise-blocks.mjs (catalogo YAML -> TS generado).
//
//   Fuente:  docs/simulador/contrato_v0/cases_assembled/marketing_dirty_data_relaunch_v1.yaml
//   Salida:  app/case-demo/case-data.generated.ts
//
// Cada slide.content del YAML se emite como caseContext del bloque. Los campos
// judge_internal (hint/example/issue/goodWhen) viajan co-localizados; el shell
// del demo los remueve con stripJudgeFields antes de pasarlos al renderer
// (parity con el diseno actual). Editar el YAML y correr este generador; NO
// editar el archivo generado a mano.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const ROOT = process.cwd();
const DEFAULT_SOURCE = path.join(
  ROOT,
  "docs/simulador/contrato_v0/cases_assembled/marketing_dirty_data_relaunch_v1.yaml",
);
// argv[2] opcional: ruta a otro YAML a renderizar (ej. un caso generado). Sin
// argumento usa el golden, para que predev/prebuild sigan igual.
const SOURCE = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_SOURCE;
const OUTPUT = path.join(ROOT, "app/case-demo/case-data.generated.ts");

const ca = yaml.load(fs.readFileSync(SOURCE, "utf8"))?.case_assembly;
if (!ca) {
  console.error("GENERATE_CASE_DEMO ERROR: no se encontro case_assembly en el YAML");
  process.exit(1);
}

const sections = (ca.sections ?? []).map((sec) => {
  const slides = [...(sec.slides ?? [])].sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0));
  return slides.map((slide) => {
    const out = {
      blockId: slide.block_id,
      title: slide.title ?? "",
      body: slide.body ?? "",
    };
    if (slide.content !== undefined && slide.content !== null) {
      out.caseContext = slide.content;
    }
    return out;
  });
});

const header = `// AUTO-GENERADO por scripts/simulador/generate-case-demo.mjs
// Fuente: docs/simulador/contrato_v0/cases_assembled/marketing_dirty_data_relaunch_v1.yaml
// NO editar a mano. Editar el YAML y correr: node scripts/simulador/generate-case-demo.mjs
//
// El demo /case-demo proviene de este archivo, que proviene del YAML ensamblado.

import type { ExerciseBlockId } from "@/lib/simulador/exercise-blocks.generated";

export interface Slide {
  blockId: ExerciseBlockId;
  title: string;
  body: string;
  /** Contenido del caso (caseContext del bloque). Puede incluir campos
   *  judge_internal (hint, example, issue, goodWhen) co-localizados; el shell
   *  los remueve con stripJudgeFields antes de pasarlos al renderer. */
  caseContext?: Record<string, unknown>;
}

export const CASE_ID = ${JSON.stringify(ca.case_id ?? "")};
export const CASE_VERSION = ${JSON.stringify(ca.version ?? 1)};
`;

const body = `\nexport const SLIDES: Slide[][] = ${JSON.stringify(sections, null, 2)};\n`;

fs.writeFileSync(OUTPUT, header + body, "utf8");

const total = sections.reduce((n, s) => n + s.length, 0);
console.log(
  `generated case-demo -> app/case-data.generated.ts (${sections.length} secciones, ${total} slides)`,
);
