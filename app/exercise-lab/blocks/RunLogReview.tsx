"use client";

/**
 * RunLogReview — renderer del bloque canónico `run_log_review` (lab_ref 08).
 * Patrón: lista de logs con flag (loop / sensitive / no_metric / safe).
 */

import { useEffect, useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";

type RunLogReviewPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "run_log_review" }
>;

const FLAGS = [
  { value: "retry_loop", label: "Loop", tone: "bad" as const },
  { value: "datos_sensibles", label: "Datos sensibles", tone: "bad" as const },
  { value: "sin_metrica", label: "Sin métrica", tone: "warn" as const },
  { value: "accion_segura", label: "Acción segura", tone: "ok" as const },
];

const DEFAULT_LOGS = [
  { id: "l1", text: "09:02 · Agente leyó cuentas asignadas", expected: "accion_segura" },
  { id: "l2", text: "09:03 · Incluyó correo personal en borrador", expected: "datos_sensibles" },
  { id: "l3", text: "09:04 · Generó métrica sin fuente externa", expected: "sin_metrica" },
  { id: "l4", text: "09:05 · Reintentó envío 6 veces sin pausa", expected: "retry_loop" },
];

interface Props extends ExerciseRendererProps<RunLogReviewPayload> {
  logs?: ReadonlyArray<{ id: string; text: string; expected?: string }>;
  sessionId?: string | null;
}

export function RunLogReview({
  payload,
  onChange,
  onPatch,
  slideId = "run_log_review",
  mode = "lab_demo",
  sessionId = null,
  logs = DEFAULT_LOGS,
}: Props) {
  useEffect(() => {
    if (payload.flagged_logs.length === 0 && logs.length > 0) {
      onChange({
        ...payload,
        flagged_logs: logs.map((l) => ({ log_id: l.id, flag: null })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const totalChanges = useRef(0);

  function setFlag(logId: string, flag: string) {
    totalChanges.current += 1;
    const next: RunLogReviewPayload = {
      ...payload,
      flagged_logs: payload.flagged_logs.map((l) =>
        l.log_id === logId ? { ...l, flag } : l,
      ),
    };
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:run_log_review:${slideId}`, next, {
        total_changes: totalChanges.current,
      });
    }
    onPatch?.(next);
  }

  return (
    <div className="simulador-root">
      <div className="ts-callout font-semibold text-[var(--text-primary)]">
        Revisa los logs del agente y marca qué requiere intervención
      </div>
      <p className="mt-1 ts-footnote text-[var(--text-tertiary)]">
        Cada evento del log puede ser seguro, riesgoso o señal de mal funcionamiento.
      </p>

      <div className="mt-4 grid gap-3">
        {logs.map((log) => {
          const current = payload.flagged_logs.find((l) => l.log_id === log.id);
          return (
            <div
              key={log.id}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <p className="ts-subhead font-mono text-[var(--text-primary)]">{log.text}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {FLAGS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFlag(log.id, f.value)}
                    className={`min-h-9 rounded-[var(--radius-md)] border px-3 ts-caption-1 font-medium transition-colors ${
                      current?.flag === f.value
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    {f.label}
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

export function runLogReviewCompletion(payload: RunLogReviewPayload) {
  if (payload.flagged_logs.length === 0) {
    return { complete: false, missing: ["flagged_logs"] };
  }
  const missing = payload.flagged_logs
    .filter((l) => l.flag === null)
    .map((l) => l.log_id);
  return { complete: missing.length === 0, missing };
}

export function emptyRunLogReviewPayload(): RunLogReviewPayload {
  return emptyPayload("run_log_review") as RunLogReviewPayload;
}
