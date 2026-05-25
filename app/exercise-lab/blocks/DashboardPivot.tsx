"use client";

/**
 * DashboardPivot · renderer del bloque canónico `dashboard_pivot` (lab_ref 11).
 *
 * Rediseño per Pablo "parece más una tabla que algo accionable":
 *  - Eliminada la tabla pivote pasiva.
 *  - Reemplazada por 3 cards de equipo clickeables, cada una con sus
 *    3 mini-stats visibles (tiempo · riesgo · impacto).
 *  - La elección de un equipo = "qué señal llevarías al manager".
 *
 * Cambio del contrato: `selected_filter` ahora representa el id del
 * equipo elegido (no la dimensión). El judge evalúa si el equipo
 * elegido es el más accionable para el caso (no el de números más altos
 * o más rojos, sino el de mejor relación señal vs ruido).
 *
 * Sin hint interno · el shell tiene eyebrow + title + body.
 */

import { useRef } from "react";
import { motion } from "framer-motion";
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

type Severity = "Alto" | "Medio" | "Bajo";

interface TeamSignal {
  id: string;
  name: string;
  metrics: Array<{ label: string; value: Severity }>;
}

const TEAMS: TeamSignal[] = [
  {
    id: "ventas_norte",
    name: "Ventas Norte",
    metrics: [
      { label: "Tiempo", value: "Alto" },
      { label: "Riesgo", value: "Medio" },
      { label: "Impacto", value: "Alto" },
    ],
  },
  {
    id: "ventas_sur",
    name: "Ventas Sur",
    metrics: [
      { label: "Tiempo", value: "Medio" },
      { label: "Riesgo", value: "Alto" },
      { label: "Impacto", value: "Medio" },
    ],
  },
  {
    id: "alianzas",
    name: "Alianzas",
    metrics: [
      { label: "Tiempo", value: "Bajo" },
      { label: "Riesgo", value: "Bajo" },
      { label: "Impacto", value: "Medio" },
    ],
  },
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

  function update(teamId: string) {
    if (firstActionAt.current === null) firstActionAt.current = Date.now();
    totalChanges.current += 1;
    const next: DashboardPivotPayload = { ...payload, selected_filter: teamId };
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

  return (
    <div className="flex flex-col gap-3">
      {TEAMS.map((team, idx) => {
        const isSelected = payload.selected_filter === team.id;
        return (
          <motion.button
            key={team.id}
            type="button"
            onClick={() => update(team.id)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.28,
              delay: idx * 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileTap={{ scale: 0.99 }}
            className={`flex flex-col gap-3 rounded-[var(--radius-lg)] border p-4 text-left transition-colors ${
              isSelected
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
            }`}
          >
            <span
              className={`ts-callout font-semibold ${
                isSelected
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-primary)]"
              }`}
            >
              {team.name}
            </span>
            <div className="flex flex-col gap-1.5">
              {team.metrics.map((m) => (
                <div
                  key={m.label}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="ts-subhead text-[var(--text-secondary)]">
                    {m.label}
                  </span>
                  <SeverityPill value={m.value} muted={!isSelected} />
                </div>
              ))}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

/** Pill de severidad · escala accent para card seleccionada, neutral si no. */
function SeverityPill({
  value,
  muted,
}: {
  value: Severity;
  muted?: boolean;
}) {
  const intensity =
    value === "Alto" ? "strong" : value === "Medio" ? "medium" : "soft";

  const cls = muted
    ? "border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-tertiary)]"
    : intensity === "strong"
      ? "bg-[var(--accent)] text-white"
      : intensity === "medium"
        ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]"
        : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]";

  return (
    <span
      className={`inline-flex min-w-12 items-center justify-center rounded-full px-2.5 py-0.5 ts-caption-1 font-medium ${cls}`}
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
