'use client';

/**
 * Compare v2 — porteado del prototipo claude-design (sections-1.jsx:874-935).
 * Tabla comparativa itera vs cursos/universidades/capacitaciones.
 */

import { motion } from 'framer-motion';
import { Headline, Title, Body, Caption } from '@/components/ui/Typography';

const rows: Array<[string, React.ReactNode, string]> = [
  ['formato', 'ejercicio interactivo', 'contenido pasivo'],
  ['duración por unidad', '≈10 min', '≈1 h'],
  [
    'output al terminar',
    <>
      <span className="normal-case">IA</span> aplicada a tu trabajo
    </>,
    'certificado pdf',
  ],
  ['dificultad', 'ajustada al perfil', 'fija para todos'],
  ['actualización', 'lecciones nuevas cada modelo', 'estática'],
  ['soporte de pares', 'comunidad por caso real', 'foros generales'],
];

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="flex-shrink-0 text-completado-dark"
    aria-hidden="true"
  >
    <polyline points="4 12 10 18 20 6" />
  </svg>
);

const XIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    className="flex-shrink-0 text-ink-muted"
    aria-hidden="true"
  >
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export default function Compare() {
  return (
    <section id="vs" className="bg-gray-50 dark:bg-gray-900 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 max-w-3xl"
        >
          <Headline>comparativa</Headline>
          <Title className="mt-3">
            itera vs cursos, universidades y capacitaciones
          </Title>
          <Body className="mt-4">
            No comparamos por marketing — comparamos por formato. Cursos, universidades y
            capacitaciones (Udemy, Coursera, Platzi, Masterclass, programas universitarios,
            capacitaciones corporativas) optimizan consumo pasivo. Nosotros optimizamos
            ejecución.
          </Body>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800"
          style={{ borderBottomWidth: 4 }}
        >
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[1.2fr_1fr_1fr] min-w-[640px]">
            {/* header */}
            <div className="p-5 bg-white dark:bg-gray-800 border-b-2 border-ink dark:border-white">
              <Caption className="uppercase font-bold tracking-wider !text-ink dark:!text-white">
                eje
              </Caption>
            </div>
            <div className="p-5 bg-primary text-white border-b-2 border-l-2 border-ink dark:border-white">
              <span
                className="font-display font-extrabold lowercase tracking-tight"
                style={{ fontSize: 22 }}
              >
                itera
              </span>
            </div>
            <div className="p-5 bg-white dark:bg-gray-800 border-b-2 border-l-2 border-ink dark:border-white">
              <Caption className="uppercase font-bold tracking-wider !text-ink dark:!text-white">
                cursos · universidades · capacitaciones
              </Caption>
            </div>
            {/* rows */}
            {rows.map(([eje, a, b], i) => {
              const last = i === rows.length - 1;
              const borderClass = last
                ? ''
                : 'border-b border-gray-200 dark:border-gray-700';
              return (
                <div className="contents" key={i}>
                  <div
                    className={`p-4 text-sm font-semibold lowercase text-ink dark:text-white ${borderClass}`}
                  >
                    {eje}
                  </div>
                  <div
                    className={`p-4 border-l-2 border-ink dark:border-white bg-primary/10 flex items-center gap-2 text-sm font-bold text-ink dark:text-white ${borderClass}`}
                  >
                    <CheckIcon />
                    <span className="lowercase">{a}</span>
                  </div>
                  <div
                    className={`p-4 border-l-2 border-ink dark:border-white flex items-center gap-2 text-sm text-ink-muted ${borderClass}`}
                  >
                    <XIcon />
                    <span className="lowercase">{b}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </motion.div>
      </div>
    </section>
  );
}
