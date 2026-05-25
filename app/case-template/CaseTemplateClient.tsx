"use client";

/**
 * /case-template — shell del runtime de un caso.
 *
 * Layout HIG (patrón Typeform "one question per page"):
 *
 *   ┌──────────┬──────────────────────────────────┐
 *   │          │ ▓▓▓ ░░░ ░░░ ░░░ ░░░              │
 *   │  • Sec1  │                                  │
 *   │  • Sec2  │      Título (3-4 palabras)       │
 *   │  • ...   │      Body 2 renglones            │
 *   │          │      [ Ejercicio canónico ]      │
 *   │          │      [Continuar] · Enter ↵       │
 *   └──────────┴──────────────────────────────────┘
 *
 * - Sidebar minimal estilo Linear: dot + label, sin chips numerados.
 * - Top: progress de 5 segmentos (cada sección = 5 diapositivas).
 *   Segmento actual pulsa.
 * - Centro: bloque cohesivo título → body → ejercicio → botón,
 *   centrado vertical y horizontalmente, todo dentro de max-w-[560px].
 * - Ejercicio del registry canónico (hoy: ai_textfield_free) inyectado
 *   entre body y botón. Encuadra dentro del ancho del bloque.
 *
 * Estado hardcoded en Contexto · 1/5. Sin navegación todavía.
 */

import { ExerciseBlockRenderer } from "@/components/simulador/ExerciseBlockRenderer";
import type { ExerciseBlockId } from "@/lib/simulador/exercise-blocks.generated";

const SECTIONS = [
  "Contexto",
  "Datos",
  "IA",
  "Revision",
  "Decision",
  "Respuesta",
] as const;

const SLIDES_PER_SECTION = 5;

const ACTIVE_SECTION_INDEX = 0; // Contexto
const ACTIVE_SLIDE_INDEX = 0; // 1/5
const ACTIVE_EXERCISE_BLOCK_ID: ExerciseBlockId = "ai_textfield_free";

export function CaseTemplateClient() {
  return (
    <main className="simulador-root min-h-screen surface-canvas text-[var(--text-primary)]">
      <div className="grid min-h-screen grid-cols-[240px_1fr]">
        {/* ============ SIDEBAR — 6 secciones (estilo Linear: dot + label) ============ */}
        <aside className="bg-[var(--surface)] px-6 py-12">
          <nav className="flex flex-col gap-1">
            {SECTIONS.map((section, idx) => {
              const isActive = idx === ACTIVE_SECTION_INDEX;
              const isPast = idx < ACTIVE_SECTION_INDEX;
              return (
                <div
                  key={section}
                  aria-current={isActive ? "step" : undefined}
                  className={`group flex items-center gap-3 py-2 ts-subhead transition-colors ${
                    isActive
                      ? "text-[var(--text-primary)] font-medium"
                      : isPast
                        ? "text-[var(--text-secondary)]"
                        : "text-[var(--text-tertiary)]"
                  }`}
                >
                  {/* Dot indicator — minimal, sin chips numerados pesados */}
                  <span
                    className={`h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors ${
                      isActive
                        ? "bg-[var(--accent)]"
                        : isPast
                          ? "bg-[var(--text-tertiary)]"
                          : "border border-[var(--border)] bg-transparent"
                    }`}
                  />
                  <span>{section}</span>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* ============ CENTRO ============ */}
        <div className="flex flex-col">
          {/* TOP — progress 5 segmentos (sin label ni numerador, sin border) */}
          <div className="px-10 pt-8 pb-6">
            <div
              role="progressbar"
              aria-label={`Diapositiva ${ACTIVE_SLIDE_INDEX + 1} de ${SLIDES_PER_SECTION}`}
              aria-valuemin={1}
              aria-valuemax={SLIDES_PER_SECTION}
              aria-valuenow={ACTIVE_SLIDE_INDEX + 1}
              className="flex w-full gap-2"
            >
              {Array.from({ length: SLIDES_PER_SECTION }).map((_, idx) => {
                const isActive = idx === ACTIVE_SLIDE_INDEX;
                const isPast = idx < ACTIVE_SLIDE_INDEX;
                return (
                  <div
                    key={idx}
                    className={`h-[3px] flex-1 rounded-full transition-colors ${
                      isActive
                        ? "bg-[var(--accent)] animate-pulse"
                        : isPast
                          ? "bg-[var(--text-secondary)]"
                          : "bg-[var(--surface-3)]"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* CONTENIDO — patrón Typeform: bloque cohesivo (título + body + botón)
              centrado vertical y horizontalmente en el viewport. El botón vive
              justo debajo del body, no pegado al bottom.
              Ancho del bloque reducido (560px) para más aire horizontal alrededor. */}
          <section className="flex flex-1 items-center justify-center px-16 py-14">
            <div className="w-full max-w-[560px]">
              {/* Título — 3-4 palabras máximo (1 renglón) */}
              <h1 className="display display-tight ts-display truncate text-[var(--text-primary)]">
                Lorem ipsum dolor sit
              </h1>

              {/* Body markdown — 2 renglones */}
              <div className="mt-5 ts-body-lg leading-[1.55] text-[var(--text-secondary)]">
                <p className="line-clamp-2">
                  Lorem ipsum dolor sit amet, <strong>consectetur</strong>{" "}
                  adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua.
                </p>
              </div>

              {/* EJERCICIO — bloque canónico del registry, entre body y botón.
                  Hereda el ancho del bloque (max-w-[560px]). Hoy seed con
                  ai_textfield_free; cuando haya navegación real, este blockId
                  vendrá del CaseStepContract. */}
              <div className="mt-8">
                <ExerciseBlockRenderer
                  blockId={ACTIVE_EXERCISE_BLOCK_ID}
                  sessionId={null}
                  mode="lab_demo"
                  slideId="case_template_demo"
                />
              </div>

              {/* Continuar — left-aligned justo debajo del ejercicio (gap ~40px),
                  con hint "Enter" estilo Typeform. */}
              <div className="mt-10 flex items-center gap-4">
                <button
                  type="button"
                  className="rounded-[var(--radius-md)] accent-bg px-7 py-3 ts-callout font-medium text-white shadow-none transition-opacity hover:opacity-90"
                >
                  Continuar →
                </button>
                <span className="ts-footnote text-[var(--text-tertiary)]">
                  o pulsa{" "}
                  <kbd className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-0.5 ts-caption-2 font-medium text-[var(--text-secondary)]">
                    Enter ↵
                  </kbd>
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
