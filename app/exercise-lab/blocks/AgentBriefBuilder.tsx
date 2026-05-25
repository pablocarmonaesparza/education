"use client";

/**
 * AgentBriefBuilder — renderer del bloque canónico `agent_brief_builder` (lab_ref 07).
 * Patrón: 4 campos (task, access, action, stop) cada uno con opciones predefinidas.
 */

import { useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";

type AgentBriefPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "agent_brief_builder" }
>;

type Field = "task" | "access" | "action" | "stop";

const FIELDS: Array<{ id: Field; label: string; options: string[] }> = [
  {
    id: "task",
    label: "Tarea",
    options: [
      "Ordenar insumos y detectar lo importante",
      "Preparar un borrador para revisión",
      "Comparar opciones y mostrar costos y beneficios",
      "Actualizar un registro con aprobación",
    ],
  },
  {
    id: "access",
    label: "Acceso",
    options: [
      "Sólo documentos aprobados del caso",
      "Datos agregados sin nombres ni correos",
      "Notas internas marcadas como compartibles",
      "Salida de otro sistema ya revisada",
    ],
  },
  {
    id: "action",
    label: "Acción máxima",
    options: [
      "Sugerir, no ejecutar",
      "Crear borrador interno",
      "Clasificar y priorizar",
      "Preparar cambio para aprobación",
    ],
  },
  {
    id: "stop",
    label: "Condición de paro",
    options: [
      "Aparece dato sensible",
      "Falta una fuente verificable",
      "Hay impacto externo",
      "La instrucción contradice una política",
    ],
  },
];

interface Props extends ExerciseRendererProps<AgentBriefPayload> {
  sessionId?: string | null;
}

export function AgentBriefBuilder({
  payload,
  onChange,
  onPatch,
  slideId = "agent_brief_builder",
  mode = "lab_demo",
  sessionId = null,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());
  const totalChanges = useRef(0);

  function setField(field: Field, value: string) {
    totalChanges.current += 1;
    const next: AgentBriefPayload = { ...payload, [field]: value };
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:agent_brief_builder:${slideId}`, next, {
        time_to_first_action_ms: Date.now() - mountedAt.current,
        total_changes: totalChanges.current,
      });
    }
    onPatch?.(next);
  }

  return (
    <div className="simulador-root">
      <div className="ts-callout font-semibold text-[var(--text-primary)]">
        Define el brief del agente
      </div>
      <p className="mt-1 ts-footnote text-[var(--text-tertiary)]">
        4 decisiones: qué hace, qué puede tocar, hasta dónde llega, cuándo para.
      </p>

      <div className="mt-4 grid gap-4">
        {FIELDS.map((field) => {
          const value = payload[field.id];
          return (
            <div
              key={field.id}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <div className="flex items-center gap-2">
                <span className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                  {field.label}
                </span>
                {value && (
                  <span className="ts-caption-2 font-medium text-[var(--accent)]">
                    · Definido
                  </span>
                )}
              </div>
              <div className="mt-3 grid gap-2">
                {field.options.map((opt) => {
                  const selected = value === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setField(field.id, opt)}
                      className={`min-h-11 rounded-[var(--radius-md)] border px-3 py-2 text-left ts-subhead transition-colors ${
                        selected
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
                          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
                      }`}
                    >
                      {opt}
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

export function agentBriefCompletion(payload: AgentBriefPayload) {
  const missing: string[] = [];
  if (!payload.task) missing.push("task");
  if (!payload.access) missing.push("access");
  if (!payload.action) missing.push("action");
  if (!payload.stop) missing.push("stop");
  return { complete: missing.length === 0, missing };
}

export function emptyAgentBriefPayload(): AgentBriefPayload {
  return emptyPayload("agent_brief_builder") as AgentBriefPayload;
}
