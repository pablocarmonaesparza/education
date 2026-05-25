"use client";

/**
 * AIOutputReview · renderer del bloque canónico `ai_output_review` (lab_ref 04).
 *
 * Patrón: lista de líneas de output donde el usuario MARCA las que tienen
 * problema. Cada línea trae un hint del tipo de riesgo (claim sin fuente,
 * dato personal, etc) · el flag del payload se infiere por hint cuando el
 * usuario marca, manteniendo el contrato del registry (ReviewFlag).
 *
 * Visual restaurado desde el monolito ExerciseLabClient.tsx (Codex): toggle
 * por línea con bordes accent + subtítulo del issue, sin chip extra. Sin
 * cambios estéticos respecto al original.
 */

import { useEffect, useRef } from "react";
import type {
  ReviewFlag,
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";
import { Label } from "../_shared/ui-primitives";

type AIOutputReviewPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "ai_output_review" }
>;

// Cada segmento tiene un flag canónico asociado · cuando el usuario lo marca,
// se persiste ese flag; cuando lo desmarca, se persiste null (no-prefill).
interface OutputSegment {
  id: string;
  text: string;
  issue: string;
  /** Si está vacío, el segmento es "limpio" · marcarlo deja flag=null. */
  flagIfMarked: ReviewFlag | null;
}

const DEFAULT_SEGMENTS: ReadonlyArray<OutputSegment> = [
  {
    id: "metric",
    text: "Podemos recuperar 40% de cuentas inactivas en 30 días.",
    issue: "Afirmación sin fuente",
    flagIfMarked: "claim_no_verificado",
  },
  {
    id: "pii",
    text: "El mensaje se enviará a mariana@aurora.example con tono urgente.",
    issue: "Dato personal",
    flagIfMarked: "dato_sensible",
  },
  {
    id: "safe",
    text: "Propongo usar datos agregados y validar cualquier promesa antes de enviar.",
    issue: "Usable",
    flagIfMarked: "frase_reutilizable",
  },
];

interface Props extends ExerciseRendererProps<AIOutputReviewPayload> {
  segments?: ReadonlyArray<OutputSegment>;
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
  const mountedAt = useRef(Date.now());
  const firstActionAt = useRef<number | null>(null);
  const totalChanges = useRef(0);

  function toggleSegment(segment: OutputSegment) {
    if (firstActionAt.current === null) firstActionAt.current = Date.now();
    totalChanges.current += 1;
    const current = payload.flagged_segments.find((s) => s.segment_id === segment.id);
    const isMarked = current?.flag !== null && current?.flag !== undefined;
    const nextFlag: ReviewFlag | null = isMarked ? null : segment.flagIfMarked;
    const next: AIOutputReviewPayload = {
      ...payload,
      flagged_segments: payload.flagged_segments.map((s) =>
        s.segment_id === segment.id ? { ...s, flag: nextFlag } : s,
      ),
    };
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:ai_output_review:${slideId}`, next, {
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
      <Label>Marca lo que no se puede usar todavía</Label>
      <div className="mt-4 grid gap-3">
        {segments.map((line) => {
          const current = payload.flagged_segments.find(
            (s) => s.segment_id === line.id,
          );
          const selected = current?.flag !== null && current?.flag !== undefined;
          return (
            <button
              key={line.id}
              type="button"
              onClick={() => toggleSegment(line)}
              className={`min-h-11 rounded-2xl border px-4 py-4 text-left transition-colors ${
                selected
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)]"
              }`}
            >
              <span className="block text-[15px] leading-6 text-[var(--text-primary)]">
                {line.text}
              </span>
              <span className="mt-2 block text-[13px] text-[var(--text-secondary)]">
                {line.issue}
              </span>
            </button>
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
  // Bloque completo si al menos UN segmento fue marcado (no exige marcar
  // todos · el ejercicio es de "qué requiere intervención", no de clasificar
  // todo). El judge LLM evaluará si la selección coincide con el patrón
  // esperado (datos sensibles + claims sin fuente).
  const anyMarked = payload.flagged_segments.some((s) => s.flag !== null);
  return {
    complete: anyMarked,
    missing: anyMarked ? [] : ["flagged_segments"],
  };
}

export function emptyAIOutputReviewPayload(): AIOutputReviewPayload {
  return emptyPayload("ai_output_review") as AIOutputReviewPayload;
}
