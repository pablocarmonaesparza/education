"use client";

/**
 * CategorizeRows · renderer del bloque canónico `categorize_rows` (lab_ref 05).
 *
 * Template genérico de clasificación · v0.10.0 reemplaza a
 * data_table_triage, permission_matrix y event_flag_review.
 *
 * Una tabla por item con chips inline de acción. El caso productivo
 * configura el set de acciones + el color (actionStyle):
 *  - neutral · accent al seleccionar (clasificación general)
 *  - permission · verde/accent/rojo según valor (permitir/revisar/bloquear)
 *  - severity · rojo/accent/verde según valor (riesgo/escalar/normal)
 *
 * Sin hint interno · el shell ya tiene eyebrow + title + body.
 */

import { useEffect, useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";

type CategorizeRowsPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "categorize_rows" }
>;

export type ActionStyle = "neutral" | "permission" | "severity";

export interface CategorizeRowSpec {
  id: string;
  label: string;
  example?: string;
  hint?: string;
}

export interface CategorizeActionOption {
  value: string;
  label: string;
}

const DEFAULT_ROWS: CategorizeRowSpec[] = [
  { id: "contact", label: "Nombre del contacto", example: "Mariana Robles", hint: "Información personal directa." },
  { id: "company", label: "Empresa", example: "Aurora Retail", hint: "Contexto de cuenta." },
  { id: "email", label: "Correo", example: "mariana@aurora.example", hint: "Dato personal y canal sensible." },
  { id: "tickets", label: "Tickets recientes", example: "12 conversaciones", hint: "Posible información personal embebida." },
];

const DEFAULT_ACTIONS: CategorizeActionOption[] = [
  { value: "usar", label: "Usar" },
  { value: "anonimizar", label: "Anonimizar" },
  { value: "agregar", label: "Agregar" },
  { value: "excluir", label: "Excluir" },
];

interface Props extends ExerciseRendererProps<CategorizeRowsPayload> {
  rows?: CategorizeRowSpec[];
  actions?: CategorizeActionOption[];
  actionStyle?: ActionStyle;
  sessionId?: string | null;
}

export function CategorizeRows({
  payload,
  onChange,
  onPatch,
  slideId = "categorize_rows",
  mode = "lab_demo",
  sessionId = null,
  caseContext,
  rows: rowsProp,
  actions: actionsProp,
  actionStyle: styleProp,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());
  const firstActionAt = useRef<number | null>(null);
  const totalChanges = useRef(0);

  const rows =
    rowsProp ?? (caseContext?.rows as CategorizeRowSpec[] | undefined) ?? DEFAULT_ROWS;
  const actions =
    actionsProp ??
    (caseContext?.actions as CategorizeActionOption[] | undefined) ??
    DEFAULT_ACTIONS;
  const actionStyle: ActionStyle =
    styleProp ??
    (caseContext?.actionStyle as ActionStyle | undefined) ??
    "neutral";

  useEffect(() => {
    if (payload.row_actions.length === 0 && rows.length > 0) {
      onChange({
        ...payload,
        row_actions: rows.map((r) => ({ row_id: r.id, action: null })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(rowId: string, action: string) {
    if (firstActionAt.current === null) firstActionAt.current = Date.now();
    totalChanges.current += 1;
    const next: CategorizeRowsPayload = {
      ...payload,
      row_actions: payload.row_actions.map((r) =>
        r.row_id === rowId ? { ...r, action } : r,
      ),
    };
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:categorize_rows:${slideId}`, next, {
        time_to_first_action_ms:
          (firstActionAt.current ?? Date.now()) - mountedAt.current,
        total_changes: totalChanges.current,
        final_payload_bytes: JSON.stringify(next).length,
      });
    }
    onPatch?.(next);
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
      {rows.map((row, idx) => {
        const isLast = idx === rows.length - 1;
        const rowAction =
          payload.row_actions.find((r) => r.row_id === row.id)?.action ?? null;
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
                const isSelected = rowAction === a.value;
                return (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => update(row.id, a.value)}
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
    if (value === "permitir") return `${base} border-[var(--band-a-text)] bg-[var(--band-a-bg)] text-[var(--band-a-text)]`;
    if (value === "revisar") return `${base} border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]`;
    if (value === "bloquear") return `${base} border-[var(--band-b-text)] bg-[var(--band-b-bg)] text-[var(--band-b-text)]`;
  }
  if (style === "severity") {
    if (value === "riesgo") return `${base} border-[var(--band-b-text)] bg-[var(--band-b-bg)] text-[var(--band-b-text)]`;
    if (value === "escalar") return `${base} border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]`;
    if (value === "normal") return `${base} border-[var(--band-a-text)] bg-[var(--band-a-bg)] text-[var(--band-a-text)]`;
  }
  return `${base} border-[var(--accent)] bg-[var(--accent)] text-white`;
}

export function categorizeRowsCompletion(payload: CategorizeRowsPayload) {
  if (payload.row_actions.length === 0) {
    return { complete: false, missing: ["row_actions"] };
  }
  const missing = payload.row_actions
    .filter((r) => r.action === null)
    .map((r) => r.row_id);
  return { complete: missing.length === 0, missing };
}

export function emptyCategorizeRowsPayload(): CategorizeRowsPayload {
  return emptyPayload("categorize_rows") as CategorizeRowsPayload;
}
