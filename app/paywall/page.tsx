'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

type Plan = 'monthly' | 'yearly';

const MONTHLY_ANNUALIZED = 19 * 12;
const YEARLY_SAVINGS = MONTHLY_ANNUALIZED - 199;

export default function PaywallPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<Plan | 'free' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preferredPlan, setPreferredPlan] = useState<Plan | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('preferredPlan');
    if (stored === 'monthly' || stored === 'yearly') {
      setPreferredPlan(stored);
    }
  }, []);

  const startCheckout = async (plan: Plan) => {
    setError(null);
    setLoadingPlan(plan);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.sessionUrl) {
        throw new Error(data.error || 'no se pudo iniciar el checkout');
      }
      window.location.href = data.sessionUrl;
    } catch (err: any) {
      setError(err.message);
      setLoadingPlan(null);
    }
  };

  const continueFree = () => {
    setLoadingPlan('free');
    router.push('/courseCreation');
  };

  const tiers = [
    {
      id: 'free' as const,
      name: 'gratis',
      price: '$0',
      period: null,
      description: 'acceso al catálogo sin personalización.',
      features: [
        'acceso al catálogo de lecciones',
        'sin ruta personalizada por ia',
        'comunidad general',
      ],
      cta: 'continuar gratis',
      popular: false,
      onClick: continueFree,
    },
    {
      id: 'monthly' as const,
      name: 'mensual',
      price: '$19',
      period: '/ mes',
      description: 'la experiencia completa con ia personalizada.',
      features: [
        'ruta personalizada generada por ia',
        'la ia selecciona los videos que necesitas',
        'asistente virtual de seguimiento',
        'cancela cuando quieras',
      ],
      cta: 'empezar mensual',
      popular: preferredPlan ? preferredPlan === 'monthly' : true,
      onClick: () => startCheckout('monthly'),
    },
    {
      id: 'yearly' as const,
      name: 'anual',
      price: '$199',
      period: '/ año',
      description: `todo lo del mensual con ahorro de $${YEARLY_SAVINGS}.`,
      features: [
        'todo lo del plan mensual',
        `ahorras $${YEARLY_SAVINGS} vs. mensual`,
        'acceso priorizado a nuevas lecciones',
        'cancela cuando quieras',
      ],
      cta: 'empezar anual',
      popular: preferredPlan === 'yearly',
      onClick: () => startCheckout('yearly'),
    },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-6xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-ink dark:text-white tracking-tight mb-3">
            tu ruta está lista
          </h1>
          <p className="text-lg text-ink-muted dark:text-gray-400 max-w-2xl mx-auto">
            elige cómo quieres aprender. puedes cambiar de plan cuando quieras.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6 items-stretch">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
              className="h-full flex"
            >
              <Card
                variant="neutral"
                padding="lg"
                className={`relative flex flex-col md:p-6 h-full w-full ${
                  tier.popular
                    ? 'bg-primary/10 dark:bg-primary/20 border-primary dark:border-primary border-b-primary dark:border-b-primary'
                    : ''
                }`}
              >
                {tier.popular && (
                  <div className="flex justify-center -mt-1 mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary text-white border-transparent font-display">
                      recomendado
                    </span>
                  </div>
                )}

                <div className="mb-3">
                  <h3 className="text-3xl md:text-4xl font-extrabold text-ink dark:text-white tracking-tight">
                    {tier.name}
                  </h3>
                </div>

                <p className="text-ink-muted dark:text-gray-400 text-sm mb-5">
                  {tier.description}
                </p>

                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-bold text-primary">
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="text-ink-muted dark:text-gray-400 text-xs md:text-sm">
                        USD {tier.period}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-2 mb-4 flex-1">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 flex-shrink-0 text-completado mt-0.5"
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
                      <span className="text-xs md:text-sm text-ink dark:text-gray-300 leading-snug">
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
                  onClick={tier.onClick}
                  disabled={loadingPlan !== null}
                  className={`w-full py-4 text-sm md:text-base mt-auto ${
                    !tier.popular
                      ? 'text-primary border-primary hover:bg-primary/5 dark:hover:bg-primary/10'
                      : ''
                  }`}
                >
                  {loadingPlan === tier.id ? 'cargando…' : tier.cta}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {error && (
          <p className="text-center text-sm text-red-500 mt-6">{error}</p>
        )}
      </div>
    </main>
  );
}
