"use client";

/**
 * TradeoffDecisionMemo · renderer del bloque canónico `tradeoff_decision_memo`
 * (lab_ref 10).
 *
 * Vertical · 2 secciones apiladas:
 *   1. Recomendación (3 cards horizontales · auto-elige)
 *   2. Memo (textarea · aparece animada tras elegir recomendación)
 *
 * Sin hint interno · el shell tiene eyebrow + title + body. Continuar
 * del shell sigue al final cuando el memo es suficiente.
 */

import { useRef } from "react";
import { motion } from "framer-motion";
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

const DEFAULT_DECISIONS: ReadonlyArray<{
  id: string;
  title: string;
  detail: string;
}> = [
  {
    id: "launch",
    title: "Lanzar ahora",
    detail: "Úsalo si el beneficio es alto y los riesgos ya quedaron mitigados.",
  },
  {
    id: "pilot",
    title: "Piloto controlado",
    detail:
      "Úsalo si hay señales prometedoras, pero todavía falta validar con un grupo pequeño.",
  },
  {
    id: "pause",
    title: "Pausar y escalar",
    detail:
      "Úsalo si falta evidencia, hay datos sensibles o la decisión puede afectar a terceros.",
  },
];

interface Props extends ExerciseRendererProps<TradeoffDecisionMemoPayload> {
  decisions?: ReadonlyArray<{ id: string; title: string; detail: string }>;
  sessionId?: string | null;
}

export function TradeoffDecisionMemo({
  payload,
  onChange,
  onPatch,
  slideId = "tradeoff_decision_memo",
  mode = "lab_demo",
  sessionId = null,
  caseContext,
  decisions: decisionsProp,
}: Props) {
  const decisions =
    decisionsProp ??
    (caseContext?.decisions as ReadonlyArray<{ id: string; title: string; detail: string }> | undefined) ??
    DEFAULT_DECISIONS;
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null);
  const mountedAt = useRef(Date.now());
  const firstActionAt = useRef<number | null>(null);
  const totalChanges = useRef(0);

  function update(next: TradeoffDecisionMemoPayload) {
    if (firstActionAt.current === null) firstActionAt.current = Date.now();
    totalChanges.current += 1;
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:tradeoff_decision_memo:${slideId}`, next, {
        time_to_first_action_ms:
          (firstActionAt.current ?? Date.now()) - mountedAt.current,
        total_changes: totalChanges.current,
        final_payload_bytes: JSON.stringify(next).length,
      });
    }
    onPatch?.(next);
  }

  const hasDecision = payload.decision.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* 1. Recomendación · 3 cards horizontales */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {decisions.map((option, idx) => {
          const isSelected = payload.decision === option.id;
          return (
            <motion.button
              key={option.id}
              type="button"
              onClick={() => update({ ...payload, decision: option.id })}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.28,
                delay: idx * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileTap={{ scale: 0.99 }}
              className={`flex h-full flex-col gap-2 rounded-[var(--radius-lg)] border p-4 text-left transition-colors ${
                isSelected
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
              }`}
            >
              <span
                className={`ts-callout font-semibold ${
                  isSelected
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-primary)]"
                }`}
              >
                {option.title}
              </span>
              <span className="ts-subhead leading-[1.5] text-[var(--text-secondary)]">
                {option.detail}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* 2. Memo · aparece animado tras elegir recomendación */}
      {hasDecision && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <textarea
            value={payload.memo}
            onChange={(event) =>
              update({ ...payload, memo: event.target.value })
            }
            rows={6}
            placeholder="Explica qué harías, por qué, qué riesgo estás aceptando y qué tendría que revisarse antes de avanzar."
            className="w-full resize-none rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-4 ts-body leading-[1.55] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]"
          />
        </motion.div>
      )}
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
