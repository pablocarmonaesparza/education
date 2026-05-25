"use client";

/**
 * TradeoffDecisionMemo — renderer del bloque canónico `tradeoff_decision_memo`
 * (lab_ref 11).
 *
 * Patrón rico (monolito Codex): grid md:[320px_1fr]
 *   ┌──────────────────────┬──────────────────────────┐
 *   │ Recomendación (3)    │ Memo para tu líder       │
 *   │  ▸ Lanzar ahora      │  textarea h-[260px]      │
 *   │  ▸ Piloto controlado │  placeholder largo       │
 *   │  ▸ Pausar y escalar  │                          │
 *   └──────────────────────┴──────────────────────────┘
 *
 * Cada opción es una tarjeta con title + detail (no chip). Selected = accent
 * border + accent-soft bg.
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
  decisions = DEFAULT_DECISIONS,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
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

  return (
    <div className="simulador-root">
      <div className="grid gap-5 md:grid-cols-[320px_1fr]">
        <div>
          <Label>Elige la recomendación</Label>
          <div className="mt-3 grid gap-3">
            {decisions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => update({ ...payload, decision: option.id })}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  payload.decision === option.id
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)]"
                }`}
              >
                <span className="block text-[15px] font-semibold text-[var(--text-primary)]">
                  {option.title}
                </span>
                <span className="mt-2 block text-[13px] leading-5 text-[var(--text-secondary)]">
                  {option.detail}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Escribe el memo para tu líder</Label>
          <textarea
            value={payload.memo}
            onChange={(event) => update({ ...payload, memo: event.target.value })}
            rows={10}
            placeholder="Explica qué harías, por qué, qué riesgo estás aceptando y qué tendría que revisarse antes de avanzar."
            className="mt-3 h-[calc(100%-2rem)] min-h-[260px] w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4 text-[15px] leading-6 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]"
          />
        </div>
      </div>
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
