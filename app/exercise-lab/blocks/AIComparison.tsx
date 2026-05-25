"use client";

/**
 * AIComparison · renderer del bloque canónico `ai_comparison` (lab_ref 05).
 *
 * Patrón: A vs B side-by-side con CompareCard rico (min-h-56 + accent-soft
 * cuando seleccionado). El monolito original solo mostraba A/B; el registry
 * añade fusionar/rechazar + tradeoff_reason (contrato del judge), que viven
 * abajo en un row secundario para no romper la lectura de las cards.
 *
 * Visual restaurado desde el monolito ExerciseLabClient.tsx (Codex):
 * `<CompareCard>` con grid md:grid-cols-2. Sin cambios estéticos respecto al
 * original.
 */

import { useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";
import { Label, CompareCard, ChoiceButton } from "../_shared/ui-primitives";

type AIComparisonPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "ai_comparison" }
>;

const DEFAULT_OPTIONS = {
  A: {
    title: "Respuesta A",
    body: "Lanza la campaña hoy. El cliente necesita ver acción rápida y la IA ya preparó los mensajes.",
  },
  B: {
    title: "Respuesta B",
    body: "Usa el borrador como material interno. Quita datos personales, valida métricas y pide una revisión corta antes de enviar.",
  },
};

const SECONDARY_CHOICES: Array<{ value: "fusionar" | "rechazar"; label: string }> = [
  { value: "fusionar", label: "Fusionar A + B" },
  { value: "rechazar", label: "Rechazar ambas" },
];

interface Props extends ExerciseRendererProps<AIComparisonPayload> {
  options?: { A: { title: string; body: string }; B: { title: string; body: string } };
  sessionId?: string | null;
}

export function AIComparison({
  payload,
  onChange,
  onPatch,
  slideId = "ai_comparison",
  mode = "lab_demo",
  sessionId = null,
  options = DEFAULT_OPTIONS,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());
  const firstActionAt = useRef<number | null>(null);
  const totalChanges = useRef(0);

  function update(next: AIComparisonPayload) {
    if (firstActionAt.current === null) firstActionAt.current = Date.now();
    totalChanges.current += 1;
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:ai_comparison:${slideId}`, next, {
        time_to_first_action_ms:
          (firstActionAt.current ?? Date.now()) - mountedAt.current,
        total_changes: totalChanges.current,
        final_payload_bytes: JSON.stringify(next).length,
      });
    }
    onPatch?.(next);
  }

  // Disclosure progresivo: muestra primero solo las 2 cards. Las opciones
  // secundarias (fusionar/rechazar) y el textarea de razón aparecen sólo
  // después de que el participante elige A o B. Reduce densidad inicial
  // sin perder evidencia para el judge.
  const hasInitialChoice = payload.selected_output !== null;

  return (
    <div className="simulador-root">
      <Label>Elige cuál respuesta llevarías al manager</Label>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <CompareCard
          id="A"
          selected={payload.selected_output === "A"}
          onClick={() => update({ ...payload, selected_output: "A" })}
          title={options.A.title}
          body={options.A.body}
        />
        <CompareCard
          id="B"
          selected={payload.selected_output === "B"}
          onClick={() => update({ ...payload, selected_output: "B" })}
          title={options.B.title}
          body={options.B.body}
        />
      </div>

      {/* Hint disclosure cuando aún no hay elección */}
      {!hasInitialChoice && (
        <p className="mt-3 ts-footnote text-[var(--text-tertiary)]">
          Elige una de las dos respuestas para continuar.
        </p>
      )}

      {/* Capa secundaria: aparece tras elegir A o B */}
      {hasInitialChoice && (
        <div className="mt-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div>
            <span className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              ¿Otra opción?
            </span>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:max-w-md">
              {SECONDARY_CHOICES.map((choice) => (
                <ChoiceButton
                  key={choice.value}
                  selected={payload.selected_output === choice.value}
                  onClick={() =>
                    update({ ...payload, selected_output: choice.value })
                  }
                >
                  {choice.label}
                </ChoiceButton>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="ts-subhead font-medium text-[var(--text-secondary)]">
              ¿Por qué? Una línea sobre el tradeoff.
            </span>
            <textarea
              value={payload.tradeoff_reason}
              onChange={(event) =>
                update({ ...payload, tradeoff_reason: event.target.value })
              }
              rows={3}
              placeholder="Qué ganas y qué pierdes con esa elección."
              className="mt-2 w-full resize-none rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 ts-body text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]"
            />
          </label>
        </div>
      )}
    </div>
  );
}

export function aiComparisonCompletion(payload: AIComparisonPayload) {
  const missing: string[] = [];
  if (payload.selected_output === null) missing.push("selected_output");
  if (payload.tradeoff_reason.trim().length === 0) missing.push("tradeoff_reason");
  return { complete: missing.length === 0, missing };
}

export function emptyAIComparisonPayload(): AIComparisonPayload {
  return emptyPayload("ai_comparison") as AIComparisonPayload;
}
