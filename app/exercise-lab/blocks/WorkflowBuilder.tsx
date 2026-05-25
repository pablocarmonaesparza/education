"use client";

/**
 * WorkflowBuilder · renderer del bloque canónico `workflow_builder` (lab_ref 06).
 *
 * 2 fases en la misma pantalla, sin hints internos:
 *  Fase 1 · checklist de pasos disponibles. El participante marca cuáles
 *    activar (click en check). Sin números aún.
 *  Fase 2 (aparece tras marcar ≥1) · los pasos activos se vuelven una
 *    lista ordenable con números 1, 2, 3… y drag handle.
 *
 * Sin estado "OFF/ACTIVO" repetido en cada fila. Sin numerar los pasos
 * no seleccionados.
 *
 * Evidencia para el judge: enabled_steps + step_order revelan qué eligió
 * y en qué orden · señal de comprensión de handoffs y checkpoints.
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
  { id: "summarize", label: "Resumir tickets agregados" },
  { id: "generate", label: "Generar tres ángulos" },
  { id: "flag", label: "Marcar afirmaciones sin fuente" },
  { id: "human", label: "Revisión humana" },
  { id: "deliver", label: "Entrega a Ventas" },
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
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());
  const firstActionAt = useRef<number | null>(null);
  const totalChanges = useRef(0);

  const stepById = useMemo(
    () => Object.fromEntries(stepsProp.map((s) => [s.id, s])),
    [stepsProp],
  );

  // Inicializa step_order con orden default si vacío.
  useEffect(() => {
    if (payload.step_order.length === 0 && stepsProp.length > 0) {
      onChange({
        ...payload,
        step_order: stepsProp.map((s) => s.id),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lista de pasos activos en orden actual · solo los ids que están en
  // step_order Y enabled_steps.
  const activeOrdered = useMemo(() => {
    return payload.step_order
      .filter((id) => payload.enabled_steps.includes(id))
      .map((id) => stepById[id])
      .filter((s): s is StepSpec => s !== undefined);
  }, [payload.step_order, payload.enabled_steps, stepById]);

  // Pasos disponibles (todos) en orden default (no se reordena hasta ser
  // activado).
  const allSteps = stepsProp;

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

  function toggle(stepId: string) {
    const enabled = payload.enabled_steps.includes(stepId);
    persist({
      ...payload,
      enabled_steps: enabled
        ? payload.enabled_steps.filter((id) => id !== stepId)
        : [...payload.enabled_steps, stepId],
    });
  }

  function reorder(nextSteps: StepSpec[]) {
    // Reordena solo dentro de los activos, manteniendo los inactivos al final.
    const nextActiveIds = nextSteps.map((s) => s.id);
    const inactiveIds = payload.step_order.filter(
      (id) => !payload.enabled_steps.includes(id),
    );
    persist({
      ...payload,
      step_order: [...nextActiveIds, ...inactiveIds],
    });
  }

  return (
    <div className="space-y-6">
      {/* Fase 1 · checklist de pasos disponibles · sin números */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
        {allSteps.map((step, idx) => {
          const checked = payload.enabled_steps.includes(step.id);
          const isLast = idx === allSteps.length - 1;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => toggle(step.id)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--surface-2)] ${
                !isLast ? "border-b border-[var(--hairline)]" : ""
              }`}
            >
              <span
                className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded-[var(--radius-sm)] border transition-colors ${
                  checked
                    ? "border-[var(--accent)] bg-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--surface)]"
                }`}
                aria-hidden
              >
                {checked && (
                  <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6L5 8.5L9.5 3.5"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                )}
              </span>
              <span
                className={`ts-body ${
                  checked
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fase 2 · solo aparece tras marcar ≥1 paso · lista ordenable
          con números 1, 2, 3… y drag handle */}
      {activeOrdered.length > 0 && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
            Orden de ejecución · arrastra para reordenar
          </div>
          <SortableList
            items={activeOrdered}
            getItemKey={(s) => s.id}
            onReorder={reorder}
            renderItem={(step, index, dragHandle) => (
              <div className="grid grid-cols-[24px_32px_1fr] items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-3">
                {dragHandle}
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--accent)] text-white ts-callout font-semibold tabular-nums">
                  {index + 1}
                </span>
                <span className="ts-body text-[var(--text-primary)]">
                  {step.label}
                </span>
              </div>
            )}
          />
        </div>
      )}
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
