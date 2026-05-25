"use client";

/**
 * AIComparison — renderer del bloque canónico `ai_comparison` (lab_ref 05).
 * Patrón: A/B side-by-side + razón del tradeoff.
 */

import { useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";

type AIComparisonPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "ai_comparison" }
>;

const DEFAULT_OPTIONS = {
  A: {
    title: "Respuesta A",
    body: "Lanza la campaña hoy. El cliente necesita ver acción rápida y la IA ya preparó los mensajes.",
  },
  B: {
    title: "Respuesta B",
    body: "Usa el borrador como material interno. Quita datos personales, valida métricas y pide una revisión corta antes de enviar.",
  },
};

const SELECTIONS = [
  { value: "A" as const, label: "Usar A" },
  { value: "B" as const, label: "Usar B" },
  { value: "fusionar" as const, label: "Fusionar" },
  { value: "rechazar" as const, label: "Rechazar ambas" },
];

interface Props extends ExerciseRendererProps<AIComparisonPayload> {
  options?: { A: { title: string; body: string }; B: { title: string; body: string } };
  sessionId?: string | null;
}

export function AIComparison({
  payload,
  onChange,
  onPatch,
  slideId = "ai_comparison",
  mode = "lab_demo",
  sessionId = null,
  options = DEFAULT_OPTIONS,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());
  const totalChanges = useRef(0);

  function update(next: AIComparisonPayload) {
    totalChanges.current += 1;
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:ai_comparison:${slideId}`, next, {
        time_to_first_action_ms: Date.now() - mountedAt.current,
        total_changes: totalChanges.current,
      });
    }
    onPatch?.(next);
  }

  return (
    <div className="simulador-root">
      <div className="ts-callout font-semibold text-[var(--text-primary)]">
        Elige cuál respuesta llevarías al manager
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {(["A", "B"] as const).map((id) => {
          const o = options[id];
          const selected = payload.selected_output === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => update({ ...payload, selected_output: id })}
              className={`rounded-[var(--radius-lg)] border p-5 text-left transition-colors ${
                selected
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
              }`}
            >
              <div className="ts-headline font-semibold text-[var(--text-primary)]">{o.title}</div>
              <p className="mt-2 ts-subhead text-[var(--text-secondary)] leading-[1.5]">{o.body}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {SELECTIONS.slice(2).map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => update({ ...payload, selected_output: s.value })}
            className={`rounded-[var(--radius-md)] border px-4 py-2 ts-callout font-medium transition-colors ${
              payload.selected_output === s.value
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <label className="mt-4 block">
        <span className="ts-footnote font-medium text-[var(--text-secondary)]">
          ¿Por qué? Explica el tradeoff
        </span>
        <textarea
          value={payload.tradeoff_reason}
          onChange={(e) => update({ ...payload, tradeoff_reason: e.target.value })}
          placeholder="Una línea es suficiente: qué ganas y qué pierdes."
          className="mt-2 min-h-[80px] w-full resize-none rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3 ts-subhead text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
        />
      </label>
    </div>
  );
}

export function aiComparisonCompletion(payload: AIComparisonPayload) {
  const missing: string[] = [];
  if (payload.selected_output === null) missing.push("selected_output");
  if (payload.tradeoff_reason.trim().length === 0) missing.push("tradeoff_reason");
  return { complete: missing.length === 0, missing };
}

export function emptyAIComparisonPayload(): AIComparisonPayload {
  return emptyPayload("ai_comparison") as AIComparisonPayload;
}
