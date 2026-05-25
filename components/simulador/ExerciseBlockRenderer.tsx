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
import { DataTableTriage } from "@/app/exercise-lab/blocks/DataTableTriage";
import { PermissionMatrix } from "@/app/exercise-lab/blocks/PermissionMatrix";
import { AIComparison } from "@/app/exercise-lab/blocks/AIComparison";
import { WorkflowBuilder } from "@/app/exercise-lab/blocks/WorkflowBuilder";
import { AIOutputReview } from "@/app/exercise-lab/blocks/AIOutputReview";
import { RunLogReview } from "@/app/exercise-lab/blocks/RunLogReview";
import { DashboardPivot } from "@/app/exercise-lab/blocks/DashboardPivot";
import { TradeoffDecisionMemo } from "@/app/exercise-lab/blocks/TradeoffDecisionMemo";
import { AgentBriefBuilder } from "@/app/exercise-lab/blocks/AgentBriefBuilder";
import { AITextfieldFree } from "@/app/exercise-lab/blocks/AITextfieldFree";
import { AITextfieldGuided } from "@/app/exercise-lab/blocks/AITextfieldGuided";
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
}

export function ExerciseBlockRenderer({
  blockId,
  sessionId,
  mode = "authenticated",
  slideId,
  caseContext,
}: ExerciseBlockRendererProps) {
  switch (blockId) {
    case "reading_passive":
      return <ReadingPassiveWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
    case "data_table_triage":
      return <DataTableWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
    case "permission_matrix":
      return <PermissionMatrixWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
    case "ai_comparison":
      return <AIComparisonWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
    case "workflow_builder":
      return <WorkflowBuilderWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
    case "ai_output_review":
      return <AIOutputReviewWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
    case "run_log_review":
      return <RunLogReviewWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
    case "dashboard_pivot":
      return <DashboardPivotWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
    case "tradeoff_decision_memo":
      return <TradeoffDecisionMemoWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
    case "agent_brief_builder":
      return <AgentBriefBuilderWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
    case "ai_textfield_free":
      return <AITextfieldFreeWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
    case "ai_textfield_guided":
      return <AITextfieldGuidedWrapper sessionId={sessionId} mode={mode} slideId={slideId} caseContext={caseContext} />;
  }
}

// Wrappers: cada uno gestiona su estado local (payload) e inicializa
// con emptyPayload() para cumplir no-prefill. Si necesitan content
// específico del caso (filas, opciones), lo leen de caseContext.

type WrapperProps = Omit<ExerciseBlockRendererProps, "blockId">;

function ReadingPassiveWrapper({ sessionId, mode, slideId }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("reading_passive") as Extract<ExerciseResponsePayload, { block_id: "reading_passive" }>,
  );
  return <ReadingPassive payload={payload} onChange={setPayload} sessionId={sessionId} mode={mode} slideId={slideId} />;
}

function DataTableWrapper({ sessionId, mode, slideId, caseContext }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("data_table_triage") as Extract<ExerciseResponsePayload, { block_id: "data_table_triage" }>,
  );
  return (
    <DataTableTriage
      payload={payload}
      onChange={setPayload}
      sessionId={sessionId}
      mode={mode}
      slideId={slideId}
      fields={caseContext?.fields as undefined}
    />
  );
}

function PermissionMatrixWrapper({ sessionId, mode, slideId }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("permission_matrix") as Extract<ExerciseResponsePayload, { block_id: "permission_matrix" }>,
  );
  return <PermissionMatrix payload={payload} onChange={setPayload} sessionId={sessionId} mode={mode} slideId={slideId} />;
}

function AIComparisonWrapper({ sessionId, mode, slideId }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("ai_comparison") as Extract<ExerciseResponsePayload, { block_id: "ai_comparison" }>,
  );
  return <AIComparison payload={payload} onChange={setPayload} sessionId={sessionId} mode={mode} slideId={slideId} />;
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

function RunLogReviewWrapper({ sessionId, mode, slideId }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("run_log_review") as Extract<ExerciseResponsePayload, { block_id: "run_log_review" }>,
  );
  return <RunLogReview payload={payload} onChange={setPayload} sessionId={sessionId} mode={mode} slideId={slideId} />;
}

function DashboardPivotWrapper({ sessionId, mode, slideId }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("dashboard_pivot") as Extract<ExerciseResponsePayload, { block_id: "dashboard_pivot" }>,
  );
  return <DashboardPivot payload={payload} onChange={setPayload} sessionId={sessionId} mode={mode} slideId={slideId} />;
}

function TradeoffDecisionMemoWrapper({ sessionId, mode, slideId }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("tradeoff_decision_memo") as Extract<ExerciseResponsePayload, { block_id: "tradeoff_decision_memo" }>,
  );
  return <TradeoffDecisionMemo payload={payload} onChange={setPayload} sessionId={sessionId} mode={mode} slideId={slideId} />;
}

function AgentBriefBuilderWrapper({ sessionId, mode, slideId }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("agent_brief_builder") as Extract<ExerciseResponsePayload, { block_id: "agent_brief_builder" }>,
  );
  return <AgentBriefBuilder payload={payload} onChange={setPayload} sessionId={sessionId} mode={mode} slideId={slideId} />;
}

function AITextfieldFreeWrapper({ sessionId, mode, slideId }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("ai_textfield_free") as Extract<ExerciseResponsePayload, { block_id: "ai_textfield_free" }>,
  );
  return <AITextfieldFree payload={payload} onChange={setPayload} sessionId={sessionId} mode={mode} slideId={slideId} />;
}

function AITextfieldGuidedWrapper({ sessionId, mode, slideId }: WrapperProps) {
  const [payload, setPayload] = useState(() =>
    emptyPayload("ai_textfield_guided") as Extract<ExerciseResponsePayload, { block_id: "ai_textfield_guided" }>,
  );
  return <AITextfieldGuided payload={payload} onChange={setPayload} sessionId={sessionId} mode={mode} slideId={slideId} />;
}
