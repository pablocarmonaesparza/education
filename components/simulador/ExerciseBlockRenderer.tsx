"use client";

/**
 * ExerciseBlockRenderer — bridge productivo entre `CaseStepContract.exercise_block_id`
 * y los renderers canónicos del registry.
 *
 * Mismo patrón que `RegistryRenderer` interno de `CaseLabRuntime.tsx` pero
 * con `mode="authenticated"` y `sessionId` real para activar autosave
 * vía `useStepPatch` → `/api/sessions/[id]/responses` con validación Zod
 * (Frente A) → judge consume `EvidenceForJudge` tipado.
 *
 * Switch limitado a los bloques extraídos. Cuando se extraigan más a
 * `app/exercise-lab/blocks/`, agregar el case correspondiente aquí.
 *
 * Frente B del plan.
 */

import { useState } from "react";
import { DataTableTriage } from "@/app/exercise-lab/blocks/DataTableTriage";
import {
  emptyPayload,
  type ExerciseResponsePayload,
  type ExerciseSessionMode,
} from "@/lib/simulador/exercise-registry";
import type { ExerciseBlockId } from "@/lib/simulador/exercise-blocks.generated";

interface ExerciseBlockRendererProps {
  blockId: ExerciseBlockId;
  sessionId: string | null;
  mode?: ExerciseSessionMode;
  /** ID del slide/step dentro del caso (usado como step_key del autosave). */
  slideId: string;
  /** Contenido específico del caso para personalizar el bloque
   *  (ej. filas a triagear para data_table_triage). */
  caseContext?: Record<string, unknown>;
}

export function ExerciseBlockRenderer({
  blockId,
  sessionId,
  mode = "authenticated",
  slideId,
  caseContext,
}: ExerciseBlockRendererProps) {
  switch (blockId) {
    case "data_table_triage":
      return (
        <DataTableTriageWrapper
          sessionId={sessionId}
          mode={mode}
          slideId={slideId}
          caseContext={caseContext}
        />
      );

    // Bloques aún no extraídos. Fallback explícito durante migración.
    case "ai_textfield_free":
    case "ai_textfield_guided":
    case "permission_matrix":
    case "ai_output_review":
    case "ai_comparison":
    case "workflow_builder":
    case "agent_brief_builder":
    case "run_log_review":
    case "dashboard_pivot":
    case "tradeoff_decision_memo":
      return (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--hairline)] bg-[var(--surface-2)] p-6">
          <p className="ts-callout text-[var(--text-secondary)]">
            Bloque <code className="font-mono ts-footnote">{blockId}</code> aún
            no extraído al registry. Pendiente de Frente B del plan.
          </p>
        </div>
      );
  }
}

function DataTableTriageWrapper({
  sessionId,
  mode,
  slideId,
  caseContext,
}: Omit<ExerciseBlockRendererProps, "blockId">) {
  const [payload, setPayload] = useState(
    () =>
      emptyPayload("data_table_triage") as Extract<
        ExerciseResponsePayload,
        { block_id: "data_table_triage" }
      >,
  );

  // Si el caso aporta filas específicas, las usa; si no, default del lab.
  const fields = Array.isArray(caseContext?.fields)
    ? (caseContext.fields as Array<{
        id: string;
        field: string;
        example: string;
        hint?: string;
      }>)
    : undefined;

  return (
    <DataTableTriage
      payload={payload}
      onChange={setPayload}
      sessionId={sessionId}
      mode={mode}
      slideId={slideId}
      fields={fields}
    />
  );
}
