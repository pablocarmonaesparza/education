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

type ToolKind = "ai" | "data" | "messaging" | "documents" | "workflow";

interface ToolSpec {
  kind: ToolKind;
  label: string;
}

interface CoverMeta {
  profile?: string;
  level?: string;
  estimatedMinutes?: number;
  /** True · caso cronometrado (debe acompañarse de timerSeconds).
   *  False · caso sin límite de tiempo. Default: false. */
  timerEnabled?: boolean;
  /** Solo aplica si timerEnabled === true. */
  timerSeconds?: number;
  /** Herramientas que el participante va a usar en el caso. */
  tools?: ToolSpec[];
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
  timerEnabled: false,
  tools: [
    { kind: "ai", label: "Inteligencia artificial" },
    { kind: "data", label: "Tablas" },
    { kind: "messaging", label: "Mensajería" },
    { kind: "documents", label: "Documentos" },
  ],
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
  const hasTimer =
    meta.timerEnabled === true &&
    typeof meta.timerSeconds === "number" &&
    meta.timerSeconds > 0;
  const timerMinutes = hasTimer
    ? Math.round((meta.timerSeconds as number) / 60)
    : null;
  const tools = meta.tools ?? [];

  return (
    <div className="space-y-6">
      {/* Metadata · perfil, dificultad, tiempo estimado, estado del timer */}
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
        {/* Estado del timer · visible siempre · accent si on, neutro si off */}
        {hasTimer ? (
          <span className="flex items-center gap-1.5 rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1 ts-caption-1 font-semibold text-[var(--accent)]">
            <ClockGlyph />
            Cronometrado · {timerMinutes} min
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 ts-caption-1 font-medium text-[var(--text-tertiary)]">
            <ClockGlyph />
            Sin límite de tiempo
          </span>
        )}
      </div>

      {/* Herramientas que se van a usar */}
      {tools.length > 0 && (
        <div>
          <div className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
            Herramientas que vas a usar
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {tools.map((tool) => (
              <span
                key={tool.kind}
                className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 ts-subhead text-[var(--text-primary)]"
              >
                <ToolIcon kind={tool.kind} />
                {tool.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA principal · Iniciar */}
      <div className="flex items-center gap-4 pt-2">
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

function ClockGlyph() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 4.5V8L10.5 9.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ToolIcon({ kind }: { kind: ToolKind }) {
  const cls = "h-4 w-4 text-[var(--text-secondary)]";
  switch (kind) {
    case "ai":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M8 2L9.5 6L13.5 7L9.5 8L8 12L6.5 8L2.5 7L6.5 6L8 2Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.3"
          />
          <circle cx="13" cy="3" r="1" fill="currentColor" />
        </svg>
      );
    case "data":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect x="2.5" y="3" width="11" height="10" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <path d="M2.5 6.5H13.5M2.5 10H13.5M6 3V13" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
    case "messaging":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect x="2.5" y="4" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M3 5L8 9L13 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "documents":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M4 2.5H9.5L12 5V13C12 13.55 11.55 14 11 14H4C3.45 14 3 13.55 3 13V3.5C3 2.95 3.45 2.5 4 2.5Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.3"
          />
          <path d="M9 2.5V5.5H12" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.3" />
        </svg>
      );
    case "workflow":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="4" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="12" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="8" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M5.5 4H10.5M5 5L7 10.5M11 5L9 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
  }
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
