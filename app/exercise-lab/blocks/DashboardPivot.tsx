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

type Severity = "High" | "Medium" | "Low";

interface TeamSignal {
  id: string;
  name: string;
  metrics: Array<{ label: string; value: Severity }>;
}

// Los `id` se persisten en `selected_filter` y los evalúa el judge · no se
// traducen. Sólo `name` y las etiquetas de métrica son capa de display.
const TEAMS: TeamSignal[] = [
  {
    id: "ventas_norte",
    name: "Sales North",
    metrics: [
      { label: "Time", value: "High" },
      { label: "Risk", value: "Medium" },
      { label: "Impact", value: "High" },
    ],
  },
  {
    id: "ventas_sur",
    name: "Sales South",
    metrics: [
      { label: "Time", value: "Medium" },
      { label: "Risk", value: "High" },
      { label: "Impact", value: "Medium" },
    ],
  },
  {
    id: "alianzas",
    name: "Partnerships",
    metrics: [
      { label: "Time", value: "Low" },
      { label: "Risk", value: "Low" },
      { label: "Impact", value: "Medium" },
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
  onShellContinue,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null);
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
    // El bloque NO auto-avanza · ahora pide un takeaway escrito antes
    // de continuar · cumple "evidencia narrativa" (P1.2).
  }

  return (
    <div className="space-y-5">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
            className={`flex h-full flex-col gap-3 rounded-[var(--radius-lg)] border p-4 text-left transition-colors ${
              isSelected
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
            }`}
          >
            <span
              className={`ts-callout font-bold ${
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

    {/* Takeaway · aparece cuando se eligió un segmento · campo declarado
        en EXERCISE_BLOCK_CATALOG.yaml como emit, ahora implementado (P1.2). */}
    {payload.selected_filter && (
      <div>
        <textarea
          id={`${slideId}-takeaway`}
          aria-label="What would you take to your manager?"
          value={payload.leader_takeaway}
          onChange={(e) => {
            const next: DashboardPivotPayload = {
              ...payload,
              leader_takeaway: e.target.value,
            };
            onChange(next);
            onPatch?.(next);
          }}
          placeholder="In one or two lines, which signal from this segment you would take to the meeting."
          rows={2}
          className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 ts-body text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]"
        />
      </div>
    )}
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
    value === "High" ? "strong" : value === "Medium" ? "medium" : "soft";

  const cls = muted
    ? "border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-tertiary)]"
    : intensity === "strong"
      ? "accent-bg text-white"
      : intensity === "medium"
        ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]"
        : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]";

  return (
    <span
      className={`inline-flex min-w-12 items-center justify-center rounded-full px-2.5 py-0.5 ts-caption-1 font-bold ${cls}`}
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
