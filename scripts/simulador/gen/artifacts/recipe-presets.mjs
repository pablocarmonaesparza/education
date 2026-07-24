// Recetas de estructura pre-validadas (el blueprint sin contenido).
//
// Cada receta es la lista de 25 {section, slot, block_id} que YA cumple: 5x5,
// ratio ai_native >= 60%, legalidad seccion/nivel, primer slide case_cover,
// cierre con tradeoff_decision_memo. Sembrada del golden (verificada por
// check-assembled-case). Usar recetas elimina la clase de fallo "estructura
// invalida" del loop: el generador solo escribe CONTENIDO, no inventa estructura.
//
// Bloques excluidos a proposito (no data-driven todavia): workflow_builder,
// dashboard_pivot. El validador los rechaza en casos.

// N1 · Fundamentos · 15/25 ai_native. Estructura del golden marketing_dirty_data.
const N1_RETENTION = [
  // contexto (5 pasivos · onboarding)
  { section: "contexto", slot: 1, block_id: "case_cover" },
  { section: "contexto", slot: 2, block_id: "reading_message" },
  { section: "contexto", slot: 3, block_id: "reading_data_table" },
  { section: "contexto", slot: 4, block_id: "reading_kpi_cards" },
  { section: "contexto", slot: 5, block_id: "reading_message" },
  // datos (4 ai_native + 1 pasivo)
  { section: "datos", slot: 1, block_id: "categorize_rows" },
  { section: "datos", slot: 2, block_id: "categorize_rows" },
  { section: "datos", slot: 3, block_id: "model_tradeoff_sliders" },
  { section: "datos", slot: 4, block_id: "ai_textfield_free" },
  { section: "datos", slot: 5, block_id: "reading_attachment" },
  // ia (4 ai_native + 1 pasivo)
  { section: "ia", slot: 1, block_id: "reading_passive" },
  { section: "ia", slot: 2, block_id: "ai_textfield_guided" },
  { section: "ia", slot: 3, block_id: "ai_output_review" },
  { section: "ia", slot: 4, block_id: "ai_textfield_free" },
  { section: "ia", slot: 5, block_id: "ai_output_review" },
  // revision (4 ai_native + 1 pasivo)
  { section: "revision", slot: 1, block_id: "ai_output_review" },
  { section: "revision", slot: 2, block_id: "ai_comparison" },
  { section: "revision", slot: 3, block_id: "reading_message" },
  { section: "revision", slot: 4, block_id: "categorize_rows" },
  { section: "revision", slot: 5, block_id: "ai_comparison" },
  // cierre (3 ai_native + 1 pasivo + 1 traditional_closure)
  { section: "cierre", slot: 1, block_id: "ai_comparison" },
  { section: "cierre", slot: 2, block_id: "ai_textfield_free" },
  { section: "cierre", slot: 3, block_id: "categorize_rows" },
  { section: "cierre", slot: 4, block_id: "reading_passive" },
  { section: "cierre", slot: 5, block_id: "tradeoff_decision_memo" },
];

export const RECIPES = {
  N1: [{ id: "n1_retention", level: "N1 · Foundations", slots: N1_RETENTION }],
};

export function pickRecipe(level) {
  const token = String(level ?? "").match(/N[123]/)?.[0] ?? "N1";
  const list = RECIPES[token] ?? RECIPES.N1;
  return list[0];
}

// Los IDs de seccion son IDENTIFICADORES (CASE_ASSEMBLY_SCHEMA los fuerza; no
// cambian con el pivot a EEUU). El display en ingles vive en SECTION_DISPLAY,
// igual que en los casos golden relocalizados a mano.
export const SECTION_NAMES = ["contexto", "datos", "ia", "revision", "cierre"];

export const SECTION_DISPLAY = {
  contexto: "Context",
  datos: "Data",
  ia: "AI",
  revision: "Verification",
  cierre: "Close",
};
