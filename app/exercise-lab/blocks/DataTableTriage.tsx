"use client";

/**
 * DataTableTriage — renderer del bloque canónico `data_table_triage`.
 *
 * Lab ref: 02. Source: docs/simulador/case_factory/EXERCISE_BLOCK_CATALOG.yaml
 *
 * Implementa el contrato de `lib/simulador/exercise-registry.ts`:
 *   - Recibe payload + onChange (controlled component).
 *   - Si recibe sessionId + mode, integra autosave con useStepPatch
 *     (debounce 800ms, persiste en /api/sessions/.../responses o
 *     /api/field-test/sessions/.../responses según mode).
 *   - Emite telemetry: time_to_first_action_ms + total_changes.
 *   - No-prefill enforcement: arranca con action=null por fila.
 *
 * UI pattern (del YAML): "tabla por campo con dropdown de accion y
 * chevron con padding suficiente."
 *
 * Días 3+4 del plan combinados — extracción + integración E2E.
 */

import { useEffect, useMemo, useRef } from "react";
import type {
  DataTableAction,
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";
// Seed inline para el lab. Casos productivos pasan sus propias filas via prop.
export interface DataTableFieldSpec {
  id: string;
  field: string;
  example: string;
  hint?: string;
}

const labDataTableFields: DataTableFieldSpec[] = [
  { id: "contact", field: "Nombre del contacto", example: "Mariana Robles", hint: "PII directa." },
  { id: "company", field: "Empresa", example: "Aurora Retail", hint: "Contexto de cuenta." },
  { id: "email", field: "Correo", example: "mariana@aurora.example", hint: "PII + canal sensible." },
  { id: "tickets", field: "Tickets recientes", example: "12 conversaciones", hint: "PII embebida posible." },
];

type DataTableTriagePayload = Extract<
  ExerciseResponsePayload,
  { block_id: "data_table_triage" }
>;

interface DataTableTriageProps extends ExerciseRendererProps<DataTableTriagePayload> {
  /** Filas a triagear. Si no se pasa, usa el seed del lab interno.
   *  Casos productivos pasan sus propias filas desde el case_template. */
  fields?: DataTableFieldSpec[];
  /** Si está disponible, dispara autosave a la BD. */
  sessionId?: string | null;
}

const ACTION_LABELS: Record<DataTableAction, string> = {
  usar: "Usar",
  anonimizar: "Anonimizar",
  agregar: "Agregar",
  excluir: "Excluir",
};

const ACTIONS: DataTableAction[] = ["usar", "anonimizar", "agregar", "excluir"];

export function DataTableTriage({
  payload,
  onChange,
  onPatch,
  slideId = "data_table_triage",
  mode = "lab_demo",
  sessionId = null,
  fields = labDataTableFields,
}: DataTableTriageProps) {
  // Inicializa field_actions[] vacío si está fresco — no-prefill.
  // Si payload.field_actions ya tiene entries (regresar a la pregunta),
  // las respeta sin sobreescribir.
  useEffect(() => {
    if (payload.field_actions.length === 0 && fields.length > 0) {
      onChange({
        ...payload,
        field_actions: fields.map((f) => ({ field_id: f.id, action: null })),
      });
    }
    // No re-dispara si fields cambia: el caso decide su seed inicial 1 vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave con useStepPatch — solo si sessionId + mode productivo.
  const isProduction = mode === "authenticated" || mode === "field_test";
  const patchMode = mode === "field_test" ? "field_test" : "authenticated";
  const { patch } = useStepPatch(
    isProduction ? sessionId : null,
    { mode: patchMode },
  );

  // Telemetry refs
  const mountedAt = useRef<number>(Date.now());
  const firstActionAt = useRef<number | null>(null);
  const totalChanges = useRef<number>(0);

  function updateAction(fieldId: string, action: DataTableAction) {
    if (firstActionAt.current === null) {
      firstActionAt.current = Date.now();
    }
    totalChanges.current += 1;

    const next: DataTableTriagePayload = {
      ...payload,
      field_actions: payload.field_actions.map((row) =>
        row.field_id === fieldId ? { ...row, action } : row,
      ),
    };

    onChange(next);

    // Si tenemos sessionId + autosave habilitado, persistir.
    if (isProduction && sessionId) {
      const metrics = {
        time_to_first_action_ms:
          (firstActionAt.current ?? Date.now()) - mountedAt.current,
        total_changes: totalChanges.current,
        final_payload_bytes: JSON.stringify(next).length,
      };
      patch(`block:data_table_triage:${slideId}`, next, metrics);
    }

    // Override hook si el caller quiere su propio flush
    if (onPatch) {
      const metrics = {
        time_to_first_action_ms:
          (firstActionAt.current ?? Date.now()) - mountedAt.current,
        total_changes: totalChanges.current,
        final_payload_bytes: JSON.stringify(next).length,
      };
      onPatch(next, metrics);
    }
  }

  const fieldsByid = useMemo(
    () => Object.fromEntries(fields.map((f) => [f.id, f])),
    [fields],
  );

  return (
    <div className="simulador-root">
      <div className="ts-callout font-semibold text-[var(--text-primary)]">
        Clasifica cada campo antes de enviarlo al modelo
      </div>
      <p className="mt-1 ts-footnote text-[var(--text-tertiary)]">
        Decide qué entra al contexto de IA. Cada decisión queda registrada.
      </p>

      <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
        {payload.field_actions.map((row, idx) => {
          const spec = fieldsByid[row.field_id];
          if (!spec) return null;
          return (
            <div
              key={row.field_id}
              className={`grid gap-3 px-4 py-4 sm:grid-cols-[1fr_1fr_170px] sm:items-center ${
                idx < payload.field_actions.length - 1
                  ? "border-b border-[var(--hairline)]"
                  : ""
              }`}
            >
              <div>
                <div className="ts-body font-medium text-[var(--text-primary)]">
                  {spec.field}
                </div>
                <div className="mt-1 ts-subhead text-[var(--text-secondary)]">
                  {spec.example}
                </div>
              </div>
              <div className="ts-subhead text-[var(--text-secondary)]">
                {spec.hint ?? "Decide si aporta señal o si expone información de más."}
              </div>
              <div className="relative">
                <select
                  value={row.action ?? ""}
                  onChange={(e) =>
                    updateAction(row.field_id, e.target.value as DataTableAction)
                  }
                  className={`min-h-11 w-full appearance-none rounded-[var(--radius-md)] border bg-[var(--surface-2)] py-2 pl-3 pr-10 ts-callout outline-none focus:border-[var(--accent)] ${
                    row.action === null
                      ? "border-[var(--border)] text-[var(--text-tertiary)]"
                      : "border-[var(--border)] text-[var(--text-primary)]"
                  }`}
                  aria-label={`Acción para ${spec.field}`}
                >
                  <option value="" disabled>
                    Elegir acción…
                  </option>
                  {ACTIONS.map((action) => (
                    <option key={action} value={action}>
                      {ACTION_LABELS[action]}
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
 * Completion predicate canónico — exportado para que el registry lo use.
 * Bloque está completo si TODAS las filas tienen acción asignada.
 */
export function dataTableTriageCompletion(payload: DataTableTriagePayload) {
  if (payload.field_actions.length === 0) {
    return { complete: false, missing: ["field_actions"] };
  }
  const missing = payload.field_actions
    .filter((row) => row.action === null)
    .map((row) => row.field_id);
  return { complete: missing.length === 0, missing };
}

/** Factory de payload vacío conforme al contrato del registry. */
export function emptyDataTableTriagePayload(): DataTableTriagePayload {
  return emptyPayload("data_table_triage") as DataTableTriagePayload;
}
