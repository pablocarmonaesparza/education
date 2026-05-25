"use client";

/**
 * AITextfieldGuided · renderer del bloque canónico `ai_textfield_guided`
 * (lab_ref 01B).
 *
 * Stepper interno con 3 chips de subsecciones:
 *   [Objetivo (activo)] [Audiencia (gris)] [Límites (gris)]
 *
 * Una subsección visible a la vez con transición slide (framer-motion):
 *  - Objetivo · single-select · auto-advance al elegir
 *  - Audiencia · single-select · auto-advance al elegir
 *  - Límites · multi-select · NO auto-advance · composer read-only aparece
 *    abajo cuando hay ≥1 límite seleccionado
 *
 * Estado de cada chip:
 *  - Activo  · bg-accent + text-white (subsección actual)
 *  - Hecho   · border-accent + text-accent + check (ya respondido,
 *              clickeable para volver atrás)
 *  - Pendiente · bg-surface-2 + text-tertiary (no clickeable hasta haber
 *                completado la anterior)
 *
 * Sin hint interno · el shell ya tiene eyebrow + title + body.
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

type Subsection = "objective" | "audience" | "limits" | "review";

const SUBSECTIONS: Array<{ key: Subsection; label: string }> = [
  { key: "objective", label: "Objetivo" },
  { key: "audience", label: "Audiencia" },
  { key: "limits", label: "Límites" },
  { key: "review", label: "Revisar" },
];

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

// Helper · indica si una subsección es "Done" (puede mostrarse con check).
// Para la 4ta sub Revisar, "Done" se considera al haber clickeado Continuar
// (= disparado onShellContinue), pero no la marcamos persistente aquí
// porque eso pertenece al estado del shell, no del bloque.

export function AITextfieldGuided({
  payload,
  onChange,
  onPatch,
  slideId = "ai_textfield_guided",
  mode = "lab_demo",
  sessionId = null,
  onShellContinue,
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

  // Subsección activa · inicia en objective y avanza con la selección.
  const [activeSubsection, setActiveSubsection] =
    useState<Subsection>("objective");

  const displayedModelId = payload.selected_model ?? defaultModelId;
  const displayedModel = findModelById(displayedModelId);

  const guardrailText =
    payload.selected_limits.length > 0
      ? payload.selected_limits.join("; ")
      : "Sin restricciones adicionales";

  const objectiveDone = Boolean(payload.selected_objective);
  const audienceDone = Boolean(payload.selected_audience);
  const limitsDone = payload.selected_limits.length > 0;
  const allAnswered = objectiveDone && audienceDone && limitsDone;

  function isReachable(sub: Subsection): boolean {
    if (sub === "objective") return true;
    if (sub === "audience") return objectiveDone;
    if (sub === "limits") return objectiveDone && audienceDone;
    if (sub === "review") return allAnswered;
    return false;
  }

  function isDone(sub: Subsection): boolean {
    if (sub === "objective") return objectiveDone;
    if (sub === "audience") return audienceDone;
    if (sub === "limits") return limitsDone;
    // Review nunca se marca como "done" desde el bloque · la navegación
    // al siguiente slide la maneja el shell vía onShellContinue.
    return false;
  }

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

  function selectObjective(value: string) {
    persist({ ...payload, selected_objective: value });
    // Auto-advance a Audiencia
    setActiveSubsection("audience");
  }

  function selectAudience(value: string) {
    persist({ ...payload, selected_audience: value });
    // Auto-advance a Límites
    setActiveSubsection("limits");
  }

  function toggleGuardrail(value: string) {
    const next = payload.selected_limits.includes(value)
      ? payload.selected_limits.filter((g) => g !== value)
      : [...payload.selected_limits, value];
    persist({ ...payload, selected_limits: next });
    // NO auto-advance · multi-select · el composer aparece debajo
  }

  // Auto-genera el prompt cuando las 3 subsecciones están listas.
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
      {/* Stepper · 3 chips de subsecciones */}
      <div className="flex items-center gap-2">
        {SUBSECTIONS.map((sub) => {
          const isActive = activeSubsection === sub.key;
          const done = isDone(sub.key);
          const reachable = isReachable(sub.key);
          return (
            <button
              key={sub.key}
              type="button"
              disabled={!reachable}
              onClick={() => {
                if (reachable) setActiveSubsection(sub.key);
              }}
              className={`flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-1.5 ts-caption-1 font-medium transition-colors ${
                isActive
                  ? "bg-[var(--accent)] text-white"
                  : done
                    ? "border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent-soft)]/80"
                    : reachable
                      ? "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]"
                      : "bg-[var(--surface-2)] text-[var(--text-tertiary)] cursor-not-allowed"
              }`}
            >
              {done && !isActive && (
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path
                    d="M2.5 6L5 8.5L9.5 3.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
              )}
              {sub.label}
            </button>
          );
        })}
      </div>

      {/* Subsección activa · slide horizontal con AnimatePresence */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeSubsection}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeSubsection === "objective" && (
              <GuidedSlideOptions
                options={[...objectives]}
                value={payload.selected_objective ?? ""}
                onChange={selectObjective}
              />
            )}
            {activeSubsection === "audience" && (
              <GuidedSlideOptions
                options={[...audiences]}
                value={payload.selected_audience ?? ""}
                onChange={selectAudience}
              />
            )}
            {activeSubsection === "limits" && (
              <div className="space-y-4">
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
                {/* CTA para pasar a Revisar · solo cuando ≥1 límite marcado */}
                {limitsDone && (
                  <button
                    type="button"
                    onClick={() => setActiveSubsection("review")}
                    className="rounded-[var(--radius-md)] border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 ts-callout font-medium text-[var(--accent)] transition-opacity hover:opacity-90"
                  >
                    Revisar →
                  </button>
                )}
              </div>
            )}
            {activeSubsection === "review" && allAnswered && (
              <div className="space-y-5">
                <AIPromptComposer
                  value={payload.generated_prompt}
                  onChange={(value) =>
                    persist({ ...payload, generated_prompt: value })
                  }
                  selectedModel={displayedModelId}
                  onSelectModel={(value) =>
                    persist({ ...payload, selected_model: value })
                  }
                  voiceNotes={voiceNotes}
                  onVoiceNote={(note) => setVoiceNotes([...voiceNotes, note])}
                  readOnly
                />
                {/* Botón Continuar interno · solo aparece en Revisar. Dispara
                    el callback del shell para navegar al siguiente slide. */}
                {onShellContinue && (
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={onShellContinue}
                      className="rounded-[var(--radius-md)] accent-bg px-7 py-3 ts-callout font-medium text-white shadow-none transition-opacity hover:opacity-90"
                    >
                      Continuar →
                    </button>
                    <span className="ts-footnote text-[var(--text-tertiary)]">
                      o pulsa{" "}
                      <kbd className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-0.5 ts-caption-2 font-medium text-[var(--text-secondary)]">
                        Enter ↵
                      </kbd>
                    </span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
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
  if (payload.generated_prompt.trim().length === 0)
    missing.push("generated_prompt");
  return { complete: missing.length === 0, missing };
}

export function emptyAITextfieldGuidedPayload(): AITextfieldGuidedPayload {
  return emptyPayload("ai_textfield_guided") as AITextfieldGuidedPayload;
}
