"use client";

/**
 * /case-template — lienzo vacío para diseñar la metodología de los casos.
 *
 * Sin contenido prescriptivo. Solo el shell estructural: header del caso
 * + 6 secciones del runtime canónico + footer del manager outcome. Cada
 * slot vacío esperando que Pablo lo llene.
 *
 * Lo único FIJO en la página es el shape (6 secciones en orden). Todo lo
 * demás se va construyendo aquí.
 */

import Link from "next/link";

const RUNTIME_SECTIONS = [
  "Contexto",
  "Datos",
  "IA",
  "Revision",
  "Decision",
  "Respuesta",
] as const;

export function CaseTemplateClient() {
  return (
    <main className="simulador-root min-h-screen surface-canvas text-[var(--text-primary)]">
      <div className="mx-auto w-full max-w-[1100px] px-6 py-10 md:px-10 md:py-14">
        {/* HEADER */}
        <header className="flex items-start justify-between gap-6 border-b border-[var(--hairline)] pb-6">
          <div>
            <p className="eyebrow text-[var(--text-tertiary)]">case template</p>
            <h1 className="display display-tight mt-2 ts-display-lg text-[var(--text-primary)]">
              [Título del caso]
            </h1>
            <p className="mt-3 ts-body text-[var(--text-secondary)]">
              [Brief / contexto del caso · Nivel · Profile · Minutos · Empresa]
            </p>
          </div>
          <nav className="flex flex-shrink-0 flex-col gap-2 ts-caption-1">
            <Link href="/exercise-lab" className="text-[var(--accent)] hover:underline">
              Exercise lab
            </Link>
            <Link
              href="/dev"
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              /dev
            </Link>
          </nav>
        </header>

        {/* 6 SECCIONES — placeholders vacíos */}
        <section className="mt-10 flex flex-col gap-6">
          {RUNTIME_SECTIONS.map((section, idx) => (
            <article
              key={section}
              className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)]"
            >
              <header className="flex items-baseline gap-3 border-b border-[var(--hairline)] bg-[var(--surface-2)] px-5 py-3">
                <span className="ts-caption-1 font-mono tabular-nums text-[var(--text-tertiary)]">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h2 className="ts-headline font-semibold text-[var(--text-primary)]">
                  {section}
                </h2>
              </header>
              <div className="px-5 py-8">
                <div className="rounded-[var(--radius-md)] border-2 border-dashed border-[var(--hairline)] bg-[var(--surface-2)] px-5 py-12 text-center">
                  <p className="ts-callout text-[var(--text-tertiary)]">
                    [vacío]
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* MANAGER OUTCOME — slot vacío */}
        <section className="mt-10">
          <div className="flex items-baseline gap-3">
            <h2 className="ts-title-3 font-semibold text-[var(--text-primary)] tracking-tight">
              Manager outcome
            </h2>
          </div>
          <div className="mt-4 rounded-[var(--radius-md)] border-2 border-dashed border-[var(--hairline)] bg-[var(--surface-2)] px-5 py-12 text-center">
            <p className="ts-callout text-[var(--text-tertiary)]">[vacío]</p>
          </div>
        </section>
      </div>
    </main>
  );
}
