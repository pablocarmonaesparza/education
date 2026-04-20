"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

/**
 * Three-plan pricing section:
 *  - Gratis    → signup, no checkout
 *  - Mensual   → signup → onboarding → /checkout?plan=monthly
 *  - Anual     → signup → onboarding → /checkout?plan=yearly
 *
 * The actual checkout happens after the questionnaire, from the paywall
 * step. From the landing we only carry the intent via query string.
 */

type TierId = 'basic' | 'monthly' | 'yearly';

interface Tier {
  id: TierId;
  name: string;
  priceLabel: string;
  priceSuffix?: string;
  popular: boolean;
  description: string;
  footnote: string;
  features: string[];
  cta: string;
}

const tiers: Tier[] = [
  {
    id: 'basic',
    name: 'gratis',
    priceLabel: 'Gratis',
    popular: false,
    description: 'Acceso completo para aprender a tu ritmo.',
    footnote: 'Sin tarjeta de crédito',
    features: [
      'Acceso completo a los 400+ micro-videos (1-3 min c/u)',
      'Contenido organizado en 12 secciones',
      'Acceso a la comunidad general en Slack',
      'Casos de uso enfocados en LATAM',
      'Actualizaciones de contenido incluidas',
    ],
    cta: 'COMENZAR GRATIS',
  },
  {
    id: 'monthly',
    name: 'mensual',
    priceLabel: '$19',
    priceSuffix: '/mes',
    popular: true,
    description: 'La experiencia completa con IA personalizada.',
    footnote: 'Cancela cuando quieras',
    features: [
      'Todo lo del plan Gratis',
      'Curso personalizado generado por AI según tu proyecto',
      'De 400+ videos, la AI selecciona los 10-200 que necesitas',
      'Acceso a la comunidad prioritaria en Discord',
      'Asistente virtual de seguimiento',
    ],
    cta: 'COMENZAR MENSUAL',
  },
  {
    id: 'yearly',
    name: 'anual',
    priceLabel: '$199',
    priceSuffix: '/año',
    popular: false,
    description: 'El plan mensual con 2 meses gratis.',
    footnote: 'Equivale a $16.58/mes',
    features: [
      'Todo lo del plan Mensual',
      'Ahorra $29 USD al año',
      'Mismos beneficios, pagos simplificados',
      'Prioridad en nuevas funciones',
      'Cancela cuando quieras',
    ],
    cta: 'COMENZAR ANUAL',
  },
];

export default function PricingSection() {
  const router = useRouter();

  const handleSelectPlan = (planId: TierId) => {
    // We always go to signup first; after onboarding the paywall step
    // reads this intent and pre-selects the plan.
    const target =
      planId === 'basic'
        ? '/auth/signup'
        : `/auth/signup?plan=${planId}`;
    router.push(target);
  };

  return (
    <section
      id="pricing"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-24 max-md:pt-16 max-md:pb-16"
    >
      <div className="container mx-auto px-4 relative z-10 w-full max-md:px-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-12 max-md:mb-8"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-center text-[#4b4b4b] dark:text-white leading-tight tracking-tight max-md:text-3xl">
            nuestros planes
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto items-stretch">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 3) }}
              viewport={{ once: true }}
              className="h-full flex"
            >
              <Card
                variant="neutral"
                padding="lg"
                className={`relative flex flex-col md:p-6 h-full w-full ${
                  tier.popular
                    ? 'bg-[#1472FF]/10 dark:bg-[#1472FF]/20 border-[#1472FF] dark:border-[#1472FF] border-b-[#1472FF] dark:border-b-[#1472FF]'
                    : ''
                }`}
              >
                {tier.popular && (
                  <div className="flex justify-center -mt-1 mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1472FF] text-white border-transparent font-display">
                      más popular
                    </span>
                  </div>
                )}

                <div className="mb-3">
                  <h3 className="text-3xl md:text-4xl font-extrabold text-[#4b4b4b] dark:text-white tracking-tight lowercase">
                    {tier.name}
                  </h3>
                </div>

                <p className="text-[#777777] dark:text-gray-400 text-sm mb-5">
                  {tier.description}
                </p>

                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-bold text-[#1472FF]">
                      {tier.priceLabel}
                      {tier.priceSuffix && (
                        <span className="text-xl md:text-2xl font-bold">
                          {tier.priceSuffix}
                        </span>
                      )}
                    </span>
                    {tier.priceLabel !== 'Gratis' && (
                      <span className="text-[#777777] dark:text-gray-400 text-xs md:text-sm">
                        USD
                      </span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-[#777777] dark:text-gray-400 mt-1">
                    {tier.footnote}
                  </p>
                </div>

                <ul className="space-y-2 mb-4 flex-1">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 flex-shrink-0 text-[#22c55e] mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-xs md:text-sm text-[#4b4b4b] dark:text-gray-300 leading-snug">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={tier.popular ? 'primary' : 'outline'}
                  depth={tier.popular ? 'bottom' : 'full'}
                  size="none"
                  rounded2xl
                  onClick={() => handleSelectPlan(tier.id)}
                  className={`w-full py-4 text-sm md:text-base mt-auto ${
                    !tier.popular
                      ? 'text-[#1472FF] border-[#1472FF] hover:bg-[#1472FF]/5 dark:hover:bg-[#1472FF]/10'
                      : ''
                  }`}
                >
                  {tier.cta}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        viewport={{ once: true }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block"
      >
        <button
          onClick={() => {
            const element = document.getElementById('faq');
            if (element) element.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-1 cursor-pointer group"
        >
          <span className="text-sm font-semibold tracking-wide text-black/40 dark:text-white/40 group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors">
            FAQ
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
    </section>
  );
}
