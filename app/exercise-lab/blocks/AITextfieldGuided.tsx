"use client";

/**
 * AITextfieldGuided · renderer del bloque canónico `ai_textfield_guided`
 * (lab_ref 01B).
 *
 * Patrón rico (monolito Codex): el más complejo de los 11.
 *
 *   ┌──────────────────────────────────┬──────────────────────────┐
 *   │ Inputs y selección (stepper)     │ Respuestas               │
 *   │  ▸ Objetivo  ▸ Audiencia         │  ProcessAnswer 1: Objetivo│
 *   │  ▸ Límites (multi) ▸ Modelo      │  ProcessAnswer 2: Audiencia│
 *   │  con 3 sliders + recommended     │  ProcessAnswer 3: Límites │
 *   │  Atrás / Siguiente / Crear prompt│  ProcessAnswer 4: Modelo  │
 *   └──────────────────────────────────┴──────────────────────────┘
 *
 *   AIPromptComposer (read-only) ← prompt generado al hacer Crear prompt
 *
 * Selección del modelo: `chooseGuidedModelId` decide automático basado en
 * (autonomía, seguridad, costo); `rebalanceModelTradeoffs` mantiene la
 * presión <= cap cuando el usuario sube un slider.
 *
 * Contrato del registry: no-prefill exige nulls en los sliders hasta que el
 * usuario los toque. `modelTouched` se deriva de "al menos un slider != null".
 * `selected_model` solo se setea cuando el usuario llega al paso 4 (no-prefill
 * estricto en TypeScript pero presentation-wise mostramos el recomendado).
 *
 * Visual restaurado desde el monolito ExerciseLabClient.tsx (Codex). Sin
 * cambios estéticos respecto al original.
 */

import { useEffect, useRef, useState } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";
import {
  GuidedInputCard,
  GuidedSlideOptions,
  GuidedOption,
  Range10,
  ProcessAnswer,
} from "../_shared/ui-primitives";
import { BrandMark } from "../_shared/glyphs";
import { findModelById } from "../_shared/models";
import {
  chooseGuidedModelId,
  rebalanceModelTradeoffs,
  priorityLabel,
  budgetLabel,
} from "../_shared/model-tradeoffs";
import type { ModelMetric } from "../_shared/types";
import { AIPromptComposer } from "../_shared/AIPromptComposer";

type AITextfieldGuidedPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "ai_textfield_guided" }
>;

const GUIDED_OBJECTIVES = [
  "Reactivar cuentas con bajo uso",
  "Proponer tres ángulos de campaña",
  "Resumir feedback para Ventas",
];

const GUIDED_AUDIENCES = [
  "VP de Marketing",
  "Equipo de Ventas Enterprise",
  "Cliente interno de Operaciones",
];

const GUIDED_GUARDRAILS = [
  "No usar nombres ni correos",
  "Marcar afirmaciones sin fuente",
  "Dejarlo como borrador interno",
  "Explicar supuestos y dudas",
];

const INPUT_STEPS = ["Objetivo", "Audiencia", "Límites", "Modelo"];

interface Props extends ExerciseRendererProps<AITextfieldGuidedPayload> {
  objectives?: ReadonlyArray<string>;
  audiences?: ReadonlyArray<string>;
  guardrails?: ReadonlyArray<string>;
  sessionId?: string | null;
}

export function AITextfieldGuided({
  payload,
  onChange,
  onPatch,
  slideId = "ai_textfield_guided",
  mode = "lab_demo",
  sessionId = null,
  objectives = GUIDED_OBJECTIVES,
  audiences = GUIDED_AUDIENCES,
  guardrails = GUIDED_GUARDRAILS,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());
  const firstActionAt = useRef<number | null>(null);
  const totalChanges = useRef(0);

  const [activeInput, setActiveInput] = useState(0);
  // Voice notes son state local del composer read-only · el contrato del
  // registry no las persiste para guided. Mantenemos array vacío.
  const [voiceNotes, setVoiceNotes] = useState<string[]>([]);

  // modelTouched se deriva de "al menos un slider tiene valor". El stub
  // anterior usaba useState, pero derivarlo del payload garantiza coherencia
  // con no-prefill · y permite que la UI muestre · para el slider hasta que
  // el usuario lo toque.
  const modelTouched =
    payload.autonomy_priority !== null ||
    payload.security_priority !== null ||
    payload.cost_priority !== null;

  // Para la lógica de recomendación, usamos 50 como neutral cuando el slider
  // todavía es null (el monolito original arrancaba en 50).
  const autonomyVal = payload.autonomy_priority ?? 50;
  const securityVal = payload.security_priority ?? 50;
  const costVal = payload.cost_priority ?? 50;

  const recommendedModelId = chooseGuidedModelId({
    autonomy: autonomyVal,
    security: securityVal,
    cost: costVal,
  });
  const recommendedModel = findModelById(recommendedModelId);

  const guardrailText =
    payload.selected_limits.length > 0
      ? payload.selected_limits.join("; ")
      : "Sin restricciones adicionales";

  const canCreatePrompt = Boolean(
    payload.selected_objective &&
      payload.selected_audience &&
      payload.selected_limits.length > 0 &&
      modelTouched,
  );

  // Sincroniza selected_model con la recomendación cuando el usuario haya
  // tocado los sliders. No-prefill: solo setea cuando modelTouched (ej.
  // primer movimiento de slider) · antes queda null.
  useEffect(() => {
    if (!modelTouched) return;
    if (payload.selected_model !== recommendedModelId) {
      updateInternal({ ...payload, selected_model: recommendedModelId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendedModelId, modelTouched]);

  function updateInternal(next: AITextfieldGuidedPayload) {
    if (firstActionAt.current === null) firstActionAt.current = Date.now();
    totalChanges.current += 1;
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:ai_textfield_guided:${slideId}`, next, {
        time_to_first_action_ms:
          (firstActionAt.current ?? Date.now()) - mountedAt.current,
        total_changes: totalChanges.current,
        final_payload_bytes: JSON.stringify(next).length,
      });
    }
    onPatch?.(next);
  }

  function updateField<K extends keyof AITextfieldGuidedPayload>(
    key: K,
    value: AITextfieldGuidedPayload[K],
  ) {
    updateInternal({ ...payload, [key]: value });
  }

  function toggleGuardrail(value: string) {
    const next = payload.selected_limits.includes(value)
      ? payload.selected_limits.filter((g) => g !== value)
      : [...payload.selected_limits, value];
    updateField("selected_limits", next);
  }

  function updateModelMetric(metric: ModelMetric, value: number) {
    const next = rebalanceModelTradeoffs(
      { autonomy: autonomyVal, security: securityVal, cost: costVal },
      metric,
      value,
    );
    updateInternal({
      ...payload,
      autonomy_priority: next.autonomy,
      security_priority: next.security,
      cost_priority: next.cost,
    });
  }

  function createPrompt() {
    const selected = findModelById(recommendedModelId);
    const generated = `Objetivo: ${payload.selected_objective}.\nAudiencia: ${payload.selected_audience}.\nModelo sugerido: ${selected.label}${selected.badge ? ` · ${selected.badge}` : ""}.\n\nTrabaja sólo con información agregada del caso. Límites: ${guardrailText}.\n\nPrioridades: inteligencia ${priorityLabel(autonomyVal)}, seguridad ${priorityLabel(securityVal)} y costo permitido ${budgetLabel(costVal)}.\n\nEntrega tres opciones accionables, riesgos visibles y validaciones humanas necesarias.`;
    updateInternal({
      ...payload,
      generated_prompt: generated,
      selected_model: recommendedModelId,
    });
  }

  return (
    <div className="simulador-root">
      <div className="grid gap-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-stretch">
          <div className="flex h-full flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
                  Inputs y selección
                </div>
                <div className="mt-1 text-[18px] font-semibold text-[var(--text-primary)]">
                  {INPUT_STEPS[activeInput]}
                </div>
              </div>
              <div className="flex gap-1.5" aria-label="Progreso de inputs">
                {INPUT_STEPS.map((step, index) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setActiveInput(index)}
                    aria-label={`Ir a ${step}`}
                    className={`h-2 rounded-full transition-all ${
                      index === activeInput
                        ? "w-8 bg-[var(--accent)]"
                        : "w-2 bg-[var(--surface-3)]"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5">
              {activeInput === 0 && (
                <GuidedInputCard>
                  <GuidedSlideOptions
                    options={[...objectives]}
                    value={payload.selected_objective ?? ""}
                    onChange={(value) => updateField("selected_objective", value)}
                  />
                </GuidedInputCard>
              )}
              {activeInput === 1 && (
                <GuidedInputCard>
                  <GuidedSlideOptions
                    options={[...audiences]}
                    value={payload.selected_audience ?? ""}
                    onChange={(value) => updateField("selected_audience", value)}
                  />
                </GuidedInputCard>
              )}
              {activeInput === 2 && (
                <GuidedInputCard>
                  <div className="grid gap-2">
                    {guardrails.map((guardrail) => (
                      <GuidedOption
                        key={guardrail}
                        selected={payload.selected_limits.includes(guardrail)}
                        onClick={() => toggleGuardrail(guardrail)}
                      >
                        {guardrail}
                      </GuidedOption>
                    ))}
                  </div>
                </GuidedInputCard>
              )}
              {activeInput === 3 && (
                <GuidedInputCard>
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[12px] text-[var(--text-tertiary)]">
                          Modelo recomendado
                        </div>
                        <div className="mt-1 flex min-w-0 items-center gap-2 text-[14px] font-semibold text-[var(--text-primary)]">
                          <BrandMark brand={recommendedModel.brand} />
                          <span className="truncate">
                            {recommendedModel.label}
                            {recommendedModel.badge && (
                              <span className="font-medium text-[var(--text-tertiary)]">
                                {" · "}
                                {recommendedModel.badge}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-xl bg-[var(--surface-2)] px-2.5 py-1.5 text-[11px] text-[var(--text-secondary)]">
                        Automático
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2">
                    <Range10
                      label="Inteligencia"
                      value={autonomyVal}
                      onChange={(value) => updateModelMetric("intelligence", value)}
                    />
                    <Range10
                      label="Seguridad"
                      value={securityVal}
                      onChange={(value) => updateModelMetric("security", value)}
                    />
                    <Range10
                      label="Costo"
                      value={costVal}
                      onChange={(value) => updateModelMetric("cost", value)}
                    />
                  </div>
                </GuidedInputCard>
              )}
            </div>

            <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
              <button
                type="button"
                onClick={() => setActiveInput(Math.max(0, activeInput - 1))}
                disabled={activeInput === 0}
                className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-[14px] font-medium text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activeInput === INPUT_STEPS.length - 1) {
                    createPrompt();
                    return;
                  }
                  setActiveInput(Math.min(INPUT_STEPS.length - 1, activeInput + 1));
                }}
                disabled={
                  activeInput === INPUT_STEPS.length - 1 && !canCreatePrompt
                }
                className="min-h-11 rounded-xl bg-[var(--accent)] px-4 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[var(--surface-3)] disabled:text-[var(--text-disabled)]"
              >
                {activeInput === INPUT_STEPS.length - 1 ? "Crear prompt" : "Siguiente"}
              </button>
            </div>
          </div>

          <div className="h-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
            <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
              Respuestas
            </div>
            <div className="mt-4 grid gap-3">
              <ProcessAnswer
                index={1}
                label="Objetivo"
                value={payload.selected_objective ?? ""}
                muted={!payload.selected_objective}
              />
              <ProcessAnswer
                index={2}
                label="Audiencia"
                value={payload.selected_audience ?? ""}
                muted={!payload.selected_audience}
              />
              <ProcessAnswer
                index={3}
                label="Límites"
                value={
                  payload.selected_limits.length > 0 ? guardrailText : ""
                }
                muted={payload.selected_limits.length === 0}
              />
              <ProcessAnswer
                index={4}
                label="Modelo"
                value={
                  modelTouched
                    ? `${recommendedModel.label}${recommendedModel.badge ? ` · ${recommendedModel.badge}` : ""} · Inteligencia ${autonomyVal} · Seguridad ${securityVal} · Costo ${costVal}`
                    : ""
                }
                muted={!modelTouched}
              />
            </div>
          </div>
        </div>

        <div>
          <AIPromptComposer
            value={payload.generated_prompt}
            onChange={(value) => updateField("generated_prompt", value)}
            selectedModel={payload.selected_model ?? recommendedModelId}
            onSelectModel={(value) => updateField("selected_model", value)}
            voiceNotes={voiceNotes}
            onVoiceNote={(note) => setVoiceNotes([...voiceNotes, note])}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}

export function aiTextfieldGuidedCompletion(
  payload: AITextfieldGuidedPayload,
) {
  const missing: string[] = [];
  if (!payload.selected_objective) missing.push("selected_objective");
  if (!payload.selected_audience) missing.push("selected_audience");
  if (payload.selected_limits.length === 0) missing.push("selected_limits");
  if (!payload.selected_model) missing.push("selected_model");
  if (payload.autonomy_priority === null) missing.push("autonomy_priority");
  if (payload.security_priority === null) missing.push("security_priority");
  if (payload.cost_priority === null) missing.push("cost_priority");
  if (payload.generated_prompt.trim().length === 0) missing.push("generated_prompt");
  return { complete: missing.length === 0, missing };
}

export function emptyAITextfieldGuidedPayload(): AITextfieldGuidedPayload {
  return emptyPayload("ai_textfield_guided") as AITextfieldGuidedPayload;
}
