/**
 * Override matrix determinístico — corre POST-LLM.
 *
 * El LLM produce una `recommendation.action` basada en su criterio de las
 * bandas + risk events. Pero ciertos eventos hard-block la recomendación
 * independiente de cómo el LLM la lea:
 *
 *   • cualquier risk_event severity=high  → max(action) = "pausar"
 *   • risk_event severity=medium + cualquier banda B → max(action) = "entrenar"
 *   • 2+ bandas B en dimensiones críticas    → max(action) = "pausar"
 *   • ningún risk_event + 6 bandas A         → "pilotar" (sin cambio)
 *
 * Estas reglas viven SOLO aquí (fuente única). El "espejo SQL"
 * simulador.compute_recommendation se retiró en la migración 20260702130000
 * (R-17 del RULES_LEDGER): había divergido y no tenía callers — un espejo
 * con reglas distintas es peor que ninguno.
 *
 * El judge LLM nunca produce "escalar" — esa acción es manual desde el
 * admin queue cuando se detecta patrón cross-equipo. Si el LLM la propone,
 * la degradamos a "pausar".
 */

import type {
  Band,
  JudgeOutput,
  JudgeRecommendation,
  Recommendation,
} from "./types";

interface AppliedOverride {
  rule: string;
  before: Recommendation | Band;
  after: Recommendation | Band;
  reason: string;
}

// R-11 (RULES_LEDGER): band-caps deterministas de la rúbrica congelada
// (deterministic_overrides de rubric_case_factory_v1.yaml). El trigger es el
// gap/risk que el propio judge detectó; el cap garantiza que la banda de la
// dimensión no quede MEJOR de lo que la rúbrica manda, aunque el LLM haya
// puntuado alto. Nunca sube una banda — solo la limita.
const BAND_RANK: Record<Band, number> = { A: 2, M: 1, B: 0 };

const DIMENSION_BAND_CAPS: Array<{
  trigger: string;
  dimension: string;
  ceiling: Band;
  rule: string;
}> = [
  // crm_fields_include_email_or_phone_in_model_prompt_without_need
  { trigger: "privacy_exposure", dimension: "datos", ceiling: "B", rule: "band_cap_privacy_exposure" },
  // no_monitoring_or_rollback_defined_for_agent
  { trigger: "missing_agent_monitoring", dimension: "juicio", ceiling: "B", rule: "band_cap_missing_monitoring" },
  // final_response_has_no_business_metric_or_owner
  { trigger: "weak_impact_translation", dimension: "impacto", ceiling: "M", rule: "band_cap_weak_impact" },
];

const ACTION_RANK: Record<Recommendation, number> = {
  pilotar: 0,
  entrenar: 1,
  pausar: 2,
  escalar: 3,
};

function cap(
  current: Recommendation,
  ceiling: Recommendation,
): Recommendation {
  return ACTION_RANK[current] > ACTION_RANK[ceiling] ? ceiling : current;
}

/**
 * Piso de severidad: la recomendación no puede quedar MENOS severa que
 * `minimum`. Es la semántica real de las reglas 1-3 ("→ pausar/entrenar como
 * mínimo"): el bug original usaba cap (techo), así que un participante con
 * risk high y recomendación 'pilotar' se quedaba en 'pilotar'. Detectado por
 * el test sintético de R-11 (2026-07-02).
 */
function atLeast(
  current: Recommendation,
  minimum: Recommendation,
): Recommendation {
  return ACTION_RANK[current] < ACTION_RANK[minimum] ? minimum : current;
}

const CRITICAL_DIMENSIONS = new Set(["datos", "juicio", "impacto"]);

export interface ApplyOverridesResult {
  final: JudgeOutput;
  applied: AppliedOverride[];
}

export function applyOverrides(raw: JudgeOutput): ApplyOverridesResult {
  const applied: AppliedOverride[] = [];
  let action: Recommendation = raw.recommendation.action;

  // ── Regla 0 (R-11): band-caps por dimensión ANTES de las reglas de
  // recomendación, para que éstas operen sobre las bandas ya capeadas.
  const triggers = new Set<string>([
    ...raw.gaps.map((g) => g.id),
    ...raw.risk_events.map((e) => e.type),
  ]);
  const dimensions = raw.dimensions.map((d) => {
    const capRule = DIMENSION_BAND_CAPS.find(
      (c) => c.dimension === d.id && triggers.has(c.trigger),
    );
    if (!capRule || BAND_RANK[d.band] <= BAND_RANK[capRule.ceiling]) return d;
    applied.push({
      rule: capRule.rule,
      before: d.band,
      after: capRule.ceiling,
      reason: `Override determinista de la rúbrica: gap/risk "${capRule.trigger}" fuerza ${d.id} a banda máxima ${capRule.ceiling}.`,
    });
    return { ...d, band: capRule.ceiling };
  });

  // agent_overreach → cap_recommendation(pausar) — el cuarto override del YAML.
  if (triggers.has("agent_overreach")) {
    const after = atLeast(action, "pausar");
    if (after !== action) {
      applied.push({
        rule: "agent_overreach_cap",
        before: action,
        after,
        reason:
          "Override determinista de la rúbrica: agent_overreach capea la recomendación a 'pausar'.",
      });
      action = after;
    }
  }

  const hasHighRisk = raw.risk_events.some((e) => e.severity === "high");
  const hasMediumRisk = raw.risk_events.some((e) => e.severity === "medium");

  const bandsB = dimensions.filter((d) => d.band === "B");
  const criticalBandsB = bandsB.filter((d) => CRITICAL_DIMENSIONS.has(d.id));

  // Regla 1: cualquier risk high → "pausar" como mínimo (piso)
  if (hasHighRisk) {
    const after = atLeast(action, "pausar");
    if (after !== action) {
      applied.push({
        rule: "high_risk_cap",
        before: action,
        after,
        reason:
          "Risk event de severidad high detectado — recomendación cap a 'pausar'.",
      });
      action = after;
    }
  }

  // Regla 2: 2+ bandas B en críticas → "pausar" como mínimo (piso)
  if (criticalBandsB.length >= 2) {
    const after = atLeast(action, "pausar");
    if (after !== action) {
      applied.push({
        rule: "multi_critical_low_cap",
        before: action,
        after,
        reason: `${criticalBandsB.length} dimensiones críticas en banda B (${criticalBandsB.map((d) => d.id).join(", ")}).`,
      });
      action = after;
    }
  }

  // Regla 3: risk medium + cualquier banda B → "entrenar" como mínimo (piso)
  if (hasMediumRisk && bandsB.length > 0) {
    const after = atLeast(action, "entrenar");
    if (after !== action) {
      applied.push({
        rule: "medium_risk_low_band_cap",
        before: action,
        after,
        reason:
          "Risk medium + al menos una banda B → 'entrenar' como mínimo.",
      });
      action = after;
    }
  }

  // Regla 4: el LLM no debe proponer "escalar" — eso es manual desde admin.
  if (action === "escalar") {
    applied.push({
      rule: "llm_no_escalar",
      before: "escalar",
      after: "pausar",
      reason:
        "El judge LLM no puede proponer 'escalar' (acción del admin). Degradado a 'pausar'.",
    });
    action = "pausar";
  }

  const finalRecommendation: JudgeRecommendation = {
    ...raw.recommendation,
    action,
  };

  return {
    final: { ...raw, dimensions, recommendation: finalRecommendation },
    applied,
  };
}

/**
 * Helper para verificar consistencia bandas/risk. Útil para tests + warnings
 * en eval log. No es un override duro.
 */
export function consistencyWarnings(out: JudgeOutput): string[] {
  const warnings: string[] = [];
  const allA = out.dimensions.every((d) => (["A"] as Band[]).includes(d.band));
  const anyRisk = out.risk_events.length > 0;
  if (allA && anyRisk) {
    warnings.push(
      "Todas las bandas A pero hay risk_events — revisar consistencia.",
    );
  }
  const lowConfidence = out.dimensions.filter((d) => d.confidence < 0.5);
  if (lowConfidence.length > 0) {
    warnings.push(
      `Confianza baja (<0.5) en: ${lowConfidence.map((d) => d.id).join(", ")}.`,
    );
  }
  return warnings;
}
