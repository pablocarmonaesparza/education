"use client";

/**
 * WorkflowBuilder · renderer del bloque canónico `workflow_builder` (lab_ref 09).
 *
 * Simplificado per feedback Pablo: una sola lista ordenable de pasos,
 * sin checkmarks, sin números, sin 2 fases.
 *
 *   ≡  Resumir tickets agregados
 *   ≡  Generar tres ángulos
 *   ≡  Marcar afirmaciones sin fuente
 *   ≡  Revisión humana
 *   ≡  Entrega a Ventas
 *
 * Todos los pasos están activos implícitamente. El participante solo
 * los reordena con drag handle. La evidencia es el orden final
 * (`step_order`); `enabled_steps` mantiene siempre todos los ids para
 * cumplir con el contrato del registry (sin breaking change).
 *
 * Sin hint interno · el shell tiene eyebrow + title + body.
 */

import { useEffect, useMemo, useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";
import { SortableList } from "../_shared/SortableList";

type WorkflowBuilderPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "workflow_builder" }
>;

interface StepSpec {
  id: string;
  label: string;
}

const DEFAULT_STEPS: ReadonlyArray<StepSpec> = [
  { id: "summarize", label: "Summarize aggregated tickets" },
  { id: "generate", label: "Generate three angles" },
  { id: "flag", label: "Flag claims without a source" },
  { id: "human", label: "Human review" },
  { id: "deliver", label: "Hand off to Sales" },
];

interface Props extends ExerciseRendererProps<WorkflowBuilderPayload> {
  steps?: ReadonlyArray<StepSpec>;
  sessionId?: string | null;
}

export function WorkflowBuilder({
  payload,
  onChange,
  onPatch,
  slideId = "workflow_builder",
  mode = "lab_demo",
  sessionId = null,
  steps: stepsProp = DEFAULT_STEPS,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null);
  const mountedAt = useRef(Date.now());
  const firstActionAt = useRef<number | null>(null);
  const totalChanges = useRef(0);

  const stepById = useMemo(
    () => Object.fromEntries(stepsProp.map((s) => [s.id, s])),
    [stepsProp],
  );

  // Inicializa step_order + enabled_steps con todos los pasos.
  // Modelo simplificado: todos los pasos siempre activos · solo reordena.
  useEffect(() => {
    if (payload.step_order.length === 0 && stepsProp.length > 0) {
      onChange({
        ...payload,
        step_order: stepsProp.map((s) => s.id),
        enabled_steps: stepsProp.map((s) => s.id),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orderedSteps = useMemo(() => {
    return payload.step_order
      .map((id) => stepById[id])
      .filter((s): s is StepSpec => s !== undefined);
  }, [payload.step_order, stepById]);

  function persist(next: WorkflowBuilderPayload) {
    if (firstActionAt.current === null) firstActionAt.current = Date.now();
    totalChanges.current += 1;
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

  function reorder(nextSteps: StepSpec[]) {
    persist({
      ...payload,
      step_order: nextSteps.map((s) => s.id),
    });
  }

  return (
    <div className="space-y-5">
      <SortableList
        items={orderedSteps}
        getItemKey={(s) => s.id}
        onReorder={reorder}
        renderItem={(step, _index, dragHandle) => (
          <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            {dragHandle}
            <span className="ts-body text-[var(--text-primary)]">
              {step.label}
            </span>
          </div>
        )}
      />

      {/* Justificación · el judge necesita el porqué del orden, no solo
          el orden mismo · cumple "evidencia narrativa" del cierre. */}
      <div>
        <textarea
          id={`${slideId}-rationale`}
          aria-label="Why this order?"
          value={payload.rationale_text}
          onChange={(e) => {
            persist({ ...payload, rationale_text: e.target.value });
          }}
          placeholder="In one line, explain what decided the order and where human review comes in."
          rows={2}
          className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 ts-body text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]"
        />
      </div>
    </div>
  );
}

export function workflowBuilderCompletion(payload: WorkflowBuilderPayload) {
  // Bloque completo siempre que el orden esté inicializado.
  // El judge evalúa la calidad del orden, no si están todos activos.
  return {
    complete: payload.step_order.length > 0,
    missing: payload.step_order.length === 0 ? ["step_order"] : [],
  };
}

export function emptyWorkflowBuilderPayload(): WorkflowBuilderPayload {
  return emptyPayload("workflow_builder") as WorkflowBuilderPayload;
}
