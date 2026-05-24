"use client";

/**
 * /case-lab — selector de casos demo.
 *
 * Diseño HIG aplicado:
 *   - `.simulador-root` SIN dark forzado (respeta el theme del sistema)
 *   - `ts-*` tokens en lugar de Tailwind defaults (text-sm/text-xs/text-lg/...)
 *   - `--radius-*` tokens en lugar de px hardcoded
 *   - `card-apple-interactive` para hover refinement
 *   - `eyebrow`, `display`, `display-tight` utilities del sistema
 */

import Link from "next/link";
import { demoCases } from "@/lib/simulador/case-lab-cases";

export function CaseLabClient() {
  return (
    <main className="simulador-root min-h-screen surface-canvas text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1320px] flex-col px-6 py-8 md:px-10 lg:px-14">
        {/* ============ HEADER ============ */}
        <header className="flex items-center justify-between gap-6 border-b border-[var(--hairline)] pb-6">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] bg-[var(--accent)] ts-body font-semibold text-white">
              i
            </div>
            <div>
              <p className="ts-callout font-medium text-[var(--text-primary)]">Itera</p>
              <p className="ts-caption-1 text-[var(--text-secondary)]">Case lab</p>
            </div>
          </div>
          <Link
            href="/exercise-lab"
            className="rounded-[var(--radius-md)] px-4 py-2 ts-callout font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
          >
            Ver ejercicios →
          </Link>
        </header>

        {/* ============ HERO ============ */}
        <section className="py-10 md:py-14">
          <p className="eyebrow mb-4">Casos demo</p>
          <h1 className="display display-tight max-w-[760px] ts-display-lg sm:ts-display-2xl text-[var(--text-primary)]">
            Elige uno de los 5 casos.
          </h1>
          <p className="mt-5 max-w-2xl ts-body-lg leading-[1.55] text-[var(--text-secondary)]">
            Cada tarjeta abre una simulación completa en una página nueva, con secciones,
            diapositivas y ejercicios aplicados.
          </p>
        </section>

        {/* ============ GRID DE CASOS ============ */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {demoCases.map((demoCase) => (
            <Link
              key={demoCase.id}
              href={`/case-lab/${demoCase.id}`}
              className="card-apple card-apple-interactive flex min-h-[240px] flex-col rounded-[var(--radius-2xl)] bg-[var(--surface-2)] p-5 text-left transition-colors hover:bg-[var(--surface-3)]"
            >
              {/* TOP: nivel chip + minutos */}
              <div className="mb-7 flex items-center justify-between gap-3">
                <span className="rounded-[var(--radius-full)] bg-[var(--accent-soft)] px-2.5 py-1 ts-caption-1 font-medium text-[var(--accent)]">
                  {demoCase.level}
                </span>
                <span className="ts-caption-1 text-[var(--text-tertiary)]">
                  {demoCase.minutes} min
                </span>
              </div>

              {/* TITLE */}
              <h2 className="ts-headline font-semibold leading-[1.3] text-[var(--text-primary)]">
                {demoCase.title}
              </h2>

              {/* SUMMARY */}
              <p className="mt-3 ts-callout leading-[1.5] text-[var(--text-secondary)]">
                {demoCase.summary}
              </p>

              {/* CTA */}
              <p className="mt-auto pt-6 ts-callout font-medium text-[var(--accent)]">
                Abrir simulación →
              </p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
