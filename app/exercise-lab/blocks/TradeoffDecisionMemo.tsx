"use client";

/**
 * TradeoffDecisionMemo — renderer del bloque canónico `tradeoff_decision_memo` (lab_ref 11).
 * Patrón: chips de decisión + textarea para memo al manager.
 */

import { useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";

type TradeoffDecisionMemoPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "tradeoff_decision_memo" }
>;

const DEFAULT_DECISIONS = [
  { id: "auto", label: "Full auto" },
  { id: "draft", label: "Borrador + aprobación" },
  { id: "internal", label: "Solo interno" },
  { id: "pause", label: "Pausar" },
];

interface Props extends ExerciseRendererProps<TradeoffDecisionMemoPayload> {
  decisions?: ReadonlyArray<{ id: string; label: string }>;
  sessionId?: string | null;
}

export function TradeoffDecisionMemo({
  payload,
  onChange,
  onPatch,
  slideId = "tradeoff_decision_memo",
  mode = "lab_demo",
  sessionId = null,
  decisions = DEFAULT_DECISIONS,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());
  const totalChanges = useRef(0);

  function update(next: TradeoffDecisionMemoPayload) {
    totalChanges.current += 1;
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:tradeoff_decision_memo:${slideId}`, next, {
        time_to_first_action_ms: Date.now() - mountedAt.current,
        total_changes: totalChanges.current,
      });
    }
    onPatch?.(next);
  }

  return (
    <div className="simulador-root">
      <div className="ts-callout font-semibold text-[var(--text-primary)]">
        Toma la decisión + escribe el memo para tu líder
      </div>
      <p className="mt-1 ts-footnote text-[var(--text-tertiary)]">
        Velocidad máxima, piloto controlado, solo interno o pausar. Cada elección tiene costo.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {decisions.map((d) => {
          const selected = payload.decision === d.id;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => update({ ...payload, decision: d.id })}
              className={`min-h-11 rounded-[var(--radius-md)] border px-4 ts-callout font-medium transition-colors ${
                selected
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      <label className="mt-4 block">
        <span className="ts-footnote font-medium text-[var(--text-secondary)]">
          Memo al manager — qué harías, por qué, y qué debe revisar
        </span>
        <textarea
          value={payload.memo}
          onChange={(e) => update({ ...payload, memo: e.target.value })}
          placeholder="Explica la decisión + los controles + el siguiente paso."
          className="mt-2 min-h-[200px] w-full resize-none rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 ts-body text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
        />
        <span className="mt-1 block ts-caption-1 text-[var(--text-tertiary)]">
          {payload.memo.length} caracteres
        </span>
      </label>
    </div>
  );
}

export function tradeoffDecisionMemoCompletion(
  payload: TradeoffDecisionMemoPayload,
) {
  const missing: string[] = [];
  if (payload.decision.trim().length === 0) missing.push("decision");
  if (payload.memo.trim().length < 40) missing.push("memo");
  return { complete: missing.length === 0, missing };
}

export function emptyTradeoffDecisionMemoPayload(): TradeoffDecisionMemoPayload {
  return emptyPayload("tradeoff_decision_memo") as TradeoffDecisionMemoPayload;
}
