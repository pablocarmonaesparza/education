"use client";

/**
 * AgentBriefBuilder · renderer del bloque canónico `agent_brief_builder` (lab_ref 07).
 *
 * Patrón rico (monolito Codex): layout 2 columnas
 *   ┌──────────────────────────────┬──────────────────────┐
 *   │ Chips de progreso (4)        │ Brief del agente     │
 *   │ Picker GuidedOption del      │ AgentBriefLine x 4   │
 *   │ field activo + auto-advance  │  (Tarea, Acceso,     │
 *   │                              │   Acción, Stop)      │
 *   └──────────────────────────────┴──────────────────────┘
 *
 * El usuario selecciona una opción → auto-advance al siguiente field. Chip
 * resalta cuando el field tiene valor (accent-soft) o cuando es el activo
 * (accent).
 *
 * Visual restaurado desde el monolito ExerciseLabClient.tsx (Codex). Sin
 * cambios estéticos respecto al original.
 */

import { useRef, useState } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";
import { GuidedOption, AgentBriefLine } from "../_shared/ui-primitives";

type AgentBriefPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "agent_brief_builder" }
>;

type Field = "task" | "access" | "action" | "stop";

const AGENT_BRIEF_OPTIONS: Record<Field, { label: string; options: string[] }> = {
  task: {
    label: "Tarea",
    options: [
      "Ordenar insumos y detectar lo importante",
      "Preparar un borrador para revisión",
      "Comparar opciones y mostrar costos y beneficios",
      "Actualizar un registro con aprobación",
    ],
  },
  access: {
    label: "Acceso",
    options: [
      "Sólo documentos aprobados del caso",
      "Datos agregados sin nombres ni correos",
      "Notas internas marcadas como compartibles",
      "Salida de otro sistema ya revisada",
    ],
  },
  action: {
    label: "Acción máxima",
    options: [
      "Sugerir, no ejecutar",
      "Crear borrador interno",
      "Clasificar y priorizar",
      "Preparar cambio para aprobación",
    ],
  },
  stop: {
    label: "Condición de paro",
    options: [
      "Aparece dato sensible",
      "Falta una fuente verificable",
      "Hay impacto externo",
      "La instrucción contradice una política",
    ],
  },
};

const FIELDS: Field[] = ["task", "access", "action", "stop"];

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
  const firstActionAt = useRef<number | null>(null);
  const totalChanges = useRef(0);

  const [activeField, setActiveField] = useState<Field>("task");
  const activeIndex = FIELDS.indexOf(activeField);
  const activeGroup = AGENT_BRIEF_OPTIONS[activeField];
  const completed = FIELDS.filter((field) => payload[field]).length;

  function updateField(field: Field, value: string) {
    if (firstActionAt.current === null) firstActionAt.current = Date.now();
    totalChanges.current += 1;
    const next: AgentBriefPayload = { ...payload, [field]: value };
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:agent_brief_builder:${slideId}`, next, {
        time_to_first_action_ms:
          (firstActionAt.current ?? Date.now()) - mountedAt.current,
        total_changes: totalChanges.current,
        final_payload_bytes: JSON.stringify(next).length,
      });
    }
    onPatch?.(next);
  }

  // Layout aligerado (Typeform-style):
  //  - Stepper minimal: 4 dots numerados con label horizontal compacto
  //  - Una pregunta a la vez en el centro, opciones GuidedOption
  //  - Auto-advance al elegir
  //  - Recap abajo en 4 líneas compactas (replaza el panel lateral cargado)
  return (
    <div className="simulador-root space-y-6">
      {/* Stepper minimal · 4 dots con label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-x-auto">
          {FIELDS.map((field, index) => {
            const isActive = activeField === field;
            const isDone = Boolean(payload[field]);
            return (
              <button
                key={field}
                type="button"
                onClick={() => setActiveField(field)}
                className={`flex items-center gap-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-[var(--text-primary)] font-medium"
                    : isDone
                      ? "text-[var(--text-secondary)]"
                      : "text-[var(--text-tertiary)]"
                }`}
              >
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full ts-caption-2 font-semibold tabular-nums transition-colors ${
                    isActive
                      ? "bg-[var(--accent)] text-white"
                      : isDone
                        ? "bg-[var(--surface-3)] text-[var(--text-secondary)]"
                        : "border border-[var(--border)] text-[var(--text-tertiary)]"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="ts-subhead">{AGENT_BRIEF_OPTIONS[field].label}</span>
              </button>
            );
          })}
        </div>
        <span className="ts-caption-1 tabular-nums text-[var(--text-tertiary)]">
          {completed}/4
        </span>
      </div>

      {/* Pregunta activa · una a la vez */}
      <div>
        <div className="ts-callout font-semibold text-[var(--text-primary)]">
          {activeGroup.label}
        </div>
        <div className="mt-4 grid gap-2">
          {activeGroup.options.map((option) => (
            <GuidedOption
              key={option}
              selected={payload[activeField] === option}
              onClick={() => {
                updateField(activeField, option);
                const nextField =
                  FIELDS[Math.min(FIELDS.length - 1, activeIndex + 1)];
                if (nextField !== activeField) setActiveField(nextField);
              }}
            >
              {option}
            </GuidedOption>
          ))}
        </div>
      </div>

      {/* Recap compacto · solo se muestra cuando hay al menos 1 elegido */}
      {completed > 0 && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-1.5">
          {payload.task && <AgentBriefLine label="Tarea" value={payload.task} />}
          {payload.access && (
            <AgentBriefLine label="Acceso permitido" value={payload.access} />
          )}
          {payload.action && (
            <AgentBriefLine label="Puede hacer" value={payload.action} />
          )}
          {payload.stop && (
            <AgentBriefLine label="Debe detenerse si" value={payload.stop} />
          )}
        </div>
      )}
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
