"use client";

/**
 * WorkflowBuilder — renderer del bloque canónico `workflow_builder` (lab_ref 06).
 * Patrón: lista ordenada de pasos con toggle on/off.
 */

import { useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";

type WorkflowBuilderPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "workflow_builder" }
>;

const DEFAULT_STEPS = [
  { id: "summarize", label: "Resumir tickets agregados" },
  { id: "generate", label: "Generar tres ángulos" },
  { id: "flag", label: "Marcar afirmaciones sin fuente" },
  { id: "human", label: "Revisión humana" },
  { id: "deliver", label: "Entrega a Ventas" },
] as const;

interface Props extends ExerciseRendererProps<WorkflowBuilderPayload> {
  steps?: ReadonlyArray<{ id: string; label: string }>;
  sessionId?: string | null;
}

export function WorkflowBuilder({
  payload,
  onChange,
  onPatch,
  slideId = "workflow_builder",
  mode = "lab_demo",
  sessionId = null,
  steps = DEFAULT_STEPS,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());
  const totalChanges = useRef(0);

  function toggle(stepId: string) {
    totalChanges.current += 1;
    const enabled = payload.enabled_steps.includes(stepId);
    const next: WorkflowBuilderPayload = {
      ...payload,
      enabled_steps: enabled
        ? payload.enabled_steps.filter((id) => id !== stepId)
        : [...payload.enabled_steps, stepId],
    };
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:workflow_builder:${slideId}`, next, {
        time_to_first_action_ms: Date.now() - mountedAt.current,
        total_changes: totalChanges.current,
      });
    }
    onPatch?.(next);
  }

  return (
    <div className="simulador-root">
      <div className="ts-callout font-semibold text-[var(--text-primary)]">
        Activa los pasos que debe tener el flujo
      </div>
      <p className="mt-1 ts-footnote text-[var(--text-tertiary)]">
        Cada paso es opcional. Tu decisión define qué automatiza la IA y qué pasa por humano.
      </p>

      <div className="mt-4 grid gap-2">
        {steps.map((step, idx) => {
          const enabled = payload.enabled_steps.includes(step.id);
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => toggle(step.id)}
              className={`grid min-h-14 grid-cols-[36px_1fr_auto] items-center gap-3 rounded-[var(--radius-lg)] border px-4 text-left transition-colors ${
                enabled
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
              }`}
            >
              <span className="ts-caption-1 font-semibold tabular-nums text-[var(--text-tertiary)]">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="ts-body font-medium text-[var(--text-primary)]">{step.label}</span>
              <span
                className={`ts-caption-1 font-medium ${
                  enabled ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"
                }`}
              >
                {enabled ? "Activado" : "Inactivo"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function workflowBuilderCompletion(payload: WorkflowBuilderPayload) {
  return {
    complete: payload.enabled_steps.length > 0,
    missing: payload.enabled_steps.length === 0 ? ["enabled_steps"] : [],
  };
}

export function emptyWorkflowBuilderPayload(): WorkflowBuilderPayload {
  return emptyPayload("workflow_builder") as WorkflowBuilderPayload;
}
