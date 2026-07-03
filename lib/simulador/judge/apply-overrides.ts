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
  before: Recommendation;
  after: Recommendation;
  reason: string;
}

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

const CRITICAL_DIMENSIONS = new Set(["datos", "juicio", "impacto"]);

export interface ApplyOverridesResult {
  final: JudgeOutput;
  applied: AppliedOverride[];
}

export function applyOverrides(raw: JudgeOutput): ApplyOverridesResult {
  const applied: AppliedOverride[] = [];
  let action: Recommendation = raw.recommendation.action;

  const hasHighRisk = raw.risk_events.some((e) => e.severity === "high");
  const hasMediumRisk = raw.risk_events.some((e) => e.severity === "medium");

  const bandsB = raw.dimensions.filter((d) => d.band === "B");
  const criticalBandsB = bandsB.filter((d) => CRITICAL_DIMENSIONS.has(d.id));

  // Regla 1: cualquier risk high → cap a "pausar"
  if (hasHighRisk) {
    const after = cap(action, "pausar");
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

  // Regla 2: 2+ bandas B en críticas → cap a "pausar"
  if (criticalBandsB.length >= 2) {
    const after = cap(action, "pausar");
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

  // Regla 3: risk medium + cualquier banda B → cap a "entrenar"
  if (hasMediumRisk && bandsB.length > 0) {
    const after = cap(action, "entrenar");
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
    final: { ...raw, recommendation: finalRecommendation },
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
