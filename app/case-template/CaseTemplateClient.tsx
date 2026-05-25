"use client";

/**
 * /case-template — shell del runtime de un caso.
 *
 * Layout HIG:
 *   ┌──────────┬──────────────────────────────────┐
 *   │          │ ▓▓▓ ░░░ ░░░ ░░░ ░░░  (1/5)       │
 *   │  SIDE    │                                  │
 *   │  6       │   Título (1 renglón)             │
 *   │  secs    │   Lorem ipsum 3 renglones        │
 *   │          │                                  │
 *   │          │          [Continuar]             │
 *   └──────────┴──────────────────────────────────┘
 *
 * - Sidebar fija con las 6 secciones del runtime canónico
 * - Top: progress de 5 segmentos (cada sección = 5 diapositivas)
 *   Segmento actual pulsa (animate-pulse)
 * - Centro: título + body markdown
 * - Continuar centrado abajo
 *
 * Sin lógica de navegación todavía. Estado hardcoded en Contexto · 1/5.
 */

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

export function CaseTemplateClient() {
  return (
    <main className="simulador-root min-h-screen surface-canvas text-[var(--text-primary)]">
      <div className="grid min-h-screen grid-cols-[240px_1fr]">
        {/* ============ SIDEBAR — 6 secciones ============ */}
        <aside className="border-r border-[var(--hairline)] bg-[var(--surface)] px-5 py-8">
          <div className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
            Sección
          </div>
          <nav className="mt-4 flex flex-col gap-1">
            {SECTIONS.map((section, idx) => {
              const isActive = idx === ACTIVE_SECTION_INDEX;
              const isPast = idx < ACTIVE_SECTION_INDEX;
              return (
                <div
                  key={section}
                  aria-current={isActive ? "step" : undefined}
                  className={`flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 transition-colors ${
                    isActive
                      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                      : isPast
                        ? "text-[var(--text-secondary)]"
                        : "text-[var(--text-tertiary)]"
                  }`}
                >
                  <span
                    className={`grid h-6 w-6 flex-shrink-0 place-items-center rounded-full ts-caption-1 font-semibold tabular-nums ${
                      isActive
                        ? "bg-[var(--accent)] text-white"
                        : isPast
                          ? "bg-[var(--surface-3)] text-[var(--text-secondary)]"
                          : "border border-[var(--border)] text-[var(--text-tertiary)]"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="ts-subhead font-medium">{section}</span>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* ============ CENTRO ============ */}
        <div className="flex flex-col">
          {/* TOP — progress 5 segmentos */}
          <div className="border-b border-[var(--hairline)] px-10 pt-8 pb-6">
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
            <div className="mt-3 flex items-center justify-between ts-caption-1 text-[var(--text-tertiary)]">
              <span>{SECTIONS[ACTIVE_SECTION_INDEX]}</span>
              <span className="tabular-nums">
                {ACTIVE_SLIDE_INDEX + 1} / {SLIDES_PER_SECTION}
              </span>
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

              {/* Continuar — left-aligned justo debajo del body (gap ~40px),
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
