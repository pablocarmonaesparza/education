'use client';

/**
 * Como v2 — porteado del prototipo claude-design (sections-1.jsx:801-871).
 * Tres pasos en cards, con flecha conectora entre ellos en desktop.
 */

import { motion } from 'framer-motion';
import { Headline, Title, Body, Caption } from '@/components/ui/Typography';
import Card from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';

const steps = [
  {
    n: '01',
    title: 'cuestionario calibrado',
    time: '2 min',
    body:
      'Ocho preguntas que ajustan dificultad, ritmo y para qué quieres usar IA. Sin encuesta de 40 campos.',
  },
  {
    n: '02',
    title: 'ruta personalizada',
    time: '100 lecciones',
    body:
      'El orden se reordena según lo que ya sabes y lo que necesitas aplicar. Nada de empezar por qué es un LLM si eso ya lo dominas.',
    highlight: true,
  },
  {
    n: '03',
    title: 'ejercicios cortos',
    time: '≈10 min c/u',
    body:
      'Ejecutas, no miras. Cada lección termina con un prompt probado, una automatización corriendo o una integración funcionando.',
  },
];

const ArrowIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="36"
    height="36"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export default function Como() {
  return (
    <section id="como" className="bg-white dark:bg-gray-800 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-14">
          <div>
            <Headline>cómo funciona itera</Headline>
            <Title className="mt-3 max-w-xl">tres pasos · cero teoría inflada</Title>
          </div>
          <Caption className="max-w-xs">
            Tiempo al primer ejercicio aplicado: ≈12 minutos desde signup
          </Caption>
        </div>

        <div className="grid gap-5 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch">
          {steps.map((step, i) => (
            <div key={step.n} className="contents">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="relative flex flex-col gap-4"
              >
                <div className="flex items-baseline gap-3.5">
                  <span
                    className="font-display font-extrabold text-primary tracking-tight"
                    style={{ fontSize: 88, lineHeight: 0.85, letterSpacing: '-0.04em' }}
                  >
                    {step.n}
                  </span>
                  <Tag variant="primary">{step.time}</Tag>
                </div>
                <Card
                  variant={step.highlight ? 'primary' : 'neutral'}
                  className="flex flex-col gap-4 flex-1"
                >
                  <div>
                    <h3
                      className={`font-display font-extrabold tracking-tight leading-tight lowercase text-2xl ${
                        step.highlight ? 'text-white' : 'text-ink dark:text-white'
                      }`}
                    >
                      {step.title}
                    </h3>
                    <Body
                      className={`mt-2 text-sm ${
                        step.highlight ? '!text-blue-100' : ''
                      }`}
                    >
                      {step.body}
                    </Body>
                  </div>
                </Card>
              </motion.div>
              {i < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center text-primary">
                  <ArrowIcon />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
