"use client";

/**
 * WorkflowBuilder — renderer del bloque canónico `workflow_builder` (lab_ref 06).
 *
 * Patrón: lista ordenada de pasos con toggle on/off. Cada paso es un botón
 * `grid grid-cols-[36px_1fr]` con un badge numerado + label del paso. Cuando
 * está activado, accent border + accent-soft bg.
 *
 * Visual restaurado desde el monolito ExerciseLabClient.tsx (Codex). Sin
 * cambios estéticos respecto al original.
 */

import { useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";
import { Label } from "../_shared/ui-primitives";

type WorkflowBuilderPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "workflow_builder" }
>;

// El monolito usaba labels string como key. Mapeamos al contrato registry
// (step_id estable) preservando el label original.
const DEFAULT_STEPS: ReadonlyArray<{ id: string; label: string }> = [
  { id: "summarize", label: "Resumir tickets agregados" },
  { id: "generate", label: "Generar tres ángulos" },
  { id: "flag", label: "Marcar afirmaciones sin fuente" },
  { id: "human", label: "Revisión humana" },
  { id: "deliver", label: "Entrega a Ventas" },
];

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
  const firstActionAt = useRef<number | null>(null);
  const totalChanges = useRef(0);

  function toggle(stepId: string) {
    if (firstActionAt.current === null) firstActionAt.current = Date.now();
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
        time_to_first_action_ms:
          (firstActionAt.current ?? Date.now()) - mountedAt.current,
        total_changes: totalChanges.current,
        final_payload_bytes: JSON.stringify(next).length,
      });
    }
    onPatch?.(next);
  }

  return (
    <div className="simulador-root">
      <Label>Activa los pasos que debe tener el flujo</Label>
      <div className="mt-4 grid gap-3">
        {steps.map((step, index) => {
          const enabled = payload.enabled_steps.includes(step.id);
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => toggle(step.id)}
              className={`grid min-h-14 grid-cols-[36px_1fr] items-center gap-3 rounded-2xl border px-4 text-left ${
                enabled
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--surface-2)]"
              }`}
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--surface)] text-[13px] font-medium text-[var(--text-primary)]">
                {index + 1}
              </span>
              <span className="text-[15px] text-[var(--text-primary)]">{step.label}</span>
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
