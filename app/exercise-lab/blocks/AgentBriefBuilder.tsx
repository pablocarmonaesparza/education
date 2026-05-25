"use client";

/**
 * AgentBriefBuilder · renderer del bloque canónico `agent_brief_builder` (lab_ref 07).
 *
 * Vertical stack · las 4 preguntas (Tarea / Acceso / Acción / Stop)
 * visibles a la vez en cards apiladas. Sin stepper · sin sub-secciones
 * que generen "más por venir" · sin panel lateral de preview.
 *
 * Cada card es una pregunta cerrada con 4 opciones discretas
 * (GuidedOption). El participante puede llenar en cualquier orden.
 *
 * Sin hint interno · el shell ya tiene eyebrow + title + body.
 */

import { useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";
import { GuidedOption } from "../_shared/ui-primitives";

type AgentBriefPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "agent_brief_builder" }
>;

type Field = "task" | "access" | "action" | "stop";

const AGENT_BRIEF_GROUPS: Array<{
  field: Field;
  label: string;
  options: string[];
}> = [
  {
    field: "task",
    label: "Tarea",
    options: [
      "Ordenar insumos y detectar lo importante",
      "Preparar un borrador para revisión",
      "Comparar opciones y mostrar costos y beneficios",
      "Actualizar un registro con aprobación",
    ],
  },
  {
    field: "access",
    label: "Acceso",
    options: [
      "Sólo documentos aprobados del caso",
      "Datos agregados sin nombres ni correos",
      "Notas internas marcadas como compartibles",
      "Salida de otro sistema ya revisada",
    ],
  },
  {
    field: "action",
    label: "Acción máxima",
    options: [
      "Sugerir, no ejecutar",
      "Crear borrador interno",
      "Clasificar y priorizar",
      "Preparar cambio para aprobación",
    ],
  },
  {
    field: "stop",
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
  const firstActionAt = useRef<number | null>(null);
  const totalChanges = useRef(0);

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
    <div className="space-y-6">
      {AGENT_BRIEF_GROUPS.map((group) => (
        <section key={group.field}>
          <div className="ts-callout font-semibold text-[var(--text-primary)]">
            {group.label}
          </div>
          <div className="mt-3 grid gap-2">
            {group.options.map((option) => (
              <GuidedOption
                key={option}
                selected={payload[group.field] === option}
                onClick={() => updateField(group.field, option)}
              >
                {option}
              </GuidedOption>
            ))}
          </div>
        </section>
      ))}
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
