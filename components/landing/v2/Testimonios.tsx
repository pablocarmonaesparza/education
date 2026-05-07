'use client';

/**
 * Testimonios v2 — porteado del prototipo claude-design (sections-2.jsx:3-98).
 * Bento asimétrico: 1 testimonio destacado grande + 2 chicos apilados.
 */

import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';
import { Headline, Title, Caption } from '@/components/ui/Typography';

interface Testimonial {
  quote: string;
  name: string;
  project: string;
  avatar: 'f1' | 'f2' | 'f3';
  featured?: boolean;
  stat?: string;
  statLabel?: string;
}

const items: Testimonial[] = [
  {
    quote:
      'automaticé mis reportes con n8n + claude. recuperé 6 horas a la semana.',
    name: '[nombre real pendiente]',
    project: 'marketing · pyme',
    avatar: 'f1',
    featured: true,
    stat: '6 hs',
    statLabel: 'por semana recuperadas',
  },
  {
    quote:
      'aprendí mcp y skills en 4 semanas. claude ahora trabaja con mis bases de datos.',
    name: '[nombre real pendiente]',
    project: 'ops · agencia',
    avatar: 'f2',
  },
  {
    quote:
      'venía de 3 cursos de IA abandonados. itera fue el primero que sí terminé y apliqué.',
    name: '[nombre real pendiente]',
    project: 'founder · saas',
    avatar: 'f3',
  },
];

const Avatar = ({ kind, size = 48 }: { kind: 'f1' | 'f2' | 'f3'; size?: number }) => {
  const palettes: Record<'f1' | 'f2' | 'f3', [string, string]> = {
    f1: ['#1472FF', '#22c55e'],
    f2: ['#0E5FCC', '#fbbf24'],
    f3: ['#22c55e', '#1472FF'],
  };
  const p = palettes[kind];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className="block flex-shrink-0"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="12" fill={p[0]} stroke="#0a1628" strokeWidth="2" />
      <circle cx="24" cy="24" r="10" fill={p[1]} stroke="#0a1628" strokeWidth="2" />
    </svg>
  );
};

export default function Testimonios() {
  const featured = items[0];
  const others = items.slice(1);

  return (
    <section className="bg-white dark:bg-gray-800 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap justify-between items-end gap-4 mb-12"
        >
          <div className="max-w-2xl">
            <Headline>resultados reales</Headline>
            <Title className="mt-3">
              <span className="normal-case">IA</span> aplicada al trabajo, no certificados
            </Title>
          </div>
          <Caption>Cada testimonio enlaza al caso real cuando esté publicado</Caption>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-[1.5fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card variant="primary" className="flex flex-col gap-6 p-9 h-full">
              <Tag variant="success">destacado</Tag>
              <div
                className="font-display font-extrabold lowercase tracking-tight leading-[1.05] text-white"
                style={{
                  fontSize: 'clamp(28px, 3.6vw, 44px)',
                  letterSpacing: '-0.025em',
                  textWrap: 'balance',
                }}
              >
                &ldquo;{featured.quote}&rdquo;
              </div>
              <div className="flex flex-wrap items-center justify-between gap-5 mt-auto pt-4">
                <div className="flex items-center gap-3.5">
                  <Avatar kind={featured.avatar} size={56} />
                  <div>
                    <div
                      className="font-bold text-white lowercase"
                      style={{ fontSize: 15 }}
                    >
                      {featured.name}
                    </div>
                    <Caption className="!text-blue-100 block">{featured.project}</Caption>
                  </div>
                </div>
                <div
                  className="text-center rounded-xl border-2 border-completado-dark bg-completado"
                  style={{
                    color: '#052e16',
                    borderBottomWidth: 5,
                    padding: '10px 18px',
                  }}
                >
                  <div
                    className="font-display font-extrabold lowercase tracking-tight leading-none"
                    style={{ fontSize: 28, letterSpacing: '-0.02em' }}
                  >
                    {featured.stat}
                  </div>
                  <Caption className="!text-[#052e16] font-semibold">
                    {featured.statLabel}
                  </Caption>
                </div>
              </div>
            </Card>
          </motion.div>

          <div className="flex flex-col gap-5">
            {others.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
              >
                <Card variant="neutral" className="flex flex-col gap-4 h-full">
                  <p className="text-ink dark:text-white font-medium text-[15px] leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-auto pt-3">
                    <Avatar kind={t.avatar} size={36} />
                    <div>
                      <div
                        className="font-bold text-ink dark:text-white lowercase"
                        style={{ fontSize: 13 }}
                      >
                        {t.name}
                      </div>
                      <Caption className="block">{t.project}</Caption>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
