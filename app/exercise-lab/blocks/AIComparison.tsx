"use client";

/**
 * AIComparison · renderer del bloque canónico `ai_comparison` (lab_ref 07).
 *
 * 4 opciones discretas A/B/C/D verticales con animación stagger de
 * entrada (cada card aparece con 60ms de delay) para darle dinamismo.
 *
 * Sin hint interno · el shell del ExerciseSection ya tiene eyebrow +
 * title + body.
 */

import { useRef } from "react";
import { motion } from "framer-motion";
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
  onShellContinue,
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
    // Auto-advance al siguiente slide del lab (single-select · la
    // elección codifica el criterio · sin Continuar visible).
    if (onShellContinue) {
      window.setTimeout(() => onShellContinue(), 360);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {options.map((opt, idx) => {
        const isSelected = payload.selected_output === opt.id;
        return (
          <motion.button
            key={opt.id}
            type="button"
            onClick={() => update(opt.id)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.28,
              delay: idx * 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileTap={{ scale: 0.99 }}
            className={`flex h-full flex-col gap-3 rounded-[var(--radius-lg)] border p-4 text-left transition-colors ${
              isSelected
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
            }`}
          >
            <span
              className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-full ts-callout font-semibold transition-colors ${
                isSelected
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface-2)] text-[var(--text-secondary)]"
              }`}
              aria-hidden
            >
              {opt.id}
            </span>
            <span className="ts-subhead leading-[1.5] text-[var(--text-primary)]">
              {opt.body}
            </span>
          </motion.button>
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
