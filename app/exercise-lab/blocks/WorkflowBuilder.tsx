"use client";

/**
 * WorkflowBuilder · renderer del bloque canónico `workflow_builder` (lab_ref 06).
 *
 * Patrón: lista re-ordenable de pasos con drag handle + toggle on/off por
 * paso. El participante decide cuáles pasos del flujo deben estar activos
 * Y en qué orden ejecutarse.
 *
 * Cambio v0.6.0: agregado drag/drop real con primitive `SortableList`
 * de `_shared/`. El orden persiste en `payload.step_order` (lista de ids
 * en el orden actual). `enabled_steps` mantiene solo los ids activos.
 *
 * Evidencia para el judge: enabled_steps + step_order revelan no solo
 * qué pasos eligió sino cómo los secuencia · señal de comprensión
 * de handoffs y checkpoints.
 */

import { useEffect, useMemo, useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";
import { Label } from "../_shared/ui-primitives";
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

  // Map id → spec para lookups O(1).
  const stepById = useMemo(
    () => Object.fromEntries(stepsProp.map((s) => [s.id, s])),
    [stepsProp],
  );

  // Inicializa step_order vacío con el orden default. Si el caso lo override
  // vía caseContext.step_order, lo respeta. Si el payload ya tiene order
  // (regresar a la pregunta), lo mantiene.
  useEffect(() => {
    if (payload.step_order.length === 0 && stepsProp.length > 0) {
      onChange({
        ...payload,
        step_order: stepsProp.map((s) => s.id),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lista ordenada actual = step_order mapeado a specs. Filtra ids que ya
  // no existen en stepsProp (defensivo contra cambios de catálogo).
  const orderedSteps = useMemo(() => {
    const fromOrder = payload.step_order
      .map((id) => stepById[id])
      .filter((s): s is StepSpec => s !== undefined);
    // Si hay steps en stepsProp que no están en step_order, agrégalos al final.
    const knownIds = new Set(fromOrder.map((s) => s.id));
    const extras = stepsProp.filter((s) => !knownIds.has(s.id));
    return [...fromOrder, ...extras];
  }, [payload.step_order, stepsProp, stepById]);

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
    persist({ ...payload, step_order: nextSteps.map((s) => s.id) });
  }

  return (
    <div className="simulador-root">
      <Label>Activa los pasos y arrástralos al orden correcto</Label>
      <p className="mt-1 ts-footnote text-[var(--text-tertiary)]">
        Usa el handle <span className="font-mono">≡</span> para reordenar. Click en el paso para activarlo o desactivarlo.
      </p>
      <div className="mt-4">
        <SortableList
          items={orderedSteps}
          getItemKey={(s) => s.id}
          onReorder={reorder}
          renderItem={(step, index, dragHandle) => {
            const enabled = payload.enabled_steps.includes(step.id);
            return (
              <div
                className={`grid grid-cols-[24px_36px_1fr_56px] items-center gap-3 rounded-[var(--radius-lg)] border bg-[var(--surface)] px-3 py-3 transition-colors ${
                  enabled
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)]"
                }`}
              >
                {dragHandle}
                <span
                  className={`grid h-8 w-8 place-items-center rounded-[var(--radius-md)] ts-callout font-semibold tabular-nums ${
                    enabled
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--surface-2)] text-[var(--text-secondary)]"
                  }`}
                >
                  {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => toggle(step.id)}
                  className="text-left ts-body text-[var(--text-primary)]"
                >
                  {step.label}
                </button>
                <span
                  className={`justify-self-end ts-caption-1 font-medium uppercase tracking-wider ${
                    enabled
                      ? "text-[var(--accent)]"
                      : "text-[var(--text-tertiary)]"
                  }`}
                >
                  {enabled ? "Activo" : "Off"}
                </span>
              </div>
            );
          }}
        />
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
