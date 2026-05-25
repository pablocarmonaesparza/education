"use client";

/**
 * PermissionMatrix — renderer del bloque canónico `permission_matrix` (lab_ref 03).
 *
 * Patrón: matriz acciones × {permitir, revisar, bloquear}. Cumple
 * ExerciseRendererProps<P>, no-prefill, autosave via useStepPatch.
 *
 * Visual restaurado desde el monolito ExerciseLabClient.tsx (Codex): tarjetas
 * por acción con grid sm:[1fr_330px] + 3 ChoiceButton por permiso. Sin cambios
 * estéticos respecto al original (Codex hand-crafted).
 */

import { useEffect, useRef } from "react";
import type {
  Permission,
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";
import { Label, ChoiceButton } from "../_shared/ui-primitives";

type PermissionMatrixPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "permission_matrix" }
>;

// Las filas del monolito eran strings ("Leer CRM", "Crear borrador"...) que
// se usaban como key directo. Mapeamos al contrato del registry (action_id
// estable) preservando el label original.
const DEFAULT_ACTIONS: ReadonlyArray<{ id: string; label: string }> = [
  { id: "read_crm", label: "Leer CRM" },
  { id: "create_draft", label: "Crear borrador" },
  { id: "send_client", label: "Enviar a cliente" },
  { id: "update_pipeline", label: "Actualizar pipeline" },
  { id: "use_raw", label: "Usar conversaciones crudas" },
];

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
        final_payload_bytes: JSON.stringify(next).length,
      });
    }
    onPatch?.(next);
  }

  return (
    <div className="simulador-root">
      <Label>Define permisos por acción</Label>
      <div className="mt-4 grid gap-3">
        {actions.map((action) => {
          const cell = payload.cells.find((c) => c.action_id === action.id);
          return (
            <div
              key={action.id}
              className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:grid-cols-[1fr_330px] sm:items-center"
            >
              <div className="text-[15px] font-medium text-[var(--text-primary)]">
                {action.label}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {PERMISSIONS.map((option) => (
                  <ChoiceButton
                    key={option}
                    selected={cell?.permission === option}
                    onClick={() => set(action.id, option)}
                  >
                    {PERMISSION_LABELS[option]}
                  </ChoiceButton>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function permissionMatrixCompletion(payload: PermissionMatrixPayload) {
  if (payload.cells.length === 0) {
    return { complete: false, missing: ["cells"] };
  }
  const missing = payload.cells
    .filter((c) => c.permission === null)
    .map((c) => c.action_id);
  return { complete: missing.length === 0, missing };
}

export function emptyPermissionMatrixPayload(): PermissionMatrixPayload {
  return emptyPayload("permission_matrix") as PermissionMatrixPayload;
}
