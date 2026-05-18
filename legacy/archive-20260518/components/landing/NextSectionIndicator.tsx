'use client';

import { motion } from 'framer-motion';

/**
 * Bottom-of-section chevron that scrolls to the next section.
 * Pattern compartido entre hero/empresas/cursos/pricing — antes vivía
 * inline en cada uno, ahora centralizado para que el chain de scroll
 * sea fácil de adaptar cuando se reordenen secciones.
 *
 * El padre debe ser `relative` (las secciones de la landing ya lo son
 * con `relative min-h-screen`).
 */
interface NextSectionIndicatorProps {
  /** Section id to scroll to (sin '#') */
  targetId: string;
  /** Label que aparece arriba del chevron */
  label: string;
  /** Delay de entrada en segundos (default 0.6) */
  delay?: number;
}

export default function NextSectionIndicator({
  targetId,
  label,
  delay = 0.6,
}: NextSectionIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8, delay }}
      viewport={{ once: true }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
    >
      <button
        onClick={() => {
          document
            .getElementById(targetId)
            ?.scrollIntoView({ behavior: 'smooth' });
        }}
        className="flex flex-col items-center gap-1 cursor-pointer group"
      >
        <span className="text-sm font-semibold tracking-wide text-black/40 dark:text-white/40 group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors">
          {label}
        </span>
        <motion.svg
          className="w-5 h-5 text-black/40 dark:text-white/40 group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </motion.svg>
      </button>
    </motion.div>
  );
}
