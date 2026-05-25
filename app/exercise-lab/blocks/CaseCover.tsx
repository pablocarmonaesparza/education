"use client";

/**
 * CaseCover · renderer del bloque canónico `case_cover` (lab_ref 00).
 *
 * Portada del caso · pantalla de bienvenida con título grande,
 * descripción ampliada, metadata (perfil/dificultad/tiempo estimado)
 * y un botón Iniciar prominente.
 *
 * Si el caso define timer (caseContext.timerSeconds), se muestra el
 * tiempo estimado en la portada y al click en Iniciar se persiste
 * `started_at` para que el shell del runtime arranque el countdown
 * global. Timer es opcional · si no está set, el caso simplemente
 * arranca sin presión.
 *
 * Sin hint interno · el shell tiene eyebrow + title + body.
 */

import { useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";

type CaseCoverPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "case_cover" }
>;

interface CoverMeta {
  profile?: string;
  level?: string;
  estimatedMinutes?: number;
  timerSeconds?: number; // si está set, el caso es cronometrado
}

interface Props extends ExerciseRendererProps<CaseCoverPayload> {
  meta?: CoverMeta;
  ctaLabel?: string;
  sessionId?: string | null;
}

const DEFAULT_META: CoverMeta = {
  profile: "Marketing",
  level: "N1 · Fundamentos",
  estimatedMinutes: 12,
  // timerSeconds opcional · no set por default
};

export function CaseCover({
  payload,
  onChange,
  onPatch,
  slideId = "case_cover",
  mode = "lab_demo",
  sessionId = null,
  caseContext,
  onShellContinue,
  meta: metaProp,
  ctaLabel = "Iniciar caso",
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());

  const meta = metaProp ?? (caseContext?.meta as CoverMeta | undefined) ?? DEFAULT_META;

  function start() {
    const now = new Date().toISOString();
    const next: CaseCoverPayload = { ...payload, started_at: now };
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:case_cover:${slideId}`, next, {
        time_to_start_ms: Date.now() - mountedAt.current,
        timer_seconds: meta.timerSeconds ?? null,
      });
    }
    onPatch?.(next);
    if (onShellContinue) {
      window.setTimeout(() => onShellContinue(), 250);
    }
  }

  const alreadyStarted = payload.started_at !== null;
  const hasTimer = typeof meta.timerSeconds === "number" && meta.timerSeconds > 0;
  const timerMinutes = hasTimer ? Math.round((meta.timerSeconds as number) / 60) : null;

  return (
    <div className="space-y-6">
      {/* Metadata · perfil, dificultad, tiempo estimado */}
      <div className="flex flex-wrap items-center gap-2">
        {meta.profile && (
          <span className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 ts-caption-1 font-medium text-[var(--text-secondary)]">
            {meta.profile}
          </span>
        )}
        {meta.level && (
          <span className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 ts-caption-1 font-medium text-[var(--text-secondary)]">
            {meta.level}
          </span>
        )}
        {meta.estimatedMinutes && (
          <span className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 ts-caption-1 font-medium text-[var(--text-secondary)]">
            ~{meta.estimatedMinutes} min
          </span>
        )}
        {hasTimer && (
          <span className="flex items-center gap-1.5 rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1 ts-caption-1 font-semibold text-[var(--accent)]">
            <svg
              className="h-3 w-3"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
            >
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M8 4.5V8L10.5 9.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>
            Cronometrado · {timerMinutes} min
          </span>
        )}
      </div>

      {/* CTA principal · Iniciar */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={start}
          disabled={alreadyStarted}
          className={`rounded-[var(--radius-md)] px-7 py-3 ts-callout font-medium text-white transition-opacity ${
            alreadyStarted
              ? "bg-[var(--surface-3)] text-[var(--text-disabled)] cursor-not-allowed"
              : "accent-bg hover:opacity-90"
          }`}
        >
          {alreadyStarted ? "Caso iniciado" : `${ctaLabel} →`}
        </button>
        {hasTimer && !alreadyStarted && (
          <span className="ts-footnote text-[var(--text-tertiary)]">
            El tiempo arranca al iniciar.
          </span>
        )}
      </div>
    </div>
  );
}

export function caseCoverCompletion(payload: CaseCoverPayload) {
  return {
    complete: payload.started_at !== null,
    missing: payload.started_at === null ? ["started_at"] : [],
  };
}

export function emptyCaseCoverPayload(): CaseCoverPayload {
  return emptyPayload("case_cover") as CaseCoverPayload;
}
