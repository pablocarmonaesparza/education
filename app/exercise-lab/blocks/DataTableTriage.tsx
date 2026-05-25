"use client";

/**
 * DataTableTriage · bloque canónico `data_table_triage` (lab_ref 02).
 *
 * Tabla por campo con dropdown usar/anonimizar/agregar/excluir.
 * Mide minimización + privacidad + calidad de datos.
 *
 * Sin hint interno · el shell del ExerciseSection ya tiene eyebrow +
 * title + body (regla universal del producto).
 */

import { useEffect, useRef } from "react";
import type {
  DataTableAction,
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";

type DataTableTriagePayload = Extract<
  ExerciseResponsePayload,
  { block_id: "data_table_triage" }
>;

interface FieldSpec {
  id: string;
  field: string;
  example: string;
  hint?: string;
}

const DEFAULT_FIELDS: FieldSpec[] = [
  { id: "contact", field: "Nombre del contacto", example: "Mariana Robles", hint: "Información personal directa." },
  { id: "company", field: "Empresa", example: "Aurora Retail", hint: "Contexto de cuenta." },
  { id: "email", field: "Correo", example: "mariana@aurora.example", hint: "Dato personal y canal sensible." },
  { id: "tickets", field: "Tickets recientes", example: "12 conversaciones", hint: "Posible información personal embebida." },
];

const ACTION_LABELS: Record<DataTableAction, string> = {
  usar: "Usar",
  anonimizar: "Anonimizar",
  agregar: "Agregar",
  excluir: "Excluir",
};

const ACTIONS: DataTableAction[] = ["usar", "anonimizar", "agregar", "excluir"];

interface Props extends ExerciseRendererProps<DataTableTriagePayload> {
  fields?: FieldSpec[];
  sessionId?: string | null;
}

export function DataTableTriage({
  payload,
  onChange,
  onPatch,
  slideId = "data_table_triage",
  mode = "lab_demo",
  sessionId = null,
  fields = DEFAULT_FIELDS,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());
  const firstActionAt = useRef<number | null>(null);
  const totalChanges = useRef(0);

  useEffect(() => {
    if (payload.field_actions.length === 0 && fields.length > 0) {
      onChange({
        ...payload,
        field_actions: fields.map((f) => ({ field_id: f.id, action: null })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(fieldId: string, action: DataTableAction) {
    if (firstActionAt.current === null) firstActionAt.current = Date.now();
    totalChanges.current += 1;
    const next: DataTableTriagePayload = {
      ...payload,
      field_actions: payload.field_actions.map((r) =>
        r.field_id === fieldId ? { ...r, action } : r,
      ),
    };
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:data_table_triage:${slideId}`, next, {
        time_to_first_action_ms:
          (firstActionAt.current ?? Date.now()) - mountedAt.current,
        total_changes: totalChanges.current,
        final_payload_bytes: JSON.stringify(next).length,
      });
    }
    onPatch?.(next);
  }

  return (
    <ActionTable
      rows={fields.map((f) => ({
        id: f.id,
        label: f.field,
        example: f.example,
        hint: f.hint,
        action: payload.field_actions.find((r) => r.field_id === f.id)?.action ?? null,
      }))}
      actions={ACTIONS.map((a) => ({ value: a, label: ACTION_LABELS[a] }))}
      placeholder="Elegir acción…"
      onSelect={(rowId, value) => update(rowId, value as DataTableAction)}
    />
  );
}

/**
 * Primitive interno · tabla con dropdown por fila. Reutilizado por los 3
 * bloques de la familia data-action (data_table_triage, permission_matrix,
 * event_flag_review).
 */
export function ActionTable({
  rows,
  actions,
  placeholder,
  onSelect,
}: {
  rows: Array<{ id: string; label: string; example?: string; hint?: string; action: string | null }>;
  actions: Array<{ value: string; label: string }>;
  placeholder: string;
  onSelect: (rowId: string, value: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
      {rows.map((row, idx) => {
        const isLast = idx === rows.length - 1;
        return (
          <div
            key={row.id}
            className={`grid gap-3 px-4 py-4 sm:grid-cols-[1fr_1fr_180px] sm:items-center ${
              !isLast ? "border-b border-[var(--hairline)]" : ""
            }`}
          >
            <div>
              <div className="ts-body font-medium text-[var(--text-primary)]">{row.label}</div>
              {row.example && (
                <div className="mt-1 ts-subhead text-[var(--text-secondary)]">{row.example}</div>
              )}
            </div>
            <div className="ts-subhead text-[var(--text-secondary)]">
              {row.hint ?? ""}
            </div>
            <div className="relative">
              <select
                value={row.action ?? ""}
                onChange={(e) => onSelect(row.id, e.target.value)}
                className={`min-h-11 w-full appearance-none rounded-[var(--radius-md)] border bg-[var(--surface-2)] py-2 pl-3 pr-10 ts-callout outline-none focus:border-[var(--accent)] ${
                  row.action === null
                    ? "border-[var(--border)] text-[var(--text-tertiary)]"
                    : "border-[var(--border)] text-[var(--text-primary)]"
                }`}
                aria-label={row.label}
              >
                <option value="" disabled>{placeholder}</option>
                {actions.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-tertiary)]"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden
              >
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function dataTableTriageCompletion(payload: DataTableTriagePayload) {
  if (payload.field_actions.length === 0) {
    return { complete: false, missing: ["field_actions"] };
  }
  const missing = payload.field_actions
    .filter((r) => r.action === null)
    .map((r) => r.field_id);
  return { complete: missing.length === 0, missing };
}

export function emptyDataTableTriagePayload(): DataTableTriagePayload {
  return emptyPayload("data_table_triage") as DataTableTriagePayload;
}
