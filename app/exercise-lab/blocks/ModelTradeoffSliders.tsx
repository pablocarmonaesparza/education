"use client";

/**
 * ModelTradeoffSliders · bloque canónico `model_tradeoff_sliders` (lab_ref 01C).
 *
 * 3 sliders 0-100 en pasos de 10 (autonomía, seguridad, costo) +
 * modelo recomendado dinámico con BrandMark. Standalone — split del
 * ai_textfield_guided en v0.6.0.
 *
 * Mide cómo el participante pondera las 3 dimensiones para elegir
 * modelo. El judge revisa coherencia: si pidió alta autonomía + baja
 * seguridad, ¿eligió un modelo open?
 *
 * No-prefill: los 3 sliders arrancan en `null`. La recomendación
 * aparece sólo cuando los 3 están movidos al menos una vez.
 * Cuando se mueve el slider de costo y la suma autonomy+security
 * excede el cap (120 + cost), `rebalanceModelTradeoffs` ajusta los
 * otros dos.
 */

import { useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";
import { Range10 } from "../_shared/ui-primitives";
import { BrandMark } from "../_shared/glyphs";
import { findModelById } from "../_shared/models";
import {
  chooseGuidedModelId,
  rebalanceModelTradeoffs,
  priorityLabel,
  budgetLabel,
} from "../_shared/model-tradeoffs";
import type { ModelMetric } from "../_shared/types";

type ModelTradeoffSlidersPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "model_tradeoff_sliders" }
>;

interface Props extends ExerciseRendererProps<ModelTradeoffSlidersPayload> {
  sessionId?: string | null;
}

export function ModelTradeoffSliders({
  payload,
  onChange,
  onPatch,
  slideId = "model_tradeoff_sliders",
  mode = "lab_demo",
  sessionId = null,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());
  const firstActionAt = useRef<number | null>(null);
  const totalChanges = useRef(0);

  // Para display: muestra "—" si null, sino el valor numérico.
  const autonomy = payload.autonomy_priority;
  const security = payload.security_priority;
  const cost = payload.cost_priority;

  // Recomendación: sólo cuando los 3 sliders están movidos.
  const allSet = autonomy !== null && security !== null && cost !== null;
  const recommendedId = allSet
    ? chooseGuidedModelId({
        autonomy: autonomy as number,
        security: security as number,
        cost: cost as number,
      })
    : null;
  const recommendedModel = recommendedId ? findModelById(recommendedId) : null;

  function update(metric: ModelMetric, rawValue: number) {
    if (firstActionAt.current === null) firstActionAt.current = Date.now();
    totalChanges.current += 1;

    // Si algún slider está null, lo tratamos como 50 para el rebalance,
    // pero sólo el slider tocado se persiste como número; los demás
    // mantienen su valor previo (incluido null si no se han movido).
    const currentAutonomy = autonomy ?? 50;
    const currentSecurity = security ?? 50;
    const currentCost = cost ?? 50;
    const rebalanced = rebalanceModelTradeoffs(
      { autonomy: currentAutonomy, security: currentSecurity, cost: currentCost },
      metric,
      rawValue,
    );

    // Sólo los sliders previamente movidos + el actual se persisten;
    // los nulls que aún no se han tocado se mantienen null para
    // respetar no-prefill (no contaminar evidencia).
    const nextAutonomy =
      metric === "intelligence"
        ? rebalanced.autonomy
        : autonomy !== null
          ? rebalanced.autonomy
          : null;
    const nextSecurity =
      metric === "security"
        ? rebalanced.security
        : security !== null
          ? rebalanced.security
          : null;
    const nextCost =
      metric === "cost"
        ? rebalanced.cost
        : cost !== null
          ? rebalanced.cost
          : null;

    const nextAllSet =
      nextAutonomy !== null && nextSecurity !== null && nextCost !== null;
    const nextRecommendedId = nextAllSet
      ? chooseGuidedModelId({
          autonomy: nextAutonomy as number,
          security: nextSecurity as number,
          cost: nextCost as number,
        })
      : null;

    const next: ModelTradeoffSlidersPayload = {
      ...payload,
      autonomy_priority: nextAutonomy,
      security_priority: nextSecurity,
      cost_priority: nextCost,
      recommended_model_id: nextRecommendedId,
    };
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:model_tradeoff_sliders:${slideId}`, next, {
        time_to_first_action_ms:
          (firstActionAt.current ?? Date.now()) - mountedAt.current,
        total_changes: totalChanges.current,
        final_payload_bytes: JSON.stringify(next).length,
      });
    }
    onPatch?.(next);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <Range10
          label="Autonomía"
          value={autonomy ?? 50}
          onChange={(v) => update("intelligence", v)}
        />
        <Range10
          label="Seguridad"
          value={security ?? 50}
          onChange={(v) => update("security", v)}
        />
        <Range10
          label="Costo"
          value={cost ?? 50}
          onChange={(v) => update("cost", v)}
        />
      </div>

      {/* Recomendación dinámica */}
      <div
        className={`flex items-center gap-3 rounded-[var(--radius-lg)] border p-4 transition-colors ${
          recommendedModel
            ? "border-[var(--accent)] bg-[var(--accent-soft)]"
            : "border-[var(--border)] bg-[var(--surface-2)]"
        }`}
      >
        {recommendedModel ? (
          <>
            <BrandMark brand={recommendedModel.brand} />
            <div className="min-w-0 flex-1">
              <div className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                Modelo recomendado
              </div>
              <div className="mt-0.5 ts-body font-semibold text-[var(--text-primary)]">
                {recommendedModel.label}
                {recommendedModel.badge && (
                  <span className="ml-1.5 ts-footnote font-normal text-[var(--text-tertiary)]">
                    · {recommendedModel.badge}
                  </span>
                )}
              </div>
              <div className="mt-1 ts-footnote text-[var(--text-secondary)]">
                Autonomía {priorityLabel(autonomy as number)} · seguridad{" "}
                {priorityLabel(security as number)} · costo {budgetLabel(cost as number)}.
              </div>
            </div>
          </>
        ) : (
          <div className="ts-footnote text-[var(--text-tertiary)]">
            La recomendación aparece cuando muevas los 3 sliders.
          </div>
        )}
      </div>

      {/* Justificación · aparece cuando ya hay recomendación · el juez
          construye narrativa con el porqué, no solo con los números. */}
      {recommendedModel && (
        <div className="space-y-2">
          <label
            htmlFor={`${slideId}-rationale`}
            className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]"
          >
            ¿Por qué priorizaste así?
          </label>
          <textarea
            id={`${slideId}-rationale`}
            value={payload.rationale_text}
            onChange={(e) => {
              const next: ModelTradeoffSlidersPayload = {
                ...payload,
                rationale_text: e.target.value,
              };
              onChange(next);
              onPatch?.(next);
            }}
            placeholder="En una o dos líneas, explica qué te llevó a esa ponderación."
            rows={2}
            className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 ts-body text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Completion · los 3 sliders movidos + modelo recomendado presente.
 */
export function modelTradeoffSlidersCompletion(
  payload: ModelTradeoffSlidersPayload,
) {
  const missing: string[] = [];
  if (payload.autonomy_priority === null) missing.push("autonomy_priority");
  if (payload.security_priority === null) missing.push("security_priority");
  if (payload.cost_priority === null) missing.push("cost_priority");
  if (payload.recommended_model_id === null)
    missing.push("recommended_model_id");
  return { complete: missing.length === 0, missing };
}

export function emptyModelTradeoffSlidersPayload(): ModelTradeoffSlidersPayload {
  return emptyPayload("model_tradeoff_sliders") as ModelTradeoffSlidersPayload;
}
