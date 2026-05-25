"use client";

/**
 * PermissionMatrix · bloque canónico `permission_matrix` (lab_ref 03).
 *
 * Tabla por acción con dropdown permitir/revisar/bloquear. Mide cómo
 * el participante pondera autonomía vs riesgo. Sin hints internos · el
 * shell ya comunica el qué.
 */

import { useEffect, useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
  Permission,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";
import { ActionTable } from "./DataTableTriage";

type PermissionMatrixPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "permission_matrix" }
>;

interface ActionSpec {
  id: string;
  label: string;
  hint?: string;
}

const DEFAULT_ACTIONS: ActionSpec[] = [
  { id: "read_crm", label: "Leer el sistema de clientes", hint: "Acceso a información del cliente." },
  { id: "draft_response", label: "Crear borrador de respuesta", hint: "Generación de texto." },
  { id: "send_to_customer", label: "Enviar a cliente", hint: "Acción externa con efecto irreversible." },
  { id: "update_pipeline", label: "Actualizar pipeline", hint: "Modifica datos internos del sistema." },
  { id: "raw_conversations", label: "Usar conversaciones crudas", hint: "Información personal embebida." },
];

const PERMISSION_LABELS: Record<Permission, string> = {
  permitir: "Permitir",
  revisar: "Revisar",
  bloquear: "Bloquear",
};

const PERMISSIONS: Permission[] = ["permitir", "revisar", "bloquear"];

interface Props extends ExerciseRendererProps<PermissionMatrixPayload> {
  actions?: ActionSpec[];
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
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());
  const firstActionAt = useRef<number | null>(null);
  const totalChanges = useRef(0);

  useEffect(() => {
    if (payload.cells.length === 0 && actions.length > 0) {
      onChange({
        ...payload,
        cells: actions.map((a) => ({ action_id: a.id, permission: null })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(actionId: string, permission: Permission) {
    if (firstActionAt.current === null) firstActionAt.current = Date.now();
    totalChanges.current += 1;
    const next: PermissionMatrixPayload = {
      ...payload,
      cells: payload.cells.map((c) =>
        c.action_id === actionId ? { ...c, permission } : c,
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
    <ActionTable
      rows={actions.map((a) => ({
        id: a.id,
        label: a.label,
        hint: a.hint,
        action: payload.cells.find((c) => c.action_id === a.id)?.permission ?? null,
      }))}
      actions={PERMISSIONS.map((p) => ({ value: p, label: PERMISSION_LABELS[p] }))}
      onSelect={(rowId, value) => update(rowId, value as Permission)}
      actionStyle="permission"
    />
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
