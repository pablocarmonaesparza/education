"use client";

/**
 * PermissionMatrix — renderer del bloque canónico `permission_matrix` (lab_ref 03).
 *
 * Patrón: matriz acciones × {permitir, revisar, bloquear}. Cumple
 * ExerciseRendererProps<P>, no-prefill, autosave via useStepPatch.
 */

import { useEffect, useRef } from "react";
import type {
  Permission,
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";

type PermissionMatrixPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "permission_matrix" }
>;

const DEFAULT_ACTIONS = [
  { id: "read_crm", label: "Leer CRM" },
  { id: "create_draft", label: "Crear borrador" },
  { id: "send_client", label: "Enviar a cliente" },
  { id: "update_pipeline", label: "Actualizar pipeline" },
  { id: "use_raw", label: "Usar conversaciones crudas" },
] as const;

const PERMISSION_LABELS: Record<Permission, string> = {
  permitir: "Permitir",
  revisar: "Revisar",
  bloquear: "Bloquear",
};

const PERMISSIONS: Permission[] = ["permitir", "revisar", "bloquear"];

interface Props extends ExerciseRendererProps<PermissionMatrixPayload> {
  actions?: ReadonlyArray<{ id: string; label: string }>;
  sessionId?: string | null;
}

export function PermissionMatrix({
  payload,
  onChange,
  onPatch,
  slideId = "permission_matrix",
  mode = "lab_demo",
  sessionId = null,
  actions = DEFAULT_ACTIONS,
}: Props) {
  useEffect(() => {
    if (payload.cells.length === 0 && actions.length > 0) {
      onChange({
        ...payload,
        cells: actions.map((a) => ({ action_id: a.id, permission: null })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });

  const mountedAt = useRef(Date.now());
  const firstActionAt = useRef<number | null>(null);
  const totalChanges = useRef(0);

  function set(actionId: string, p: Permission) {
    if (firstActionAt.current === null) firstActionAt.current = Date.now();
    totalChanges.current += 1;
    const next: PermissionMatrixPayload = {
      ...payload,
      cells: payload.cells.map((c) =>
        c.action_id === actionId ? { ...c, permission: p } : c,
      ),
    };
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:permission_matrix:${slideId}`, next, {
        time_to_first_action_ms:
          (firstActionAt.current ?? Date.now()) - mountedAt.current,
        total_changes: totalChanges.current,
      });
    }
    onPatch?.(next);
  }

  return (
    <div className="simulador-root">
      <div className="ts-callout font-semibold text-[var(--text-primary)]">
        Define permisos por acción
      </div>
      <p className="mt-1 ts-footnote text-[var(--text-tertiary)]">
        El agente puede leer, escribir, enviar. Decide qué permitir, qué revisar y qué bloquear.
      </p>

      <div className="mt-4 grid gap-3">
        {actions.map((action) => {
          const cell = payload.cells.find((c) => c.action_id === action.id);
          return (
            <div
              key={action.id}
              className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:grid-cols-[1fr_330px] sm:items-center"
            >
              <div className="ts-body font-medium text-[var(--text-primary)]">{action.label}</div>
              <div className="grid grid-cols-3 gap-2">
                {PERMISSIONS.map((p) => {
                  const selected = cell?.permission === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => set(action.id, p)}
                      className={`min-h-11 rounded-[var(--radius-md)] border ts-callout font-medium transition-colors ${
                        selected
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]"
                      }`}
                    >
                      {PERMISSION_LABELS[p]}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function permissionMatrixCompletion(payload: PermissionMatrixPayload) {
  const missing = payload.cells
    .filter((c) => c.permission === null)
    .map((c) => c.action_id);
  return { complete: missing.length === 0, missing };
}

export function emptyPermissionMatrixPayload(): PermissionMatrixPayload {
  return emptyPayload("permission_matrix") as PermissionMatrixPayload;
}
