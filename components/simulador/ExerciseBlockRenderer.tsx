"use client";

/**
 * ExerciseBlockRenderer — bridge productivo entre `CaseStepContract.exercise_block_id`
 * y los renderers canónicos del registry.
 *
 * Wire activado para los 11 bloques canónicos (Ralph Wiggum loop completado).
 * Cada bloque vive en app/exercise-lab/blocks/* con su payload tipado +
 * autosave via useStepPatch.
 */

import { useState } from "react";
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
import { ConversationResponse } from "@/app/exercise-lab/blocks/ConversationResponse";
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
}

export function ExerciseBlockRenderer({
  blockId,
  sessionId,
  mode = "authenticated",
  slideId,
  caseContext,
  onShellContinue,
}: ExerciseBlockRendererProps) {
  switch (blockId) {
    case "reading_passive":
      return <ReadingPassiveWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
    case "reading_message":
      return <ReadingMessageWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
    case "reading_data_table":
      return <ReadingDataTableWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
    case "reading_image":
      return <ReadingImageWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
    case "reading_kpi_cards":
      return <ReadingKpiCardsWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
    case "reading_timeline":
      return <ReadingTimelineWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
    case "reading_attachment":
      return <ReadingAttachmentWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
    case "categorize_rows":
      return <CategorizeRowsWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} onShellContinue={onShellContinue} />;
    case "ai_comparison":
      return <AIComparisonWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} onShellContinue={onShellContinue} />;
    case "workflow_builder":
      return <WorkflowBuilderWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
    case "ai_output_review":
      return <AIOutputReviewWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
    case "dashboard_pivot":
      return <DashboardPivotWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} onShellContinue={onShellContinue} />;
    case "tradeoff_decision_memo":
      return <TradeoffDecisionMemoWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
    case "ai_textfield_free":
      return <AITextfieldFreeWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
    case "conversation_response":
      return <ConversationResponseWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
    case "ai_textfield_guided":
      return <AITextfieldGuidedWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} onShellContinue={onShellContinue} />;
    case "model_tradeoff_sliders":
      return <ModelTradeoffSlidersWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
  }
}

// Wrappers: cada uno gestiona su estado local (payload) e inicializa
// con emptyPayload() para cumplir no-prefill. Si necesitan content
// específico del caso (filas, opciones), lo leen de caseContext.

type WrapperProps = Omit<ExerciseBlockRendererProps, "blockId" | "onShellContinue"> & {
  onShellContinue?: () => void;
};

function ReadingPassiveWrapper({ sessionId, mode, slideId }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("reading_passive") as Extract<ExerciseResponsePayload, { block_id: "reading_passive" }>,
  );
  return <ReadingPassive payload={payload} onChange={setPayload} sessionId={sessionId} mode={mode} slideId={slideId} />;
}

function ReadingMessageWrapper({ sessionId, mode, slideId, caseContext }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("reading_message") as Extract<ExerciseResponsePayload, { block_id: "reading_message" }>,
  );
  return <ReadingMessage payload={payload} onChange={setPayload} sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
}

function ReadingDataTableWrapper({ sessionId, mode, slideId, caseContext }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("reading_data_table") as Extract<ExerciseResponsePayload, { block_id: "reading_data_table" }>,
  );
  return <ReadingDataTable payload={payload} onChange={setPayload} sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
}

function ReadingImageWrapper({ sessionId, mode, slideId, caseContext }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("reading_image") as Extract<ExerciseResponsePayload, { block_id: "reading_image" }>,
  );
  return <ReadingImage payload={payload} onChange={setPayload} sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
}

function ReadingKpiCardsWrapper({ sessionId, mode, slideId, caseContext }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("reading_kpi_cards") as Extract<ExerciseResponsePayload, { block_id: "reading_kpi_cards" }>,
  );
  return <ReadingKpiCards payload={payload} onChange={setPayload} sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
}

function ReadingTimelineWrapper({ sessionId, mode, slideId, caseContext }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("reading_timeline") as Extract<ExerciseResponsePayload, { block_id: "reading_timeline" }>,
  );
  return <ReadingTimeline payload={payload} onChange={setPayload} sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
}

function ReadingAttachmentWrapper({ sessionId, mode, slideId, caseContext }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("reading_attachment") as Extract<ExerciseResponsePayload, { block_id: "reading_attachment" }>,
  );
  return <ReadingAttachment payload={payload} onChange={setPayload} sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
}

function CategorizeRowsWrapper({ sessionId, mode, slideId, caseContext, onShellContinue }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("categorize_rows") as Extract<ExerciseResponsePayload, { block_id: "categorize_rows" }>,
  );
  return (
    <CategorizeRows
      payload={payload}
      onChange={setPayload}
      sessionId={sessionId}
      mode={mode}
      slideId={slideId}
      caseContext={caseContext}
      onShellContinue={onShellContinue}
    />
  );
}

function AIComparisonWrapper({ sessionId, mode, slideId, onShellContinue }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("ai_comparison") as Extract<ExerciseResponsePayload, { block_id: "ai_comparison" }>,
  );
  return <AIComparison payload={payload} onChange={setPayload} sessionId={sessionId} mode={mode} slideId={slideId} onShellContinue={onShellContinue} />;
}

function WorkflowBuilderWrapper({ sessionId, mode, slideId }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("workflow_builder") as Extract<ExerciseResponsePayload, { block_id: "workflow_builder" }>,
  );
  return <WorkflowBuilder payload={payload} onChange={setPayload} sessionId={sessionId} mode={mode} slideId={slideId} />;
}

function AIOutputReviewWrapper({ sessionId, mode, slideId }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("ai_output_review") as Extract<ExerciseResponsePayload, { block_id: "ai_output_review" }>,
  );
  return <AIOutputReview payload={payload} onChange={setPayload} sessionId={sessionId} mode={mode} slideId={slideId} />;
}

function DashboardPivotWrapper({ sessionId, mode, slideId, onShellContinue }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("dashboard_pivot") as Extract<ExerciseResponsePayload, { block_id: "dashboard_pivot" }>,
  );
  return <DashboardPivot payload={payload} onChange={setPayload} sessionId={sessionId} mode={mode} slideId={slideId} onShellContinue={onShellContinue} />;
}

function TradeoffDecisionMemoWrapper({ sessionId, mode, slideId }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("tradeoff_decision_memo") as Extract<ExerciseResponsePayload, { block_id: "tradeoff_decision_memo" }>,
  );
  return <TradeoffDecisionMemo payload={payload} onChange={setPayload} sessionId={sessionId} mode={mode} slideId={slideId} />;
}

function AITextfieldFreeWrapper({ sessionId, mode, slideId }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("ai_textfield_free") as Extract<ExerciseResponsePayload, { block_id: "ai_textfield_free" }>,
  );
  return <AITextfieldFree payload={payload} onChange={setPayload} sessionId={sessionId} mode={mode} slideId={slideId} />;
}

function ConversationResponseWrapper({ sessionId, mode, slideId, caseContext }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("conversation_response") as Extract<ExerciseResponsePayload, { block_id: "conversation_response" }>,
  );
  return (
    <ConversationResponse
      payload={payload}
      onChange={setPayload}
      sessionId={sessionId}
      mode={mode}
      slideId={slideId}
      caseContext={caseContext}
    />
  );
}

function AITextfieldGuidedWrapper({ sessionId, mode, slideId, onShellContinue }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("ai_textfield_guided") as Extract<ExerciseResponsePayload, { block_id: "ai_textfield_guided" }>,
  );
  return (
    <AITextfieldGuided
      payload={payload}
      onChange={setPayload}
      sessionId={sessionId}
      mode={mode}
      slideId={slideId}
      onShellContinue={onShellContinue}
    />
  );
}

function ModelTradeoffSlidersWrapper({ sessionId, mode, slideId }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("model_tradeoff_sliders") as Extract<ExerciseResponsePayload, { block_id: "model_tradeoff_sliders" }>,
  );
  return <ModelTradeoffSliders payload={payload} onChange={setPayload} sessionId={sessionId} mode={mode} slideId={slideId} />;
}
