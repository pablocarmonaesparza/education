"use client";

/**
 * DashboardPivot — renderer del bloque canónico `dashboard_pivot` (lab_ref 09).
 *
 * Patrón rico (monolito Codex): 3 filtros como ChoiceButton (Tiempo/Riesgo/
 * Impacto) + tabla pivote 3 columnas donde la columna activa se resalta con
 * accent. El monolito solo tenía el filtro + tabla; el registry exige también
 * `interpretation` (texto), que vive como textarea minimal debajo.
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
import { Label, ChoiceButton } from "../_shared/ui-primitives";

type DashboardPivotPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "dashboard_pivot" }
>;

const FILTER_LABELS: Record<string, string> = {
  tiempo: "Tiempo",
  riesgo: "Riesgo",
  impacto: "Impacto",
};

const FILTERS = ["tiempo", "riesgo", "impacto"] as const;

const ROWS: ReadonlyArray<{
  team: string;
  tiempo: string;
  riesgo: string;
  impacto: string;
}> = [
  { team: "Ventas Norte", tiempo: "Alto", riesgo: "Medio", impacto: "Alto" },
  { team: "Ventas Sur", tiempo: "Medio", riesgo: "Alto", impacto: "Medio" },
  { team: "Alianzas", tiempo: "Bajo", riesgo: "Bajo", impacto: "Medio" },
];

interface Props extends ExerciseRendererProps<DashboardPivotPayload> {
  sessionId?: string | null;
}

export function DashboardPivot({
  payload,
  onChange,
  onPatch,
  slideId = "dashboard_pivot",
  mode = "lab_demo",
  sessionId = null,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());
  const firstActionAt = useRef<number | null>(null);
  const totalChanges = useRef(0);

  function update(next: DashboardPivotPayload) {
    if (firstActionAt.current === null) firstActionAt.current = Date.now();
    totalChanges.current += 1;
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:dashboard_pivot:${slideId}`, next, {
        time_to_first_action_ms:
          (firstActionAt.current ?? Date.now()) - mountedAt.current,
        total_changes: totalChanges.current,
        final_payload_bytes: JSON.stringify(next).length,
      });
    }
    onPatch?.(next);
  }

  const filter = payload.selected_filter;

  return (
    <div className="simulador-root">
      <Label>Elige la señal que llevarías al manager</Label>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {FILTERS.map((option) => (
          <ChoiceButton
            key={option}
            selected={filter === option}
            onClick={() => update({ ...payload, selected_filter: option })}
          >
            {FILTER_LABELS[option]}
          </ChoiceButton>
        ))}
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--border)]">
        {ROWS.map((row) => (
          <div
            key={row.team}
            className="grid grid-cols-4 gap-3 border-b border-[var(--hairline)] px-4 py-3 text-[14px] last:border-b-0"
          >
            <span className="font-medium text-[var(--text-primary)]">{row.team}</span>
            <span
              className={
                filter === "tiempo"
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-secondary)]"
              }
            >
              {row.tiempo}
            </span>
            <span
              className={
                filter === "riesgo"
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-secondary)]"
              }
            >
              {row.riesgo}
            </span>
            <span
              className={
                filter === "impacto"
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-secondary)]"
              }
            >
              {row.impacto}
            </span>
          </div>
        ))}
      </div>

      <label className="mt-5 block">
        <span className="text-[13px] font-medium text-[var(--text-secondary)]">
          ¿Qué señal le dirías al manager?
        </span>
        <textarea
          value={payload.interpretation}
          onChange={(event) =>
            update({ ...payload, interpretation: event.target.value })
          }
          rows={3}
          placeholder="Un párrafo: qué se ve, qué propones hacer."
          className="mt-2 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[14px] leading-6 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]"
        />
      </label>
    </div>
  );
}

export function dashboardPivotCompletion(payload: DashboardPivotPayload) {
  const missing: string[] = [];
  if (payload.selected_filter === null) missing.push("selected_filter");
  if (payload.interpretation.trim().length < 20) missing.push("interpretation");
  return { complete: missing.length === 0, missing };
}

export function emptyDashboardPivotPayload(): DashboardPivotPayload {
  return emptyPayload("dashboard_pivot") as DashboardPivotPayload;
}
