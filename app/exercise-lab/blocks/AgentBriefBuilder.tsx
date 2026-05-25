"use client";

/**
 * AgentBriefBuilder · renderer del bloque canónico `agent_brief_builder` (lab_ref 10).
 *
 * Stepper interno con 4 chips (Tarea / Acceso / Acción / Stop), una
 * subsección visible a la vez con slide transition (mismo patrón que
 * ai_textfield_guided). Auto-advance al elegir opción.
 *
 * Sin hint interno · el shell tiene eyebrow + title + body.
 */

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

const SUBSECTIONS: Array<{ key: Field; label: string }> = [
  { key: "task", label: "Tarea" },
  { key: "access", label: "Acceso" },
  { key: "action", label: "Acción" },
  { key: "stop", label: "Paro" },
];

const AGENT_BRIEF_OPTIONS: Record<Field, string[]> = {
  task: [
    "Ordenar insumos y detectar lo importante",
    "Preparar un borrador para revisión",
    "Comparar opciones y mostrar costos y beneficios",
    "Actualizar un registro con aprobación",
  ],
  access: [
    "Sólo documentos aprobados del caso",
    "Datos agregados sin nombres ni correos",
    "Notas internas marcadas como compartibles",
    "Salida de otro sistema ya revisada",
  ],
  action: [
    "Sugerir, no ejecutar",
    "Crear borrador interno",
    "Clasificar y priorizar",
    "Preparar cambio para aprobación",
  ],
  stop: [
    "Aparece dato sensible",
    "Falta una fuente verificable",
    "Hay impacto externo",
    "La instrucción contradice una política",
  ],
};

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

  const [activeSubsection, setActiveSubsection] = useState<Field>("task");
  const activeIndex = SUBSECTIONS.findIndex((s) => s.key === activeSubsection);

  function isDone(field: Field): boolean {
    return Boolean(payload[field]);
  }

  function isReachable(field: Field): boolean {
    const idx = SUBSECTIONS.findIndex((s) => s.key === field);
    if (idx === 0) return true;
    const previous = SUBSECTIONS[idx - 1].key;
    return isDone(previous);
  }

  function persist(next: AgentBriefPayload) {
    if (firstActionAt.current === null) firstActionAt.current = Date.now();
    totalChanges.current += 1;
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

  function selectOption(value: string) {
    persist({ ...payload, [activeSubsection]: value });
    // Auto-advance al siguiente · si ya es el último, queda en su lugar.
    const nextIdx = activeIndex + 1;
    if (nextIdx < SUBSECTIONS.length) {
      setActiveSubsection(SUBSECTIONS[nextIdx].key);
    }
  }

  return (
    <div className="space-y-6">
      {/* Stepper de 4 chips */}
      <div className="flex items-center gap-2">
        {SUBSECTIONS.map((sub) => {
          const isActive = activeSubsection === sub.key;
          const done = isDone(sub.key);
          const reachable = isReachable(sub.key);
          return (
            <button
              key={sub.key}
              type="button"
              disabled={!reachable}
              onClick={() => {
                if (reachable) setActiveSubsection(sub.key);
              }}
              className={`flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-1.5 ts-caption-1 font-medium transition-colors ${
                isActive
                  ? "bg-[var(--accent)] text-white"
                  : done
                    ? "border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent-soft)]/80"
                    : reachable
                      ? "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]"
                      : "bg-[var(--surface-2)] text-[var(--text-tertiary)] cursor-not-allowed"
              }`}
            >
              {done && !isActive && (
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path
                    d="M2.5 6L5 8.5L9.5 3.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
              )}
              {sub.label}
            </button>
          );
        })}
      </div>

      {/* Subsección activa · slide horizontal · altura estable */}
      <div className="relative min-h-[260px] overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeSubsection}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="grid gap-2">
              {AGENT_BRIEF_OPTIONS[activeSubsection].map((option) => (
                <GuidedOption
                  key={option}
                  selected={payload[activeSubsection] === option}
                  onClick={() => selectOption(option)}
                >
                  {option}
                </GuidedOption>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
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
