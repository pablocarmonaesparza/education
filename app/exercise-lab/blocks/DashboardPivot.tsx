"use client";

/**
 * DashboardPivot · renderer del bloque canónico `dashboard_pivot` (lab_ref 09).
 *
 * Patrón: el participante filtra una tabla pivote por una dimensión
 * (Tiempo / Riesgo / Impacto) y propone qué señal llevar al manager.
 *
 * Rediseño v0.6.0 (per Pablo "no se entiende muy bien"):
 *  - Filtros con ícono visual + descripción inline de qué significan.
 *  - Tabla con header explícito (Equipo · Tiempo · Riesgo · Impacto).
 *  - Columna activa con bg-accent-soft completo (no solo texto).
 *  - Pills Alto/Medio/Bajo con escala visual de 3 tonos para que la
 *    lectura sea inmediata.
 *  - Textarea aparece sólo tras elegir filtro (disclosure progresivo).
 *
 * Evidencia para el judge: selected_filter. La elección codifica el
 * criterio (no es la más alta numéricamente, sino la más accionable
 * para el contexto del caso).
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

type FilterKey = "tiempo" | "riesgo" | "impacto";
type Severity = "Alto" | "Medio" | "Bajo";

const FILTERS: Array<{
  key: FilterKey;
  label: string;
  desc: string;
  glyph: React.ReactNode;
}> = [
  {
    key: "tiempo",
    label: "Tiempo",
    desc: "Cuánto esfuerzo está consumiendo cada equipo.",
    glyph: (
      <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4.5V8L10.5 9.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    key: "riesgo",
    label: "Riesgo",
    desc: "Probabilidad de que algo se rompa esta semana.",
    glyph: (
      <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden>
        <path
          d="M8 2L14 13H2L8 2Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path d="M8 6V9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
        <circle cx="8" cy="11" r="0.7" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: "impacto",
    label: "Impacto",
    desc: "Cuánto mueve la aguja del negocio si se ejecuta bien.",
    glyph: (
      <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden>
        <path
          d="M3 13L7 9L9.5 11.5L13 6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path d="M10 6H13V9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    ),
  },
];

const ROWS: ReadonlyArray<{
  team: string;
  tiempo: Severity;
  riesgo: Severity;
  impacto: Severity;
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

  const filter = payload.selected_filter as FilterKey | null;

  return (
    <div className="simulador-root space-y-5">
      {/* Filtros con icono + descripción inline */}
      <div className="grid gap-2 sm:grid-cols-3">
        {FILTERS.map((f) => {
          const isActive = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => update({ ...payload, selected_filter: f.key })}
              className={`flex flex-col gap-1.5 rounded-[var(--radius-lg)] border p-3 text-left transition-colors ${
                isActive
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
              }`}
            >
              <span
                className={`flex items-center gap-2 ts-callout font-semibold ${
                  isActive ? "text-[var(--accent)]" : "text-[var(--text-primary)]"
                }`}
              >
                {f.glyph}
                {f.label}
              </span>
              <span className="ts-footnote text-[var(--text-tertiary)]">
                {f.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tabla pivote con header explícito + columna activa resaltada */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full ts-subhead">
          <thead>
            <tr className="bg-[var(--surface-2)]">
              <th className="px-4 py-2.5 text-left ts-caption-1 font-medium text-[var(--text-tertiary)]">
                Equipo
              </th>
              {FILTERS.map((f) => {
                const isActive = filter === f.key;
                return (
                  <th
                    key={f.key}
                    className={`px-4 py-2.5 text-center ts-caption-1 font-medium ${
                      isActive
                        ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "text-[var(--text-tertiary)]"
                    }`}
                  >
                    {f.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, idx) => {
              const isLast = idx === ROWS.length - 1;
              return (
                <tr
                  key={row.team}
                  className={!isLast ? "border-b border-[var(--hairline)]" : ""}
                >
                  <td className="px-4 py-3 ts-body font-medium text-[var(--text-primary)]">
                    {row.team}
                  </td>
                  {FILTERS.map((f) => {
                    const value = row[f.key];
                    const isActive = filter === f.key;
                    return (
                      <td
                        key={f.key}
                        className={`px-4 py-3 text-center ${
                          isActive ? "bg-[var(--accent-soft)]" : ""
                        }`}
                      >
                        <SeverityPill value={value} muted={!isActive} />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}

/** Pill de severidad · 3 tonos de la escala accent para lectura inmediata. */
function SeverityPill({
  value,
  muted,
}: {
  value: Severity;
  muted?: boolean;
}) {
  const intensity =
    value === "Alto" ? "strong" : value === "Medio" ? "medium" : "soft";

  // Cuando muted (no es la columna activa) usamos escala neutral.
  // En la columna activa, accent con intensidad por severidad.
  const cls = muted
    ? "border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-tertiary)]"
    : intensity === "strong"
      ? "bg-[var(--accent)] text-white"
      : intensity === "medium"
        ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]"
        : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]";

  return (
    <span
      className={`inline-flex min-w-14 items-center justify-center rounded-full px-2.5 py-0.5 ts-caption-1 font-medium ${cls}`}
    >
      {value}
    </span>
  );
}

export function dashboardPivotCompletion(payload: DashboardPivotPayload) {
  return {
    complete: payload.selected_filter !== null,
    missing: payload.selected_filter === null ? ["selected_filter"] : [],
  };
}

export function emptyDashboardPivotPayload(): DashboardPivotPayload {
  return emptyPayload("dashboard_pivot") as DashboardPivotPayload;
}
