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

  return (
    <div className="simulador-root">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-stretch">
        <div className="flex min-h-[400px] flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
                Construye el brief
              </div>
              <p className="mt-2 max-w-xl text-[15px] leading-6 text-[var(--text-secondary)]">
                Define una sola pieza a la vez. El caso controla la situación; el participante sólo decide cómo delegar sin abrir riesgos.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[12px] text-[var(--text-secondary)]">
              {completed}/4
            </span>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-2">
            {FIELDS.map((field, index) => (
              <button
                key={field}
                type="button"
                onClick={() => setActiveField(field)}
                className={`min-h-10 rounded-xl border px-2 text-[12px] font-medium transition-colors ${
                  activeField === field
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : payload[field]
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
                      : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)]"
                }`}
              >
                {index + 1}. {AGENT_BRIEF_OPTIONS[field].label}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-3xl bg-[var(--surface-2)] p-4">
            <div className="text-[15px] font-semibold text-[var(--text-primary)]">
              {activeGroup.label}
            </div>
            <div className="mt-3 grid gap-2">
              {activeGroup.options.map((option) => (
                <GuidedOption
                  key={option}
                  selected={payload[activeField] === option}
                  onClick={() => {
                    updateField(activeField, option);
                    const nextField = FIELDS[Math.min(FIELDS.length - 1, activeIndex + 1)];
                    if (nextField !== activeField) setActiveField(nextField);
                  }}
                >
                  {option}
                </GuidedOption>
              ))}
            </div>
          </div>
        </div>

        <div className="flex min-h-[400px] flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            Brief del agente
          </div>
          <div className="mt-4 grid gap-2">
            <AgentBriefLine label="Tarea" value={payload.task} />
            <AgentBriefLine label="Acceso permitido" value={payload.access} />
            <AgentBriefLine label="Puede hacer" value={payload.action} />
            <AgentBriefLine label="Debe detenerse si" value={payload.stop} />
          </div>
        </div>
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
