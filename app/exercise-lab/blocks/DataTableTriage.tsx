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
      onSelect={(rowId, value) => update(rowId, value as DataTableAction)}
      actionStyle="neutral"
    />
  );
}

/**
 * Primitive interno · tabla con chips inline por fila (acciones discretas
 * visibles, sin dropdown). Reutilizado por data_table_triage,
 * permission_matrix y event_flag_review.
 *
 * actionStyle define el color de los chips seleccionados para diferenciar
 * visualmente cada bloque:
 *  - neutral · accent (data_table_triage)
 *  - permission · verde/ámbar/rojo según value (permission_matrix)
 *  - severity · matiz de gravedad (event_flag_review)
 */
export type ActionStyle = "neutral" | "permission" | "severity";

interface ActionOption {
  value: string;
  label: string;
}

interface ActionTableRow {
  id: string;
  label: string;
  example?: string;
  hint?: string;
  action: string | null;
}

export function ActionTable({
  rows,
  actions,
  onSelect,
  actionStyle = "neutral",
}: {
  rows: ActionTableRow[];
  actions: ActionOption[];
  onSelect: (rowId: string, value: string) => void;
  actionStyle?: ActionStyle;
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
      {rows.map((row, idx) => {
        const isLast = idx === rows.length - 1;
        return (
          <div
            key={row.id}
            className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-6 ${
              !isLast ? "border-b border-[var(--hairline)]" : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="ts-body font-medium text-[var(--text-primary)]">
                {row.label}
              </div>
              {row.example && (
                <div className="mt-1 ts-subhead text-[var(--text-secondary)]">
                  {row.example}
                </div>
              )}
              {row.hint && (
                <div className="mt-1 ts-footnote text-[var(--text-tertiary)]">
                  {row.hint}
                </div>
              )}
            </div>
            <div
              className="flex flex-wrap gap-1.5"
              role="group"
              aria-label={`Acción para ${row.label}`}
            >
              {actions.map((a) => {
                const isSelected = row.action === a.value;
                return (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => onSelect(row.id, a.value)}
                    aria-pressed={isSelected}
                    className={chipClass(isSelected, a.value, actionStyle)}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function chipClass(
  isSelected: boolean,
  value: string,
  style: ActionStyle,
): string {
  const base =
    "min-h-9 rounded-[var(--radius-md)] border px-3 py-1.5 ts-caption-1 font-medium transition-colors";
  if (!isSelected) {
    return `${base} border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]`;
  }
  if (style === "permission") {
    if (value === "permitir") {
      return `${base} border-[var(--band-a-text)] bg-[var(--band-a-bg)] text-[var(--band-a-text)]`;
    }
    if (value === "revisar") {
      return `${base} border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]`;
    }
    if (value === "bloquear") {
      return `${base} border-[var(--band-b-text)] bg-[var(--band-b-bg)] text-[var(--band-b-text)]`;
    }
  }
  if (style === "severity") {
    if (value === "riesgo") {
      return `${base} border-[var(--band-b-text)] bg-[var(--band-b-bg)] text-[var(--band-b-text)]`;
    }
    if (value === "escalar") {
      return `${base} border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]`;
    }
    if (value === "normal") {
      return `${base} border-[var(--band-a-text)] bg-[var(--band-a-bg)] text-[var(--band-a-text)]`;
    }
  }
  // neutral (default)
  return `${base} border-[var(--accent)] bg-[var(--accent)] text-white`;
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
