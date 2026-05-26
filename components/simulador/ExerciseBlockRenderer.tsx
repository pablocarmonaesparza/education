"use client";

/**
 * ExerciseBlockRenderer — bridge productivo entre `CaseStepContract.exercise_block_id`
 * y los renderers canónicos del registry.
 *
 * Refactor v2: state lifteado al renderer (un solo useState para todos los
 * bloques). Acepta `initialPayload` para hidratar el state al montar (caso
 * navega adelante/atrás y necesita preservar respuestas previas) y
 * `onPayloadChange` para que el shell del caso guarde el state externo.
 *
 * Wire activado para los 17 bloques canónicos. Cada bloque vive en
 * app/exercise-lab/blocks/* con su payload tipado + autosave via useStepPatch.
 */

import { useCallback, useState } from "react";
import { CaseCover } from "@/app/exercise-lab/blocks/CaseCover";
import { ReadingPassive } from "@/app/exercise-lab/blocks/ReadingPassive";
import { ReadingMessage } from "@/app/exercise-lab/blocks/ReadingMessage";
import { ReadingDataTable } from "@/app/exercise-lab/blocks/ReadingDataTable";
import { ReadingImage } from "@/app/exercise-lab/blocks/ReadingImage";
import { ReadingKpiCards } from "@/app/exercise-lab/blocks/ReadingKpiCards";
import { ReadingTimeline } from "@/app/exercise-lab/blocks/ReadingTimeline";
import { ReadingAttachment } from "@/app/exercise-lab/blocks/ReadingAttachment";
import { CategorizeRows } from "@/app/exercise-lab/blocks/CategorizeRows";
import { AIComparison } from "@/app/exercise-lab/blocks/AIComparison";
import { WorkflowBuilder } from "@/app/exercise-lab/blocks/WorkflowBuilder";
import { AIOutputReview } from "@/app/exercise-lab/blocks/AIOutputReview";
import { DashboardPivot } from "@/app/exercise-lab/blocks/DashboardPivot";
import { TradeoffDecisionMemo } from "@/app/exercise-lab/blocks/TradeoffDecisionMemo";
import { AITextfieldFree } from "@/app/exercise-lab/blocks/AITextfieldFree";
import { AITextfieldGuided } from "@/app/exercise-lab/blocks/AITextfieldGuided";
import { ModelTradeoffSliders } from "@/app/exercise-lab/blocks/ModelTradeoffSliders";
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
  slideId: string;
  caseContext?: Record<string, unknown>;
  /** Callback opcional para que el bloque dispare la navegación al
   *  siguiente slide cuando maneja su propio botón Continuar. */
  onShellContinue?: () => void;
  /** Payload inicial · cuando se monta, el state se hidrata con esto
   *  en vez de `emptyPayload(blockId)`. Permite que el caso preserve
   *  respuestas al navegar atrás y adelante entre slides. */
  initialPayload?: ExerciseResponsePayload;
  /** Notifica al caso cuando el payload cambia · el caso lo guarda
   *  en su store por slideId para hidratar la próxima vez. */
  onPayloadChange?: (payload: ExerciseResponsePayload) => void;
}

export function ExerciseBlockRenderer({
  blockId,
  sessionId,
  mode = "authenticated",
  slideId,
  caseContext,
  onShellContinue,
  initialPayload,
  onPayloadChange,
}: ExerciseBlockRendererProps) {
  const [payload, setPayload] = useState<ExerciseResponsePayload>(
    () => initialPayload ?? emptyPayload(blockId),
  );

  const handleChange = useCallback(
    (next: ExerciseResponsePayload) => {
      setPayload(next);
      onPayloadChange?.(next);
    },
    [onPayloadChange],
  );

  const common = { sessionId, mode, slideId, caseContext };

  switch (blockId) {
    case "case_cover":
      return (
        <CaseCover
          payload={payload as Extract<ExerciseResponsePayload, { block_id: "case_cover" }>}
          onChange={handleChange}
          {...common}
          onShellContinue={onShellContinue}
        />
      );
    case "reading_passive":
      return (
        <ReadingPassive
          payload={payload as Extract<ExerciseResponsePayload, { block_id: "reading_passive" }>}
          onChange={handleChange}
          {...common}
        />
      );
    case "reading_message":
      return (
        <ReadingMessage
          payload={payload as Extract<ExerciseResponsePayload, { block_id: "reading_message" }>}
          onChange={handleChange}
          {...common}
        />
      );
    case "reading_data_table":
      return (
        <ReadingDataTable
          payload={payload as Extract<ExerciseResponsePayload, { block_id: "reading_data_table" }>}
          onChange={handleChange}
          {...common}
        />
      );
    case "reading_image":
      return (
        <ReadingImage
          payload={payload as Extract<ExerciseResponsePayload, { block_id: "reading_image" }>}
          onChange={handleChange}
          {...common}
        />
      );
    case "reading_kpi_cards":
      return (
        <ReadingKpiCards
          payload={payload as Extract<ExerciseResponsePayload, { block_id: "reading_kpi_cards" }>}
          onChange={handleChange}
          {...common}
        />
      );
    case "reading_timeline":
      return (
        <ReadingTimeline
          payload={payload as Extract<ExerciseResponsePayload, { block_id: "reading_timeline" }>}
          onChange={handleChange}
          {...common}
        />
      );
    case "reading_attachment":
      return (
        <ReadingAttachment
          payload={payload as Extract<ExerciseResponsePayload, { block_id: "reading_attachment" }>}
          onChange={handleChange}
          {...common}
        />
      );
    case "categorize_rows":
      return (
        <CategorizeRows
          payload={payload as Extract<ExerciseResponsePayload, { block_id: "categorize_rows" }>}
          onChange={handleChange}
          {...common}
          onShellContinue={onShellContinue}
        />
      );
    case "ai_comparison":
      return (
        <AIComparison
          payload={payload as Extract<ExerciseResponsePayload, { block_id: "ai_comparison" }>}
          onChange={handleChange}
          {...common}
          onShellContinue={onShellContinue}
        />
      );
    case "workflow_builder":
      return (
        <WorkflowBuilder
          payload={payload as Extract<ExerciseResponsePayload, { block_id: "workflow_builder" }>}
          onChange={handleChange}
          {...common}
        />
      );
    case "ai_output_review":
      return (
        <AIOutputReview
          payload={payload as Extract<ExerciseResponsePayload, { block_id: "ai_output_review" }>}
          onChange={handleChange}
          {...common}
        />
      );
    case "dashboard_pivot":
      return (
        <DashboardPivot
          payload={payload as Extract<ExerciseResponsePayload, { block_id: "dashboard_pivot" }>}
          onChange={handleChange}
          {...common}
          onShellContinue={onShellContinue}
        />
      );
    case "tradeoff_decision_memo":
      return (
        <TradeoffDecisionMemo
          payload={payload as Extract<ExerciseResponsePayload, { block_id: "tradeoff_decision_memo" }>}
          onChange={handleChange}
          {...common}
        />
      );
    case "ai_textfield_free":
      return (
        <AITextfieldFree
          payload={payload as Extract<ExerciseResponsePayload, { block_id: "ai_textfield_free" }>}
          onChange={handleChange}
          {...common}
        />
      );
    case "ai_textfield_guided":
      return (
        <AITextfieldGuided
          payload={payload as Extract<ExerciseResponsePayload, { block_id: "ai_textfield_guided" }>}
          onChange={handleChange}
          {...common}
          onShellContinue={onShellContinue}
        />
      );
    case "model_tradeoff_sliders":
      return (
        <ModelTradeoffSliders
          payload={payload as Extract<ExerciseResponsePayload, { block_id: "model_tradeoff_sliders" }>}
          onChange={handleChange}
          {...common}
        />
      );
  }
}
