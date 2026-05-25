"use client";

/**
 * AITextfieldGuided · renderer del bloque canónico `ai_textfield_guided`
 * (lab_ref 01B).
 *
 * Vertical stack · las 3 preguntas (Objetivo / Audiencia / Límites)
 * visibles a la vez en cards apiladas. Sin stepper · sin panel lateral
 * de respuestas · sin botón "Crear prompt".
 *
 * El prompt resultante se genera automático cuando las 3 preguntas están
 * respondidas, y aparece abajo en el composer read-only. La elección de
 * modelo se hace en el dropdown del composer (default GPT Corporativo).
 *
 * Sin hint interno · el shell ya tiene eyebrow + title + body.
 */

import { useEffect, useRef, useState } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";
import {
  GuidedOption,
  GuidedSlideOptions,
} from "../_shared/ui-primitives";
import { findModelById, defaultModelId } from "../_shared/models";
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
  const [voiceNotes, setVoiceNotes] = useState<string[]>([]);

  const displayedModelId = payload.selected_model ?? defaultModelId;
  const displayedModel = findModelById(displayedModelId);

  const guardrailText =
    payload.selected_limits.length > 0
      ? payload.selected_limits.join("; ")
      : "Sin restricciones adicionales";

  const allAnswered = Boolean(
    payload.selected_objective &&
      payload.selected_audience &&
      payload.selected_limits.length > 0,
  );

  function persist(next: AITextfieldGuidedPayload) {
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
    persist({ ...payload, [key]: value });
  }

  function toggleGuardrail(value: string) {
    const next = payload.selected_limits.includes(value)
      ? payload.selected_limits.filter((g) => g !== value)
      : [...payload.selected_limits, value];
    updateField("selected_limits", next);
  }

  // Auto-genera el prompt cuando las 3 preguntas están respondidas.
  useEffect(() => {
    if (!allAnswered) return;
    const modelLabel = `${displayedModel.label}${displayedModel.badge ? ` · ${displayedModel.badge}` : ""}`;
    const generated = `Objetivo: ${payload.selected_objective}.\nAudiencia: ${payload.selected_audience}.\nModelo elegido: ${modelLabel}.\n\nTrabaja sólo con información agregada del caso. Límites: ${guardrailText}.\n\nEntrega tres opciones accionables, riesgos visibles y validaciones humanas necesarias.`;
    if (generated !== payload.generated_prompt) {
      persist({
        ...payload,
        generated_prompt: generated,
        selected_model: displayedModelId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAnswered, payload.selected_objective, payload.selected_audience, payload.selected_limits, displayedModelId]);

  return (
    <div className="space-y-6">
      <section>
        <div className="ts-callout font-semibold text-[var(--text-primary)]">
          Objetivo
        </div>
        <div className="mt-3">
          <GuidedSlideOptions
            options={[...objectives]}
            value={payload.selected_objective ?? ""}
            onChange={(value) => updateField("selected_objective", value)}
          />
        </div>
      </section>

      <section>
        <div className="ts-callout font-semibold text-[var(--text-primary)]">
          Audiencia
        </div>
        <div className="mt-3">
          <GuidedSlideOptions
            options={[...audiences]}
            value={payload.selected_audience ?? ""}
            onChange={(value) => updateField("selected_audience", value)}
          />
        </div>
      </section>

      <section>
        <div className="ts-callout font-semibold text-[var(--text-primary)]">
          Límites
        </div>
        <div className="mt-3 grid gap-2">
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
      </section>

      {/* Composer read-only · solo aparece cuando las 3 preguntas están listas */}
      {allAnswered && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <AIPromptComposer
            value={payload.generated_prompt}
            onChange={(value) => updateField("generated_prompt", value)}
            selectedModel={displayedModelId}
            onSelectModel={(value) => updateField("selected_model", value)}
            voiceNotes={voiceNotes}
            onVoiceNote={(note) => setVoiceNotes([...voiceNotes, note])}
            readOnly
          />
        </div>
      )}
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
  if (payload.generated_prompt.trim().length === 0)
    missing.push("generated_prompt");
  return { complete: missing.length === 0, missing };
}

export function emptyAITextfieldGuidedPayload(): AITextfieldGuidedPayload {
  return emptyPayload("ai_textfield_guided") as AITextfieldGuidedPayload;
}
