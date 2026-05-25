"use client";

/**
 * AITextfieldGuided — renderer del bloque canónico `ai_textfield_guided` (lab_ref 01B).
 *
 * El más complejo de los 11: 4 decisiones discretas (objetivo, audiencia,
 * límites, modelo) + 3 sliders de prioridad (autonomía, seguridad, costo).
 * El prompt se genera read-only desde las selecciones del usuario.
 *
 * Refactor del monolito GuidedPromptExercise (240 líneas, 18 props del root)
 * a useState local. State per-bloque, no propagado al padre.
 */

import { useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";

type AITextfieldGuidedPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "ai_textfield_guided" }
>;

const DEFAULT_OBJECTIVES = [
  "Reactivar cuentas con bajo uso",
  "Proponer tres ángulos de campaña",
  "Resumir feedback para Ventas",
];

const DEFAULT_AUDIENCES = [
  "VP de Marketing",
  "Equipo de Ventas Enterprise",
  "Cliente interno de Operaciones",
];

const DEFAULT_LIMITS = [
  "No usar nombres ni correos",
  "Marcar afirmaciones sin fuente",
  "Dejarlo como borrador interno",
  "Explicar supuestos y dudas",
];

const DEFAULT_MODELS = [
  { id: "gpt-corporativo", label: "GPT Corporativo" },
  { id: "claude-sonnet-4.6", label: "Claude Sonnet 4.6" },
  { id: "chatgpt-5.5", label: "ChatGPT 5.5" },
];

interface Props extends ExerciseRendererProps<AITextfieldGuidedPayload> {
  objectives?: ReadonlyArray<string>;
  audiences?: ReadonlyArray<string>;
  limits?: ReadonlyArray<string>;
  models?: ReadonlyArray<{ id: string; label: string }>;
  sessionId?: string | null;
}

export function AITextfieldGuided({
  payload,
  onChange,
  onPatch,
  slideId = "ai_textfield_guided",
  mode = "lab_demo",
  sessionId = null,
  objectives = DEFAULT_OBJECTIVES,
  audiences = DEFAULT_AUDIENCES,
  limits = DEFAULT_LIMITS,
  models = DEFAULT_MODELS,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());
  const totalChanges = useRef(0);

  // Codex review P1 #2: generated_prompt incluye TODAS las decisiones del
  // bloque (no solo objetivo/audiencia/límites). Se recomputa en cada
  // update — sin useEffect que pueda dejar stale el autosave.
  function buildGeneratedPrompt(p: AITextfieldGuidedPayload): string {
    const parts: string[] = [];
    if (p.selected_objective) parts.push(`Objetivo: ${p.selected_objective}.`);
    if (p.selected_audience) parts.push(`Audiencia: ${p.selected_audience}.`);
    if (p.selected_limits.length > 0)
      parts.push(`Límites: ${p.selected_limits.join("; ")}.`);
    if (p.selected_model) parts.push(`Modelo: ${p.selected_model}.`);
    const priorities: string[] = [];
    if (p.autonomy_priority !== null)
      priorities.push(`autonomía=${p.autonomy_priority}`);
    if (p.security_priority !== null)
      priorities.push(`seguridad=${p.security_priority}`);
    if (p.cost_priority !== null) priorities.push(`costo=${p.cost_priority}`);
    if (priorities.length > 0)
      parts.push(`Prioridades: ${priorities.join(", ")}.`);
    return parts.join(" ");
  }

  function update(next: AITextfieldGuidedPayload) {
    totalChanges.current += 1;
    const nextWithPrompt: AITextfieldGuidedPayload = {
      ...next,
      generated_prompt: buildGeneratedPrompt(next),
    };
    onChange(nextWithPrompt);
    if (isProduction && sessionId) {
      patch(`block:ai_textfield_guided:${slideId}`, nextWithPrompt, {
        time_to_first_action_ms: Date.now() - mountedAt.current,
        total_changes: totalChanges.current,
      });
    }
    onPatch?.(nextWithPrompt);
  }

  function toggleLimit(limit: string) {
    const next = payload.selected_limits.includes(limit)
      ? payload.selected_limits.filter((l) => l !== limit)
      : [...payload.selected_limits, limit];
    update({ ...payload, selected_limits: next });
  }

  return (
    <div className="simulador-root">
      <div className="ts-callout font-semibold text-[var(--text-primary)]">
        Construye el prompt por piezas
      </div>
      <p className="mt-1 ts-footnote text-[var(--text-tertiary)]">
        4 decisiones discretas + prioridades. El prompt se arma read-only desde tus selecciones.
      </p>

      {/* Objetivo */}
      <Section title="Objetivo">
        {objectives.map((opt) => (
          <Pill
            key={opt}
            selected={payload.selected_objective === opt}
            onClick={() => update({ ...payload, selected_objective: opt })}
          >
            {opt}
          </Pill>
        ))}
      </Section>

      {/* Audiencia */}
      <Section title="Audiencia">
        {audiences.map((opt) => (
          <Pill
            key={opt}
            selected={payload.selected_audience === opt}
            onClick={() => update({ ...payload, selected_audience: opt })}
          >
            {opt}
          </Pill>
        ))}
      </Section>

      {/* Límites (multi) */}
      <Section title="Límites del caso (puedes elegir varios)">
        {limits.map((opt) => (
          <Pill
            key={opt}
            selected={payload.selected_limits.includes(opt)}
            onClick={() => toggleLimit(opt)}
          >
            {opt}
          </Pill>
        ))}
      </Section>

      {/* Modelo */}
      <Section title="Modelo recomendado">
        {models.map((m) => (
          <Pill
            key={m.id}
            selected={payload.selected_model === m.id}
            onClick={() => update({ ...payload, selected_model: m.id })}
          >
            {m.label}
          </Pill>
        ))}
      </Section>

      {/* Prioridades */}
      <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          Prioridades — pasos de 10
        </div>
        <div className="mt-3 grid gap-3">
          <PrioritySlider
            label="Autonomía"
            value={payload.autonomy_priority}
            onChange={(v) => update({ ...payload, autonomy_priority: v })}
          />
          <PrioritySlider
            label="Seguridad"
            value={payload.security_priority}
            onChange={(v) => update({ ...payload, security_priority: v })}
          />
          <PrioritySlider
            label="Costo"
            value={payload.cost_priority}
            onChange={(v) => update({ ...payload, cost_priority: v })}
          />
        </div>
      </div>

      {/* Prompt generado (read-only) */}
      <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--accent)] bg-[var(--accent-soft)] p-4">
        <div className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--accent)]">
          Prompt generado
        </div>
        <p className="mt-2 ts-body leading-[1.55] text-[var(--text-primary)]">
          {payload.generated_prompt || (
            <span className="text-[var(--text-tertiary)]">
              Elige objetivo, audiencia y límites para construir el prompt.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <div className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
        {title}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Pill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-9 rounded-[var(--radius-md)] border px-3 ts-caption-1 font-medium transition-colors ${
        selected
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
      }`}
    >
      {children}
    </button>
  );
}

function PrioritySlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  // null = no movido todavía. El slider visualmente apunta a 50 pero el
  // payload guarda null hasta que el usuario lo toque (no-prefill).
  const displayValue = value ?? 50;
  return (
    <label className="grid grid-cols-[100px_1fr_50px] items-center gap-3">
      <span className="ts-subhead text-[var(--text-secondary)]">{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        step={10}
        value={displayValue}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`h-1.5 cursor-pointer appearance-none rounded-full ${
          value === null ? "bg-[var(--surface-3)]" : "bg-[var(--surface-2)]"
        }`}
      />
      <span
        className={`text-right ts-caption-1 font-medium tabular-nums ${
          value === null
            ? "text-[var(--text-tertiary)]"
            : "text-[var(--text-primary)]"
        }`}
      >
        {value === null ? "—" : value}
      </span>
    </label>
  );
}

export function aiTextfieldGuidedCompletion(
  payload: AITextfieldGuidedPayload,
) {
  const missing: string[] = [];
  if (!payload.selected_objective) missing.push("selected_objective");
  if (!payload.selected_audience) missing.push("selected_audience");
  if (payload.selected_limits.length === 0) missing.push("selected_limits");
  if (!payload.selected_model) missing.push("selected_model");
  // Sliders: nullable significa "no movido"; cuenta como missing.
  if (payload.autonomy_priority === null) missing.push("autonomy_priority");
  if (payload.security_priority === null) missing.push("security_priority");
  if (payload.cost_priority === null) missing.push("cost_priority");
  return { complete: missing.length === 0, missing };
}

export function emptyAITextfieldGuidedPayload(): AITextfieldGuidedPayload {
  return emptyPayload("ai_textfield_guided") as AITextfieldGuidedPayload;
}
