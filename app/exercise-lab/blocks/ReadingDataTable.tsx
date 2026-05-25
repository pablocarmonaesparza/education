"use client";

/**
 * ReadingDataTable · bloque pasivo `reading_data_table` (lab_ref 00C).
 *
 * Tabla informativa: muestra datos del caso (leads, tickets, transacciones,
 * métricas) en formato tabular antes de pedir decisión. Solo lectura.
 * Contenido real via `caseContext.table`; seed por default para el lab.
 */

import { useEffect, useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";

type ReadingDataTablePayload = Extract<
  ExerciseResponsePayload,
  { block_id: "reading_data_table" }
>;

interface TableContent {
  caption?: string;
  columns: Array<{ key: string; label: string; align?: "left" | "right" | "center" }>;
  rows: Array<Record<string, string | number>>;
}

const DEFAULT_TABLE: TableContent = {
  caption: "Tickets pendientes asignados a tu cola",
  columns: [
    { key: "id", label: "Ticket", align: "left" },
    { key: "cliente", label: "Cliente", align: "left" },
    { key: "sla", label: "SLA restante", align: "right" },
    { key: "prioridad", label: "Prioridad", align: "left" },
    { key: "mrr", label: "MRR cuenta", align: "right" },
  ],
  rows: [
    { id: "T-1042", cliente: "Aurora Retail", sla: "2h 14m", prioridad: "Alta", mrr: "$8,400" },
    { id: "T-1041", cliente: "Bosa Industrial", sla: "5h 02m", prioridad: "Media", mrr: "$2,100" },
    { id: "T-1039", cliente: "Cresta Software", sla: "1h 38m", prioridad: "Crítica", mrr: "$14,200" },
    { id: "T-1037", cliente: "Delta Logistics", sla: "7h 50m", prioridad: "Baja", mrr: "$950" },
    { id: "T-1035", cliente: "Eclipse Health", sla: "3h 12m", prioridad: "Alta", mrr: "$5,600" },
  ],
};

interface Props extends ExerciseRendererProps<ReadingDataTablePayload> {
  sessionId?: string | null;
}

export function ReadingDataTable({
  payload,
  onChange,
  onPatch,
  slideId = "reading_data_table",
  mode = "lab_demo",
  sessionId = null,
  caseContext,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());

  const table = (caseContext?.table as TableContent | undefined) ?? DEFAULT_TABLE;

  useEffect(() => {
    if (!payload.acknowledged) {
      const next: ReadingDataTablePayload = { ...payload, acknowledged: true };
      onChange(next);
      if (isProduction && sessionId) {
        patch(`block:reading_data_table:${slideId}`, next, {
          time_to_read_ms: Date.now() - mountedAt.current,
        });
      }
      onPatch?.(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
      {table.caption && (
        <div className="border-b border-[var(--hairline)] px-4 py-3 ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          {table.caption}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full ts-subhead">
          <thead>
            <tr className="bg-[var(--surface-2)]">
              {table.columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-2.5 ts-caption-1 font-medium text-[var(--text-tertiary)] ${alignClass(col.align)}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, idx) => (
              <tr
                key={idx}
                className={idx < table.rows.length - 1 ? "border-b border-[var(--hairline)]" : ""}
              >
                {table.columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-[var(--text-primary)] ${alignClass(col.align)} ${col.align === "right" ? "tabular-nums" : ""}`}
                  >
                    {row[col.key] ?? "·"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function alignClass(align?: "left" | "right" | "center"): string {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

export function readingDataTableCompletion(_payload: ReadingDataTablePayload) {
  return { complete: true, missing: [] as string[] };
}

export function emptyReadingDataTablePayload(): ReadingDataTablePayload {
  return emptyPayload("reading_data_table") as ReadingDataTablePayload;
}
