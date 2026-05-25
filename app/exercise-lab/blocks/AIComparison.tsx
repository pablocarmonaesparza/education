"use client";

/**
 * AIComparison · renderer del bloque canónico `ai_comparison` (lab_ref 05).
 *
 * 4 opciones discretas A/B/C/D. La elección entre alternativas codifica
 * el criterio del participante. Sin textarea de justificación (regla del
 * producto: eliminar fricción cualitativa).
 *
 * Sin hint interno · el shell del ExerciseSection ya tiene eyebrow +
 * title + body.
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

type OutputKey = "A" | "B" | "C" | "D";

interface OutputOption {
  id: OutputKey;
  title: string;
  body: string;
}

const DEFAULT_OPTIONS: OutputOption[] = [
  {
    id: "A",
    title: "Respuesta A",
    body: "Lanza la campaña hoy. El cliente necesita ver acción rápida y la IA ya preparó los mensajes.",
  },
  {
    id: "B",
    title: "Respuesta B",
    body: "Usa el borrador como material interno. Quita datos personales, valida métricas y pide una revisión corta antes de enviar.",
  },
  {
    id: "C",
    title: "Respuesta C",
    body: "Pide al cliente más contexto antes de generar nada: qué segmento exacto, qué métrica le preocupa, qué probó antes.",
  },
  {
    id: "D",
    title: "Respuesta D",
    body: "Combina los dos mejores ángulos del borrador en un solo mensaje y reduce a un solo llamado a la acción.",
  },
];

interface Props extends ExerciseRendererProps<AIComparisonPayload> {
  options?: OutputOption[];
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
  const firstActionAt = useRef<number | null>(null);
  const totalChanges = useRef(0);

  function update(id: OutputKey) {
    if (firstActionAt.current === null) firstActionAt.current = Date.now();
    totalChanges.current += 1;
    const next: AIComparisonPayload = { ...payload, selected_output: id };
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:ai_comparison:${slideId}`, next, {
        time_to_first_action_ms:
          (firstActionAt.current ?? Date.now()) - mountedAt.current,
        total_changes: totalChanges.current,
        final_payload_bytes: JSON.stringify(next).length,
      });
    }
    onPatch?.(next);
  }

  return (
    <div className="flex flex-col gap-3">
      {options.map((opt) => {
        const isSelected = payload.selected_output === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => update(opt.id)}
            className={`flex items-start gap-4 rounded-[var(--radius-lg)] border p-4 text-left transition-colors ${
              isSelected
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
            }`}
          >
            <span
              className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-full ts-callout font-semibold ${
                isSelected
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface-2)] text-[var(--text-secondary)]"
              }`}
              aria-hidden
            >
              {opt.id}
            </span>
            <span className="ts-body leading-[1.55] text-[var(--text-primary)]">
              {opt.body}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function aiComparisonCompletion(payload: AIComparisonPayload) {
  return {
    complete: payload.selected_output !== null,
    missing: payload.selected_output === null ? ["selected_output"] : [],
  };
}

export function emptyAIComparisonPayload(): AIComparisonPayload {
  return emptyPayload("ai_comparison") as AIComparisonPayload;
}
