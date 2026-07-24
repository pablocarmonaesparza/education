"use client";

/**
 * /case-template · shell del runtime de un caso.
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
import { AppleSlideButton, AppleStepBar } from "@/components/simulador/apple";
import type { ExerciseBlockId } from "@/lib/simulador/exercise-blocks.generated";
import { SlideBody } from "../exercise-lab/_shared/SlideBody";

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
      {/* Responsive: en móvil (< lg) el grid colapsa a 1 columna y el sidebar
          se oculta · una columna fija de 240px dejaría ~135px de contenido
          en 375px. El progreso de sección sigue visible en la step bar. */}
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[240px_1fr]">
        {/* ============ SIDEBAR · 6 secciones (estilo Linear: dot + label) ============ */}
        <aside className="hidden bg-[var(--surface)] px-6 py-12 lg:block">
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
                  {/* Dot indicator · minimal, sin chips numerados pesados */}
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
          {/* TOP · progress 5 segmentos (sin label ni numerador, sin border).
              Mismo ancho que el contenido central: escala responsive
              92% → 80% → 65% (capped a 1200px en monitores muy anchos),
              centrado. Sin padding lateral del wrapper para que el % sea exacto. */}
          <div className="pt-8 pb-6">
            <div className="mx-auto w-[92%] max-w-[1200px] sm:w-[80%] lg:w-[65%]">
              <AppleStepBar
                total={SLIDES_PER_SECTION}
                current={ACTIVE_SLIDE_INDEX}
                className="w-full"
                ariaLabel={`Diapositiva ${ACTIVE_SLIDE_INDEX + 1} de ${SLIDES_PER_SECTION}`}
              />
            </div>
          </div>

          {/* CONTENIDO · patrón Typeform: bloque cohesivo (título + body + botón)
              centrado vertical y horizontalmente en el viewport. El botón vive
              justo debajo del body, no pegado al bottom.
              Ancho del bloque: escala responsive 92% → 80% → 65% (capped
              1200px), alineado exactamente con la progress bar arriba. Sin
              padding lateral del section para que el % sea real. */}
          <section className="flex flex-1 items-center justify-center py-14">
            <div className="w-[92%] max-w-[1200px] sm:w-[80%] lg:w-[65%]">
              {/* Título · 3-4 palabras máximo (1 renglón) */}
              <h1 className="display display-tight ts-display truncate text-[var(--text-primary)]">
                Lorem ipsum dolor sit
              </h1>

              {/* Body markdown render via SlideBody (regla del producto:
                  body siempre con markdown para dinamismo). */}
              <SlideBody className="mt-5">
                {`Lorem ipsum dolor sit amet, **consectetur** adipiscing elit. *Sed do eiusmod tempor incididunt* ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud [exercitation](https://example.com).`}
              </SlideBody>

              {/* EJERCICIO · bloque canónico del registry, entre body y botón.
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

              {/* Continuar · left-aligned justo debajo del ejercicio (gap ~40px),
                  con hint "Enter" estilo Typeform. */}
              <div className="mt-10">
                <AppleSlideButton hint>Continuar →</AppleSlideButton>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
