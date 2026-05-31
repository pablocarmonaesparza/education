#!/usr/bin/env node

// De-risk de los gates deterministas del motor de generación.
// Toma el caso de oro, genera variantes ROTAS a propósito (estructural,
// contenido, copy, narrativo) y verifica que:
//   - el golden pasa TODOS los gates;
//   - cada fixture roto FALLA el gate que le toca;
//   - los fixtures NARRATIVOS pasan los gates deterministas (resultado clave:
//     prueba que structural+content+copy son CIEGOS a la incoherencia narrativa,
//     que es exactamente lo que el juez LLM tiene que cazar en F0.6).
//
// Los fixtures se escriben a un directorio temporal y NO se borran, para que el
// de-risk del juez (F0.6) pueda correr contra los narrativos.
//
// Uso: node scripts/simulador/test-case-factory.mjs

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import yaml from "js-yaml";

const ROOT = process.cwd();
const GOLDEN = path.join(
  ROOT,
  "docs/simulador/contrato_v0/cases_assembled/marketing_dirty_data_relaunch_v1.yaml",
);
const OUT_DIR = path.join(os.tmpdir(), "itera-case-fixtures");
fs.mkdirSync(OUT_DIR, { recursive: true });

const goldenDoc = yaml.load(fs.readFileSync(GOLDEN, "utf8"));
const clone = (o) => JSON.parse(JSON.stringify(o));
const slide = (ca, secId, slot) =>
  ca.case_assembly.sections.find((s) => s.id === secId).slides.find((sl) => sl.slot === slot);

// Cada fixture: nombre, gate que DEBE fallar ("assembled" | "copy" | "none"),
// categoría (para el reporte), y la mutación sobre un clon del golden.
const FIXTURES = [
  // ---- Estructurales (los caza check-assembled-case) ----
  { name: "struct_first_not_cover", expect: "assembled", cat: "estructura",
    mutate: (ca) => { slide(ca, "contexto", 1).block_id = "reading_message"; } },
  { name: "struct_last_wrong", expect: "assembled", cat: "estructura",
    mutate: (ca) => { slide(ca, "cierre", 5).block_id = "reading_passive"; } },
  { name: "struct_ratio_low", expect: "assembled", cat: "estructura",
    mutate: (ca) => { slide(ca, "ia", 3).block_id = "reading_passive"; } },
  { name: "struct_section_illegal", expect: "assembled", cat: "estructura",
    mutate: (ca) => { slide(ca, "revision", 2).block_id = "ai_textfield_free"; } },
  { name: "struct_level_illegal", expect: "assembled", cat: "estructura",
    mutate: (ca) => { slide(ca, "cierre", 1).block_id = "dashboard_pivot"; } },
  { name: "struct_slide_count", expect: "assembled", cat: "estructura",
    mutate: (ca) => { ca.case_assembly.sections.find((s) => s.id === "datos").slides.pop(); } },

  // ---- Contenido (los caza la validación de contenido por bloque) ----
  { name: "content_comparison_3", expect: "assembled", cat: "contenido",
    mutate: (ca) => { slide(ca, "revision", 2).content.options.pop(); } },
  { name: "content_prefill_decision", expect: "assembled", cat: "contenido",
    mutate: (ca) => { slide(ca, "cierre", 5).content.decision = "lanzar_lunes"; } },
  { name: "content_missing_required", expect: "assembled", cat: "contenido",
    mutate: (ca) => { delete slide(ca, "revision", 5).content.options; } },
  { name: "content_options_string", expect: "assembled", cat: "contenido",
    mutate: (ca) => { slide(ca, "revision", 2).content.options = "no soy un array"; } },
  { name: "content_guided_not_object", expect: "assembled", cat: "contenido",
    mutate: (ca) => { slide(ca, "ia", 2).content.guided = "no soy un objeto"; } },
  { name: "content_table_cols_string", expect: "assembled", cat: "contenido",
    mutate: (ca) => { slide(ca, "contexto", 3).content.table.columns = "no soy un array"; } },
  { name: "content_row_missing_id", expect: "assembled", cat: "contenido",
    mutate: (ca) => { delete slide(ca, "datos", 1).content.rows[0].id; } },
  { name: "content_segment_no_flag", expect: "assembled", cat: "contenido",
    mutate: (ca) => { delete slide(ca, "ia", 3).content.segments[0].flagIfMarked; } },
  { name: "content_prefill_cost", expect: "assembled", cat: "contenido",
    mutate: (ca) => { slide(ca, "datos", 3).content.cost_priority = 100; } },
  { name: "content_message_no_channel", expect: "assembled", cat: "contenido",
    mutate: (ca) => { delete slide(ca, "contexto", 2).content.message.channel; } },
  { name: "content_comparison_bad_id", expect: "assembled", cat: "contenido",
    mutate: (ca) => { slide(ca, "revision", 2).content.options[0].id = "Z"; } },
  { name: "content_guided_non_string", expect: "assembled", cat: "contenido",
    mutate: (ca) => { slide(ca, "ia", 2).content.guided.objetivos[0] = 123; } },
  { name: "content_table_row_not_obj", expect: "assembled", cat: "contenido",
    mutate: (ca) => { slide(ca, "contexto", 3).content.table.rows[0] = "no soy objeto"; } },
  { name: "content_attachment_no_kind", expect: "assembled", cat: "contenido",
    mutate: (ca) => { delete slide(ca, "datos", 5).content.attachments[0].kind; } },
  { name: "content_not_data_driven", expect: "assembled", cat: "contenido",
    mutate: (ca) => { ca.case_assembly.meta.level = "N2 · Intermedio"; slide(ca, "cierre", 1).block_id = "dashboard_pivot"; } },

  // ---- Copy (los caza lint-case-copy) ----
  { name: "copy_emdash", expect: "copy", cat: "copy",
    mutate: (ca) => { slide(ca, "contexto", 2).body += " Una nota extra — sin razón."; } },
  { name: "copy_acronym", expect: "copy", cat: "copy",
    mutate: (ca) => { slide(ca, "contexto", 2).body += " Cuidado con la PII del cliente."; } },

  // ---- Narrativos (NINGÚN gate determinista los caza · para el juez F0.6) ----
  { name: "narr_recipient_swap", expect: "none", cat: "narrativo",
    mutate: (ca) => { slide(ca, "revision", 5).content.options[0].body = "Hola Mariana, te escribo para venderte nuestro producto de retención."; } },
  { name: "narr_data_contradiction", expect: "none", cat: "narrativo",
    mutate: (ca) => { slide(ca, "contexto", 4).content.kpis[1].value = "0.0%"; } },
  { name: "narr_promise_unfulfilled", expect: "none", cat: "narrativo",
    mutate: (ca) => { slide(ca, "contexto", 2).content.message.body += " Mándame también un análisis completo de la competencia."; } },
];

function runGate(script, file) {
  try {
    execFileSync("node", [path.join("scripts/simulador", script), file], {
      cwd: ROOT,
      stdio: "pipe",
    });
    return true; // exit 0 = PASS
  } catch {
    return false; // exit != 0 = FAIL
  }
}

function gatesFor(file) {
  return {
    assembled: runGate("check-assembled-case.mjs", file),
    copy: runGate("lint-case-copy.mjs", file),
  };
}

// Golden: debe pasar todo.
const goldenGates = gatesFor(GOLDEN);
const failures = [];
if (!goldenGates.assembled) failures.push("golden: falla check-assembled-case (debería pasar)");
if (!goldenGates.copy) failures.push("golden: falla lint-case-copy (debería pasar)");

const rows = [];
for (const fx of FIXTURES) {
  const ca = clone(goldenDoc);
  fx.mutate(ca);
  const file = path.join(OUT_DIR, `${fx.name}.yaml`);
  fs.writeFileSync(file, yaml.dump(ca), "utf8");
  const g = gatesFor(file);

  let verdict;
  if (fx.expect === "assembled") verdict = g.assembled === false;
  else if (fx.expect === "copy") verdict = g.copy === false && g.assembled === true;
  else verdict = g.assembled === true && g.copy === true; // narrativo: deterministas ciegos

  rows.push({ ...fx, assembled: g.assembled, copy: g.copy, ok: verdict });
  if (!verdict) {
    failures.push(
      `${fx.name} (${fx.cat}): esperaba ${fx.expect} · assembled=${g.assembled ? "PASS" : "FAIL"} copy=${g.copy ? "PASS" : "FAIL"}`,
    );
  }
}

// Reporte
const pad = (s, n) => String(s).padEnd(n);
console.log(`\ngolden: assembled=${goldenGates.assembled ? "PASS" : "FAIL"} copy=${goldenGates.copy ? "PASS" : "FAIL"}\n`);
console.log(`${pad("fixture", 26)}${pad("categoría", 12)}${pad("espera", 10)}${pad("assembled", 11)}${pad("copy", 7)}ok`);
console.log("-".repeat(72));
for (const r of rows) {
  console.log(
    `${pad(r.name, 26)}${pad(r.cat, 12)}${pad(r.expect, 10)}${pad(r.assembled ? "PASS" : "FAIL", 11)}${pad(r.copy ? "PASS" : "FAIL", 7)}${r.ok ? "✓" : "✗"}`,
  );
}
console.log(`\nfixtures en: ${OUT_DIR}`);

if (failures.length > 0) {
  console.error(`\nTEST_CASE_FACTORY FAIL:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`\nTEST_CASE_FACTORY OK · ${rows.length} fixtures, gates deterministas se comportan como se espera.`);
