'use client';

/**
 * Empresas v2 — porteado del prototipo claude-design (sections-2.jsx:185-335).
 * Sección dark con stats, casos de uso y CTA empresarial.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Body, Caption } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';

const useCases = [
  {
    icon: 'users',
    title: 'onboarding al stack IA para nuevos contratos',
    desc: 'rutas con tus modelos, tus procesos y tus datos. de 6 semanas a 2.',
  },
  {
    icon: 'rocket',
    title: 'upskill de equipos no técnicos en IA',
    desc:
      'marketing, ops y ventas aprenden a aplicar IA en su día. dejan de adivinar qué se puede automatizar.',
  },
  {
    icon: 'shield',
    title: 'academia interna de IA',
    desc:
      'tu academia IA, sin construirla desde cero. métricas de finalización, no de inscripción.',
  },
];

const stats = [
  {
    v: '−60%',
    l: 'tiempo de onboarding al stack IA',
    color: '#22c55e',
  },
  {
    v: '94%',
    l: 'completion rate (vs. 13% en cursos y capacitaciones tradicionales)',
    color: '#1472FF',
  },
  {
    v: '100%',
    l: 'rutas custom por industria + stack',
    color: '#fbbf24',
  },
];

const logos = [
  'mercadolibre',
  'rappi',
  'platzi',
  'factus',
  'nubank',
  'kavak',
  'globant',
  'bitso',
];

const Icons: Record<string, () => React.ReactElement> = {
  users: () => (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  rocket: () => (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  shield: () => (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

export default function Empresas() {
  return (
    <section
      id="empresas"
      className="relative overflow-hidden py-16 md:py-24 text-white"
      style={{ background: '#0a1628' }}
    >
      {/* grid sutil de fondo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.06,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-12"
        >
          <span
            className="font-bold uppercase tracking-wider text-completado"
            style={{ fontSize: 14, letterSpacing: '0.05em' }}
          >
            para empresas
          </span>
          <h2
            className="font-display font-extrabold mt-3 lowercase tracking-tight leading-tight text-white"
            style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
          >
            tu equipo aprende <span className="normal-case">IA</span> aplicándola a lo
            que ya hacen
          </h2>
          <Body className="!text-gray-300 mt-4 max-w-2xl text-lg">
            Rutas privadas con tu stack, tus procesos y tus casos reales. Métricas de
            finalización, no de inscripción. Factura local en LATAM.
          </Body>
        </motion.div>

        {/* stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 mb-14 overflow-hidden rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '2px solid rgba(255,255,255,0.18)',
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className="p-7 flex flex-col gap-2"
              style={{
                borderRight:
                  i < stats.length - 1
                    ? '1px solid rgba(255,255,255,0.12)'
                    : undefined,
              }}
            >
              <div
                className="font-display font-extrabold leading-none lowercase tracking-tight"
                style={{
                  fontSize: 'clamp(36px, 5vw, 56px)',
                  color: s.color,
                  letterSpacing: '-0.03em',
                }}
              >
                {s.v}
              </div>
              <div className="text-sm font-medium leading-snug text-gray-300">
                {s.l}
              </div>
            </div>
          ))}
        </motion.div>

        {/* casos de uso */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {useCases.map((u, i) => {
            const IconC = Icons[u.icon];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.1 }}
                className="p-7 rounded-2xl flex flex-col gap-3.5"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '2px solid rgba(255,255,255,0.18)',
                  borderBottomWidth: 4,
                  borderBottomColor: 'rgba(255,255,255,0.28)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl border-2 border-primary-dark bg-primary text-white flex items-center justify-center"
                >
                  <IconC />
                </div>
                <div
                  className="font-display font-extrabold text-white leading-tight tracking-tight"
                  style={{ fontSize: 19, letterSpacing: '-0.02em' }}
                >
                  {u.title}
                </div>
                <div className="text-sm leading-relaxed text-gray-300">{u.desc}</div>
              </motion.div>
            );
          })}
        </div>

        {/* logos marquee */}
        <div className="mb-10">
          <Caption className="!text-gray-400 block mb-4 text-center">
            equipos en latam que están en pilot con itera (placeholder · nombres reales
            por confirmar)
          </Caption>
          <div
            className="overflow-hidden"
            style={{
              maskImage:
                'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
              WebkitMaskImage:
                'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
            }}
          >
            <div
              className="flex gap-12"
              style={{ animation: 'marquee-x 26s linear infinite', width: 'max-content' }}
            >
              {[...logos, ...logos].map((l, i) => (
                <span
                  key={i}
                  className="font-display font-extrabold lowercase tracking-tight whitespace-nowrap"
                  style={{ fontSize: 22, color: 'rgba(255,255,255,0.45)' }}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 p-8 rounded-2xl items-center"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '2px solid rgba(255,255,255,0.18)',
          }}
        >
          <div className="flex-1 min-w-[260px]" style={{ flexBasis: 320 }}>
            <div
              className="font-display font-extrabold text-white lowercase tracking-tight"
              style={{ fontSize: 22, letterSpacing: '-0.02em' }}
            >
              ¿queremos hablar?
            </div>
            <div className="text-sm text-gray-300 mt-1.5">
              15 min. Te mostramos cómo se vería tu ruta privada.
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              href="/empresas"
              variant="primary"
              size="lg"
              className="inline-flex items-center justify-center gap-2"
            >
              agendar demo
            </Button>
            <Button
              href="/empresas#brochure"
              variant="outline"
              size="lg"
              className="inline-flex items-center justify-center gap-2"
              style={{
                background: 'transparent',
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.5)',
              }}
            >
              ver brochure
            </Button>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes marquee-x {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
