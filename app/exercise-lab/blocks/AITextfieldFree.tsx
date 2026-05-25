"use client";

/**
 * AITextfieldFree — renderer del bloque canónico `ai_textfield_free` (lab_ref 01A).
 * Patrón: textfield libre con selector de modelo. Cumple no-prefill: prompt
 * arranca vacío, el placeholder solo guía.
 */

import { useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";

type AITextfieldFreePayload = Extract<
  ExerciseResponsePayload,
  { block_id: "ai_textfield_free" }
>;

const DEFAULT_MODELS = [
  { id: "gpt-corporativo", label: "GPT Corporativo (IT)" },
  { id: "claude-sonnet-4.6", label: "Claude Sonnet 4.6" },
  { id: "chatgpt-5.5", label: "ChatGPT 5.5" },
  { id: "gemini-3-pro", label: "Gemini 3 Pro" },
];

interface Props extends ExerciseRendererProps<AITextfieldFreePayload> {
  models?: ReadonlyArray<{ id: string; label: string }>;
  placeholder?: string;
  sessionId?: string | null;
}

export function AITextfieldFree({
  payload,
  onChange,
  onPatch,
  slideId = "ai_textfield_free",
  mode = "lab_demo",
  sessionId = null,
  models = DEFAULT_MODELS,
  placeholder = "Escribe tu pedido a la IA. Sin atajos: arma la instrucción desde cero.",
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());
  const firstActionAt = useRef<number | null>(null);
  const totalChanges = useRef(0);

  function update(next: AITextfieldFreePayload) {
    if (firstActionAt.current === null) firstActionAt.current = Date.now();
    totalChanges.current += 1;
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:ai_textfield_free:${slideId}`, next, {
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
      <div className="ts-callout font-semibold text-[var(--text-primary)]">
        Pídele a la IA lo que necesitas
      </div>
      <p className="mt-1 ts-footnote text-[var(--text-tertiary)]">
        Sin guía. Tu prompt construye el contexto, las restricciones y el formato esperado.
      </p>

      <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <textarea
          value={payload.prompt_text}
          onChange={(e) => update({ ...payload, prompt_text: e.target.value })}
          placeholder={placeholder}
          className="min-h-[180px] w-full resize-none rounded-[var(--radius-md)] bg-transparent ts-body text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
        />
        <div className="mt-3 flex items-center justify-between border-t border-[var(--hairline)] pt-3">
          <span className="ts-caption-1 text-[var(--text-tertiary)]">
            {payload.prompt_text.length} caracteres ·{" "}
            {payload.attachments.length} adjuntos
          </span>
          <select
            value={payload.model}
            onChange={(e) => update({ ...payload, model: e.target.value })}
            className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 ts-caption-1 text-[var(--text-primary)] focus:border-[var(--accent)]"
          >
            <option value="">Elegir modelo…</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export function aiTextfieldFreeCompletion(payload: AITextfieldFreePayload) {
  const missing: string[] = [];
  if (payload.prompt_text.trim().length < 20) missing.push("prompt_text");
  if (payload.model.trim().length === 0) missing.push("model");
  return { complete: missing.length === 0, missing };
}

export function emptyAITextfieldFreePayload(): AITextfieldFreePayload {
  return emptyPayload("ai_textfield_free") as AITextfieldFreePayload;
}
