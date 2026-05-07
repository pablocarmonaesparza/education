'use client';

/**
 * Pricing v2 — porteado del prototipo claude-design (sections-2.jsx:100-182).
 * Tabla de precios 3 columnas (gratis, pro, empresas).
 */

import { motion } from 'framer-motion';
import { Headline, Title, Body, Caption } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';

type CellValue = boolean | string;

interface FeatureRow {
  label: string;
  gratis: CellValue;
  pro: CellValue;
  empresas: CellValue;
}

const features: FeatureRow[] = [
  {
    label: 'lecciones interactivas',
    gratis: 'primeras 20 + fundamentos',
    pro: 'las 100 completas',
    empresas: 'todo de pro + privadas',
  },
  { label: 'ruta personalizada', gratis: true, pro: true, empresas: true },
  { label: 'ejercicios con tu propia IA', gratis: false, pro: true, empresas: true },
  {
    label: 'lecciones nuevas (cada modelo nuevo)',
    gratis: false,
    pro: true,
    empresas: true,
  },
  {
    label: 'soporte',
    gratis: 'comunidad',
    pro: 'prioritario · ≤24h',
    empresas: 'dedicado',
  },
  { label: 'rutas privadas para tu equipo', gratis: false, pro: false, empresas: true },
  { label: 'dashboard de finalización', gratis: false, pro: false, empresas: true },
  { label: 'sso + factura anual', gratis: false, pro: false, empresas: true },
];

const plans = [
  { name: 'gratis', price: '$0', cad: 'para siempre', highlight: false },
  { name: 'pro', price: '$19', cad: 'usd / mes', highlight: true },
  { name: 'empresas', price: 'custom', cad: 'según equipo', highlight: false },
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
    className="text-completado-dark mx-auto block"
    aria-hidden="true"
  >
    <polyline points="4 12 10 18 20 6" />
  </svg>
);

const Cell = ({ v, highlight }: { v: CellValue; highlight?: boolean }) => {
  if (v === true) return <CheckIcon />;
  if (v === false)
    return <span className="text-ink-muted block text-center">—</span>;
  return (
    <span
      className={`text-sm lowercase ${
        highlight ? 'text-ink dark:text-white font-bold' : 'text-ink dark:text-white font-medium'
      }`}
    >
      {v}
    </span>
  );
};

export default function Pricing() {
  return (
    <section id="pricing" className="bg-gray-50 dark:bg-gray-900 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 max-w-3xl"
        >
          <Headline>pricing</Headline>
          <Title className="mt-3">precios honestos · en usd · sin asteriscos</Title>
          <Body className="mt-3.5">
            Cobramos por mes o por año. Cancelas cuando quieras. Siempre en USD vía Stripe.
          </Body>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-x-auto bg-white dark:bg-gray-800"
          style={{ borderBottomWidth: 4 }}
        >
          <div
            className="grid min-w-[760px]"
            style={{ gridTemplateColumns: '1.4fr 1fr 1.2fr 1fr' }}
          >
            {/* header row */}
            <div className="p-6 bg-white dark:bg-gray-800 border-b-2 border-ink dark:border-white">
              <Caption className="uppercase font-bold tracking-wider !text-ink dark:!text-white">
                plan
              </Caption>
            </div>
            {plans.map((p, i) => (
              <div
                key={i}
                className={`p-6 border-b-2 border-l border-ink dark:border-white relative ${
                  p.highlight ? 'bg-primary/10' : 'bg-white dark:bg-gray-800'
                }`}
              >
                {p.highlight && (
                  <span className="absolute top-3 right-3">
                    <Tag variant="success">popular</Tag>
                  </span>
                )}
                <div
                  className="font-display font-extrabold lowercase tracking-tight leading-none text-ink dark:text-white"
                  style={{ fontSize: 26 }}
                >
                  {p.name}
                </div>
                <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 mt-2.5">
                  <span
                    className={`font-display font-extrabold leading-none lowercase tracking-tight ${
                      p.highlight ? 'text-primary-dark' : 'text-ink dark:text-white'
                    }`}
                    style={{ fontSize: 36 }}
                  >
                    {p.price}
                  </span>
                  <span className="text-xs font-semibold text-ink-muted whitespace-nowrap lowercase">
                    {p.cad}
                  </span>
                </div>
              </div>
            ))}
            {/* feature rows */}
            {features.map((row, i) => {
              const last = i === features.length - 1;
              const borderClass = last
                ? ''
                : 'border-b border-gray-200 dark:border-gray-700';
              return (
                <div className="contents" key={i}>
                  <div
                    className={`px-6 py-4 text-sm font-medium text-ink dark:text-gray-300 lowercase ${borderClass}`}
                  >
                    {row.label}
                  </div>
                  <div
                    className={`px-4 py-4 border-l border-gray-200 dark:border-gray-700 flex items-center justify-center ${borderClass}`}
                  >
                    <Cell v={row.gratis} />
                  </div>
                  <div
                    className={`px-4 py-4 border-l border-gray-200 dark:border-gray-700 bg-primary/10 flex items-center justify-center ${borderClass}`}
                  >
                    <Cell v={row.pro} highlight />
                  </div>
                  <div
                    className={`px-4 py-4 border-l border-gray-200 dark:border-gray-700 flex items-center justify-center ${borderClass}`}
                  >
                    <Cell v={row.empresas} />
                  </div>
                </div>
              );
            })}
            {/* CTA row */}
            <div className="p-5 border-t-2 border-ink dark:border-white bg-gray-50 dark:bg-gray-900" />
            <div className="p-4 border-t-2 border-l border-ink dark:border-white bg-white dark:bg-gray-800">
              <Button
                href="/auth/signup"
                variant="outline"
                size="md"
                className="w-full justify-center"
              >
                empezar gratis
              </Button>
            </div>
            <div className="p-4 border-t-2 border-l border-ink dark:border-white bg-primary/10">
              <Button
                href="/auth/signup?plan=pro"
                variant="primary"
                size="md"
                className="w-full justify-center"
              >
                comenzar pro
              </Button>
            </div>
            <div className="p-4 border-t-2 border-l border-ink dark:border-white bg-white dark:bg-gray-800">
              <Button
                href="/empresas"
                variant="outline"
                size="md"
                className="w-full justify-center"
              >
                agendar demo
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
