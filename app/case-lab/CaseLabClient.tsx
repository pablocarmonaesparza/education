"use client";

import Link from "next/link";
import { demoCases } from "@/lib/simulador/case-lab-cases";

export function CaseLabClient() {
  return (
    <main className="simulador-root dark min-h-screen surface-canvas text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1320px] flex-col px-6 py-8 md:px-10 lg:px-14">
        <header className="flex items-center justify-between gap-6 border-b border-[var(--hairline)] pb-6">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-[var(--accent)] text-[15px] font-semibold text-white">
              i
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Itera</p>
              <p className="text-xs text-[var(--text-secondary)]">Case lab</p>
            </div>
          </div>
          <Link
            href="/exercise-lab"
            className="rounded-[12px] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
          >
            Ver ejercicios
          </Link>
        </header>

        <section className="py-10 md:py-14">
          <p className="eyebrow mb-4 text-[var(--text-tertiary)]">Casos demo</p>
          <h1 className="display max-w-[760px] text-5xl md:text-6xl">
            Elige uno de los 5 casos.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
            Cada tarjeta abre una simulación completa en una página nueva, con secciones,
            diapositivas y ejercicios aplicados.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {demoCases.map((demoCase) => (
            <Link
              key={demoCase.id}
              href={`/case-lab/${demoCase.id}`}
              className="card-apple card-apple-interactive flex min-h-[240px] flex-col rounded-[22px] bg-[var(--surface-2)] p-5 text-left transition hover:bg-[var(--surface-3)]"
            >
              <div className="mb-7 flex items-center justify-between gap-3">
                <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
                  {demoCase.level}
                </span>
                <span className="text-xs text-[var(--text-tertiary)]">
                  {demoCase.minutes} min
                </span>
              </div>
              <h2 className="text-[17px] font-semibold leading-6 text-[var(--text-primary)]">
                {demoCase.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                {demoCase.summary}
              </p>
              <p className="mt-auto pt-6 text-sm font-medium text-[var(--accent)]">
                Abrir simulación
              </p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
