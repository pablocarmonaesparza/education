"use client";

/**
 * /team — Inicio del employee.
 *
 * Vista personal (no catálogo). Aquí van eventualmente:
 *   - Bienvenida con nombre
 *   - Caso en progreso (continuar)
 *   - Próximo caso recomendado
 *   - Stats personales (completados, banda promedio, etc)
 *   - Quick access al catálogo (/casos)
 *
 * Por ahora placeholder mientras decidimos cómo se ve la home.
 */

import Link from "next/link";

export default function TeamHomePage() {
  return (
    <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-8 py-12 sm:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-[960px]">
        <h1 className="display display-tight text-[var(--text-primary)] text-[32px] sm:text-[40px]">
          Inicio
        </h1>
        <p className="mt-3 text-[15px] text-[var(--text-secondary)] leading-[1.55] max-w-[640px]">
          Tu home personal. Aquí verás tu próximo caso, tu progreso y tu
          último reporte.
        </p>

        <div className="mt-12 rounded-[var(--radius-lg)] border border-dashed border-[var(--hairline)] p-12 text-center">
          <p className="text-[14px] text-[var(--text-secondary)]">
            En construcción. Por ahora puedes ir directo al catálogo.
          </p>
          <Link
            href="/casos"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] accent-bg px-6 text-[15px] font-medium text-white hover:opacity-95 transition-opacity"
          >
            Ver catálogo de casos
          </Link>
        </div>
      </div>
    </main>
  );
}
