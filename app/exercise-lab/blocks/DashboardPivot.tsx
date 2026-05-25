"use client";

/**
 * DashboardPivot — renderer del bloque canónico `dashboard_pivot` (lab_ref 09).
 * Patrón: filtro de segmento + textfield de interpretación.
 */

import { useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";

type DashboardPivotPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "dashboard_pivot" }
>;

const DEFAULT_FILTERS = [
  { id: "30d", label: "Últimos 30 días" },
  { id: "90d", label: "Últimos 90 días" },
  { id: "ytd", label: "Year-to-date" },
];

const DEFAULT_ROWS = [
  { metric: "MQLs", v30d: "+22%", v90d: "+8%", ytd: "+5%" },
  { metric: "SQLs", v30d: "-9%", v90d: "+2%", ytd: "+1%" },
  { metric: "CAC", v30d: "no calculado", v90d: "no calculado", ytd: "no calculado" },
];

interface Props extends ExerciseRendererProps<DashboardPivotPayload> {
  filters?: ReadonlyArray<{ id: string; label: string }>;
  sessionId?: string | null;
}

export function DashboardPivot({
  payload,
  onChange,
  onPatch,
  slideId = "dashboard_pivot",
  mode = "lab_demo",
  sessionId = null,
  filters = DEFAULT_FILTERS,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());
  const totalChanges = useRef(0);

  function update(next: DashboardPivotPayload) {
    totalChanges.current += 1;
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:dashboard_pivot:${slideId}`, next, {
        time_to_first_action_ms: Date.now() - mountedAt.current,
        total_changes: totalChanges.current,
      });
    }
    onPatch?.(next);
  }

  return (
    <div className="simulador-root">
      <div className="ts-callout font-semibold text-[var(--text-primary)]">
        Interpreta el dashboard antes de recomendar
      </div>
      <p className="mt-1 ts-footnote text-[var(--text-tertiary)]">
        Elige una ventana de tiempo y escribe qué conclusión defenderías ante el board.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => update({ ...payload, selected_filter: f.id })}
            className={`min-h-9 rounded-[var(--radius-md)] border px-3 ts-caption-1 font-medium transition-colors ${
              payload.selected_filter === f.id
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full">
          <thead className="bg-[var(--surface-2)]">
            <tr>
              <th className="px-4 py-2 text-left ts-caption-1 font-medium text-[var(--text-secondary)]">
                Métrica
              </th>
              {filters.map((f) => (
                <th
                  key={f.id}
                  className="px-4 py-2 text-right ts-caption-1 font-medium text-[var(--text-secondary)]"
                >
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEFAULT_ROWS.map((row) => (
              <tr key={row.metric} className="border-t border-[var(--hairline)]">
                <td className="px-4 py-3 ts-subhead font-medium text-[var(--text-primary)]">
                  {row.metric}
                </td>
                <td className="px-4 py-3 text-right ts-subhead tabular-nums text-[var(--text-secondary)]">
                  {row.v30d}
                </td>
                <td className="px-4 py-3 text-right ts-subhead tabular-nums text-[var(--text-secondary)]">
                  {row.v90d}
                </td>
                <td className="px-4 py-3 text-right ts-subhead tabular-nums text-[var(--text-secondary)]">
                  {row.ytd}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <label className="mt-4 block">
        <span className="ts-footnote font-medium text-[var(--text-secondary)]">
          ¿Qué conclusión puedes defender?
        </span>
        <textarea
          value={payload.interpretation}
          onChange={(e) => update({ ...payload, interpretation: e.target.value })}
          placeholder="Describe la lectura del dashboard con foco en lo decidible."
          className="mt-2 min-h-[100px] w-full resize-none rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3 ts-subhead text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
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
