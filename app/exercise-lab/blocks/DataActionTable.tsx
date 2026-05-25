"use client";

/**
 * DataActionTable · bloque canónico `data_action_table` (lab_ref 02).
 *
 * Consolida data_table_triage + permission_matrix + run_log_review (v0.5.0).
 * Una sola tabla con acción discreta por fila; el `action_kind` discrimina
 * qué set de acciones se muestra y qué dimensiones de la rúbrica aplica
 * el judge.
 *
 * Variantes (caseContext.action_kind, default "data"):
 *   - data: usar / anonimizar / agregar / excluir
 *           mide minimización + privacidad + calidad de datos
 *   - permission: permitir / revisar / bloquear
 *                 mide ponderación de autonomía vs riesgo
 *   - flag: marcar_riesgo / marcar_normal
 *           mide validación + caza de errores
 *
 * En el lab tiene un segmented control interno para previsualizar las 3
 * variantes con seed data distinta por variante. En casos productivos
 * el case-template fija `action_kind` y `rows` via caseContext.
 *
 * Evidencia para el judge: action_kind + row_actions completos + métricas
 * (time_to_first_action, total_changes, payload_bytes). El judge usa
 * action_kind para elegir la rúbrica correcta.
 */

import { useEffect, useRef, useState } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";

type DataActionTablePayload = Extract<
  ExerciseResponsePayload,
  { block_id: "data_action_table" }
>;

type ActionKind = "data" | "permission" | "flag";

interface RowSpec {
  id: string;
  label: string;
  example?: string;
  hint?: string;
}

interface ActionVariant {
  kind: ActionKind;
  label: string;
  hint: string;
  rows: RowSpec[];
  actions: ReadonlyArray<{ value: string; label: string }>;
  placeholderRow: string;
}

const VARIANT_DATA: ActionVariant = {
  kind: "data",
  label: "Datos",
  hint: "Clasifica cada campo antes de enviarlo al modelo.",
  rows: [
    { id: "contact", label: "Nombre del contacto", example: "Mariana Robles", hint: "PII directa." },
    { id: "company", label: "Empresa", example: "Aurora Retail", hint: "Contexto de cuenta." },
    { id: "email", label: "Correo", example: "mariana@aurora.example", hint: "PII + canal sensible." },
    { id: "tickets", label: "Tickets recientes", example: "12 conversaciones", hint: "PII embebida posible." },
  ],
  actions: [
    { value: "usar", label: "Usar" },
    { value: "anonimizar", label: "Anonimizar" },
    { value: "agregar", label: "Agregar" },
    { value: "excluir", label: "Excluir" },
  ],
  placeholderRow: "Elegir acción…",
};

const VARIANT_PERMISSION: ActionVariant = {
  kind: "permission",
  label: "Permisos",
  hint: "Define qué puede hacer la automatización sola, qué necesita revisión y qué debe bloquearse.",
  rows: [
    { id: "read_crm", label: "Leer CRM", hint: "Acceso a información del cliente." },
    { id: "draft_response", label: "Crear borrador de respuesta", hint: "Generación de texto." },
    { id: "send_to_customer", label: "Enviar a cliente", hint: "Acción externa con efecto irreversible." },
    { id: "update_pipeline", label: "Actualizar pipeline", hint: "Modifica datos internos del CRM." },
    { id: "raw_conversations", label: "Usar conversaciones crudas", hint: "Datos con PII embebida." },
  ],
  actions: [
    { value: "permitir", label: "Permitir" },
    { value: "revisar", label: "Revisar" },
    { value: "bloquear", label: "Bloquear" },
  ],
  placeholderRow: "Elegir permiso…",
};

const VARIANT_FLAG: ActionVariant = {
  kind: "flag",
  label: "Eventos",
  hint: "Marca cuáles eventos del log requieren atención y cuáles son normales.",
  rows: [
    { id: "evt1", label: "09:42 · Login OK", example: "user@aurora.example", hint: "Evento de rutina." },
    { id: "evt2", label: "09:45 · Retry loop x12 al endpoint /sync", example: "duración 4.2s", hint: "Comportamiento anómalo." },
    { id: "evt3", label: "09:47 · PII exportada a logs", example: "email + teléfono", hint: "Riesgo de filtración." },
    { id: "evt4", label: "09:50 · Acción ejecutada sin métrica", example: "send_email", hint: "Falta validación previa." },
    { id: "evt5", label: "09:53 · Health check OK", example: "200 OK", hint: "Evento de rutina." },
  ],
  actions: [
    { value: "marcar_riesgo", label: "Marcar riesgo" },
    { value: "marcar_normal", label: "Marcar normal" },
  ],
  placeholderRow: "Marcar evento…",
};

const VARIANTS: Record<ActionKind, ActionVariant> = {
  data: VARIANT_DATA,
  permission: VARIANT_PERMISSION,
  flag: VARIANT_FLAG,
};

interface Props extends ExerciseRendererProps<DataActionTablePayload> {
  sessionId?: string | null;
  /** Override de filas desde caseContext en casos productivos. */
  rows?: RowSpec[];
}

export function DataActionTable({
  payload,
  onChange,
  onPatch,
  slideId = "data_action_table",
  mode = "lab_demo",
  sessionId = null,
  caseContext,
  rows: rowsProp,
}: Props) {
  // En el lab, segmented control para previsualizar variantes. En producción
  // viene fijo en caseContext.action_kind.
  const labOverride =
    caseContext === undefined && mode === "lab_demo"
      ? (payload.action_kind as ActionKind)
      : undefined;
  const fromContext = caseContext?.action_kind as ActionKind | undefined;
  const activeKind: ActionKind =
    fromContext ?? labOverride ?? payload.action_kind ?? "data";

  const variant = VARIANTS[activeKind];
  const rows = rowsProp ?? (caseContext?.rows as RowSpec[] | undefined) ?? variant.rows;

  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());
  const firstActionAt = useRef<number | null>(null);
  const totalChanges = useRef(0);

  // Inicializa row_actions vacíos al cambiar de variante.
  useEffect(() => {
    if (
      payload.row_actions.length === 0 ||
      payload.action_kind !== activeKind
    ) {
      onChange({
        ...payload,
        action_kind: activeKind,
        row_actions: rows.map((r) => ({ row_id: r.id, action: null })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKind, rows.length]);

  function update(rowId: string, action: string) {
    if (firstActionAt.current === null) firstActionAt.current = Date.now();
    totalChanges.current += 1;
    const next: DataActionTablePayload = {
      ...payload,
      action_kind: activeKind,
      row_actions: payload.row_actions.map((r) =>
        r.row_id === rowId ? { ...r, action } : r,
      ),
    };
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:data_action_table:${slideId}`, next, {
        time_to_first_action_ms:
          (firstActionAt.current ?? Date.now()) - mountedAt.current,
        total_changes: totalChanges.current,
        final_payload_bytes: JSON.stringify(next).length,
        action_kind: activeKind,
      });
    }
    onPatch?.(next);
  }

  return (
    <div className="space-y-4">
      {/* Segmented control · solo en lab para preview de variantes */}
      {mode === "lab_demo" && fromContext === undefined && (
        <LabVariantToggle
          active={activeKind}
          onChange={(kind) =>
            onChange({
              ...payload,
              action_kind: kind,
              row_actions: VARIANTS[kind].rows.map((r) => ({
                row_id: r.id,
                action: null,
              })),
            })
          }
        />
      )}

      <div className="ts-callout font-semibold text-[var(--text-primary)]">
        {variant.hint}
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
        {rows.map((row, idx) => {
          const rowState = payload.row_actions.find(
            (r) => r.row_id === row.id,
          );
          const action = rowState?.action ?? null;
          const isLast = idx === rows.length - 1;
          return (
            <div
              key={row.id}
              className={`grid gap-3 px-4 py-4 sm:grid-cols-[1fr_1fr_180px] sm:items-center ${
                !isLast ? "border-b border-[var(--hairline)]" : ""
              }`}
            >
              <div>
                <div className="ts-body font-medium text-[var(--text-primary)]">
                  {row.label}
                </div>
                {row.example && (
                  <div className="mt-1 ts-subhead text-[var(--text-secondary)]">
                    {row.example}
                  </div>
                )}
              </div>
              <div className="ts-subhead text-[var(--text-secondary)]">
                {row.hint ?? "Decide la acción correspondiente."}
              </div>
              <div className="relative">
                <select
                  value={action ?? ""}
                  onChange={(e) => update(row.id, e.target.value)}
                  className={`min-h-11 w-full appearance-none rounded-[var(--radius-md)] border bg-[var(--surface-2)] py-2 pl-3 pr-10 ts-callout outline-none focus:border-[var(--accent)] ${
                    action === null
                      ? "border-[var(--border)] text-[var(--text-tertiary)]"
                      : "border-[var(--border)] text-[var(--text-primary)]"
                  }`}
                  aria-label={`Acción para ${row.label}`}
                >
                  <option value="" disabled>
                    {variant.placeholderRow}
                  </option>
                  {variant.actions.map((a) => (
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
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Segmented control · solo en lab para previsualizar las 3 variantes
 * (data, permission, flag). En casos productivos no se renderea.
 */
function LabVariantToggle({
  active,
  onChange,
}: {
  active: ActionKind;
  onChange: (kind: ActionKind) => void;
}) {
  const kinds: Array<{ kind: ActionKind; label: string }> = [
    { kind: "data", label: "Datos" },
    { kind: "permission", label: "Permisos" },
    { kind: "flag", label: "Eventos" },
  ];
  return (
    <div className="inline-flex rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] p-1">
      {kinds.map(({ kind, label }) => {
        const isActive = active === kind;
        return (
          <button
            key={kind}
            type="button"
            onClick={() => onChange(kind)}
            className={`rounded-[var(--radius-sm)] px-3 py-1.5 ts-caption-1 font-medium transition-colors ${
              isActive
                ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Completion predicate · todas las filas deben tener acción asignada.
 */
export function dataActionTableCompletion(payload: DataActionTablePayload) {
  if (payload.row_actions.length === 0) {
    return { complete: false, missing: ["row_actions"] };
  }
  const missing = payload.row_actions
    .filter((r) => r.action === null)
    .map((r) => r.row_id);
  return { complete: missing.length === 0, missing };
}

export function emptyDataActionTablePayload(): DataActionTablePayload {
  return emptyPayload("data_action_table") as DataActionTablePayload;
}
