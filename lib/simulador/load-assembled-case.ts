// Carga un caso ensamblado (formato 5x5 rico, 17 bloques) para jugarlo en el
// runtime productivo config-driven (RuntimeExperienceV2).
//
// Lee del REGISTRO generado en build-time (cases-registry.generated.ts), que
// proviene de los YAML ensamblados. En PRODUCCIÓN esto se reemplaza por una
// lectura de la base (caso por empresa); la firma queda igual para que el swap
// sea de una línea, y la forma PlayableCase es la misma.

import {
  PLAYABLE_CASES,
  type PlayableCase,
} from "@/lib/simulador/cases-registry.generated";

export type {
  PlayableCase,
  PlayableSection,
  PlayableSlide,
} from "@/lib/simulador/cases-registry.generated";

/** Carga un caso ensamblado por su case_id (slug). Devuelve null si no existe. */
export function loadAssembledCase(slug: string): PlayableCase | null {
  return PLAYABLE_CASES[slug] ?? null;
}

/** Lista los case_id disponibles (para un índice de casos). */
export function listAssembledCaseIds(): Array<{ caseId: string; title: string }> {
  return Object.values(PLAYABLE_CASES).map((c) => ({
    caseId: c.caseId,
    title: c.sections[0]?.slides[0]?.title ?? c.caseId,
  }));
}
