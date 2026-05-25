"use client";

/**
 * RunLogReview · renderer del bloque canónico `run_log_review` (lab_ref 08).
 *
 * Patrón rico (monolito Codex): lista de logs como tarjetas pelones, sin
 * chips. El usuario hace toggle por log; cuando está marcado, accent va a
 * banda B (border-[band-b-bar] + bg-[band-b-bg]) para señalar que es algo
 * que requiere atención.
 *
 * El monolito solo tenía un boolean per log; el contrato del registry exige
 * un `flag: string | null` · lo derivamos del log.expected cuando el usuario
 * marca (preserva la semántica del judge sin meter UI de chips extras).
 *
 * Visual restaurado desde el monolito ExerciseLabClient.tsx (Codex). Sin
 * cambios estéticos respecto al original.
 */

import { useEffect, useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";
import { Label } from "../_shared/ui-primitives";

type RunLogReviewPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "run_log_review" }
>;

interface RunLog {
  id: string;
  text: string;
  /** Severidad visual (monolito original): "ok" o "high" · no se persiste
   *  en el payload, solo informa qué flag se asigna si se marca. */
  severity: "ok" | "high";
  /** Flag canónico para el judge cuando se marca este log. */
  flagIfMarked: string;
}

const DEFAULT_LOGS: ReadonlyArray<RunLog> = [
  {
    id: "l1",
    text: "09:02 · Agente leyó cuentas asignadas",
    severity: "ok",
    flagIfMarked: "accion_segura",
  },
  {
    id: "l2",
    text: "09:03 · Incluyó correo personal en borrador",
    severity: "high",
    flagIfMarked: "datos_sensibles",
  },
  {
    id: "l3",
    text: "09:04 · Generó métrica sin fuente externa",
    severity: "high",
    flagIfMarked: "sin_metrica",
  },
  {
    id: "l4",
    text: "09:05 · Dejó envío en borrador pendiente de aprobación",
    severity: "ok",
    flagIfMarked: "accion_segura",
  },
];

interface Props extends ExerciseRendererProps<RunLogReviewPayload> {
  logs?: ReadonlyArray<RunLog>;
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
  const mountedAt = useRef(Date.now());
  const firstActionAt = useRef<number | null>(null);
  const totalChanges = useRef(0);

  function toggleLog(log: RunLog) {
    if (firstActionAt.current === null) firstActionAt.current = Date.now();
    totalChanges.current += 1;
    const current = payload.flagged_logs.find((l) => l.log_id === log.id);
    const isMarked = current?.flag !== null && current?.flag !== undefined;
    const nextFlag: string | null = isMarked ? null : log.flagIfMarked;
    const next: RunLogReviewPayload = {
      ...payload,
      flagged_logs: payload.flagged_logs.map((l) =>
        l.log_id === log.id ? { ...l, flag: nextFlag } : l,
      ),
    };
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:run_log_review:${slideId}`, next, {
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
      <Label>Marca eventos que requieren intervención</Label>
      <div className="mt-4 grid gap-3">
        {logs.map((log) => {
          const current = payload.flagged_logs.find((l) => l.log_id === log.id);
          const selected = current?.flag !== null && current?.flag !== undefined;
          return (
            <button
              key={log.id}
              type="button"
              onClick={() => toggleLog(log)}
              className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                selected
                  ? "border-[var(--band-b-bar)] bg-[var(--band-b-bg)]"
                  : "border-[var(--border)] bg-[var(--surface-2)]"
              }`}
            >
              <span className="text-[15px] text-[var(--text-primary)]">{log.text}</span>
            </button>
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
  // Bloque completo si al menos UN log fue marcado.
  const anyMarked = payload.flagged_logs.some((l) => l.flag !== null);
  return {
    complete: anyMarked,
    missing: anyMarked ? [] : ["flagged_logs"],
  };
}

export function emptyRunLogReviewPayload(): RunLogReviewPayload {
  return emptyPayload("run_log_review") as RunLogReviewPayload;
}
