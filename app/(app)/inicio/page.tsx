"use client";

/**
 * /inicio — dashboard personal del employee.
 *
 * Esqueleto inicial: bienvenida + próximo caso + último reporte + progreso.
 * Por ahora es placeholder; el contenido real lo vamos llenando junto a
 * Pablo cuando atacamos el employee flow.
 */

import { motion } from "framer-motion";

export default function InicioPage() {
  return (
    <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto w-full max-w-[960px]"
      >
        <div className="eyebrow mb-3">Tu sprint</div>
        <h1 className="display display-tight text-[var(--text-primary)] text-[32px] sm:text-[40px]">
          Inicio
        </h1>
        <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-[1.55]">
          Esta es la vista del participante. Aquí van: tu próximo caso
          pendiente, tu último reporte, y tu progreso personal en las
          dimensiones del diagnóstico.
        </p>

        <div className="mt-12 rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-8 text-center">
          <p className="text-[14px] text-[var(--text-tertiary)]">
            En construcción — la pantalla del employee se rellena en una
            sesión dedicada.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
