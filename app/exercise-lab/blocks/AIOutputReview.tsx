"use client";

/**
 * AIOutputReview — renderer del bloque canónico `ai_output_review` (lab_ref 04).
 * Patrón: lista de líneas de output con flag por segmento.
 */

import { useEffect, useRef } from "react";
import type {
  ReviewFlag,
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";

type AIOutputReviewPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "ai_output_review" }
>;

const FLAG_OPTIONS: Array<{ value: ReviewFlag; label: string }> = [
  { value: "claim_no_verificado", label: "Claim sin verificar" },
  { value: "tono_agresivo", label: "Tono agresivo" },
  { value: "dato_sensible", label: "Dato sensible" },
  { value: "frase_reutilizable", label: "Reutilizable" },
];

const DEFAULT_SEGMENTS = [
  { id: "metric", text: "Podemos recuperar 40% de cuentas inactivas en 30 días.", hint: "Afirmación sin fuente" },
  { id: "pii", text: "El mensaje se enviará a mariana@aurora.example con tono urgente.", hint: "Dato personal" },
  { id: "safe", text: "Propongo usar datos agregados y validar cualquier promesa antes de enviar.", hint: "Línea limpia" },
];

interface Props extends ExerciseRendererProps<AIOutputReviewPayload> {
  segments?: ReadonlyArray<{ id: string; text: string; hint?: string }>;
  sessionId?: string | null;
}

export function AIOutputReview({
  payload,
  onChange,
  onPatch,
  slideId = "ai_output_review",
  mode = "lab_demo",
  sessionId = null,
  segments = DEFAULT_SEGMENTS,
}: Props) {
  useEffect(() => {
    if (payload.flagged_segments.length === 0 && segments.length > 0) {
      onChange({
        ...payload,
        flagged_segments: segments.map((s) => ({ segment_id: s.id, flag: null })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const totalChanges = useRef(0);

  function setFlag(segmentId: string, flag: ReviewFlag) {
    totalChanges.current += 1;
    const next: AIOutputReviewPayload = {
      ...payload,
      flagged_segments: payload.flagged_segments.map((s) =>
        s.segment_id === segmentId ? { ...s, flag } : s,
      ),
    };
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:ai_output_review:${slideId}`, next, {
        total_changes: totalChanges.current,
      });
    }
    onPatch?.(next);
  }

  return (
    <div className="simulador-root">
      <div className="ts-callout font-semibold text-[var(--text-primary)]">
        Marca cada línea del output con su tipo de riesgo
      </div>
      <p className="mt-1 ts-footnote text-[var(--text-tertiary)]">
        Ninguna acción se ejecuta hasta que clasificas. Cada flag dispara un control distinto.
      </p>

      <div className="mt-4 grid gap-3">
        {segments.map((seg) => {
          const current = payload.flagged_segments.find((s) => s.segment_id === seg.id);
          return (
            <div
              key={seg.id}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <p className="ts-subhead leading-[1.5] text-[var(--text-primary)]">{seg.text}</p>
              {seg.hint && (
                <p className="mt-1 ts-caption-1 text-[var(--text-tertiary)]">{seg.hint}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {FLAG_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFlag(seg.id, opt.value)}
                    className={`min-h-9 rounded-[var(--radius-md)] border px-3 ts-caption-1 font-medium transition-colors ${
                      current?.flag === opt.value
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function aiOutputReviewCompletion(payload: AIOutputReviewPayload) {
  if (payload.flagged_segments.length === 0) {
    return { complete: false, missing: ["flagged_segments"] };
  }
  const missing = payload.flagged_segments
    .filter((s) => s.flag === null)
    .map((s) => s.segment_id);
  return { complete: missing.length === 0, missing };
}

export function emptyAIOutputReviewPayload(): AIOutputReviewPayload {
  return emptyPayload("ai_output_review") as AIOutputReviewPayload;
}
