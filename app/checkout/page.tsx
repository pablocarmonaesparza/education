'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import OnboardingNavbar from '@/components/onboarding/OnboardingNavbar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Spinner } from '@/components/ui';

/**
 * Paywall shown right after /projectContext (the questionnaire).
 *
 * Three plans:
 *  - Gratis   → no checkout, sets courseMode='full' and continues to /courseCreation
 *  - Mensual  → POST /api/stripe/create-checkout-session { plan: 'monthly' }
 *  - Anual    → POST /api/stripe/create-checkout-session { plan: 'yearly' }
 *
 * Query params:
 *  - canceled=1 → came back from a cancelled Stripe session
 *  - plan=...   → pre-highlight that plan (set from landing intent)
 */

type PlanId = 'basic' | 'monthly' | 'yearly';

interface Plan {
  id: PlanId;
  name: string;
  priceLabel: string;
  priceSuffix?: string;
  footnote: string;
  description: string;
  features: string[];
  popular: boolean;
  cta: string;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'gratis',
    priceLabel: 'Gratis',
    footnote: 'Sin tarjeta de crédito',
    description: 'Accede al curso completo en orden cronológico.',
    features: [
      '400+ micro-videos completos',
      'Sin personalización por IA',
      'Comunidad general en Slack',
    ],
    popular: false,
    cta: 'Continuar gratis',
  },
  {
    id: 'monthly',
    name: 'mensual',
    priceLabel: '$19',
    priceSuffix: '/mes',
    footnote: 'Cancela cuando quieras',
    description: 'Curso personalizado con IA para tu proyecto.',
    features: [
      'Todo lo del plan Gratis',
      'Curso seleccionado por IA (10-200 videos)',
      'Comunidad prioritaria en Discord',
      'Asistente virtual de seguimiento',
    ],
    popular: true,
    cta: 'Pagar $19/mes',
  },
  {
    id: 'yearly',
    name: 'anual',
    priceLabel: '$199',
    priceSuffix: '/año',
    footnote: 'Equivale a $16.58/mes',
    description: 'Mismos beneficios, 2 meses gratis.',
    features: [
      'Todo lo del plan Mensual',
      'Ahorra $29 USD al año',
      'Prioridad en nuevas funciones',
    ],
    popular: false,
    cta: 'Pagar $199/año',
  },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canceled = searchParams.get('canceled') === '1';
  const preSelectedPlan = searchParams.get('plan') as PlanId | null;

  const [isChecking, setIsChecking] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Guard: user must be authenticated and must have completed the
  // projectIdea step (we rely on sessionStorage for that draft).
  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth/login');
        return;
      }

      const projectIdea = sessionStorage.getItem('projectIdea');
      if (!projectIdea) {
        // No draft → send them back to start the onboarding
        router.replace('/projectDescription');
        return;
      }

      // If the user already has an active subscription, skip the paywall
      const { data: profile } = await supabase
        .from('users')
        .select('subscription_active, tier')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.subscription_active) {
        router.replace('/courseCreation');
        return;
      }

      setIsChecking(false);
    };
    check();
  }, [router]);

  const handleSelectFree = () => {
    sessionStorage.setItem('courseMode', 'full');
    router.push('/courseCreation');
  };

  const handleSelectPaid = async (plan: 'monthly' | 'yearly') => {
    setError(null);
    setLoadingPlan(plan);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'No se pudo iniciar el pago');
      }
      if (!data.sessionUrl) {
        throw new Error('Stripe no devolvió una URL de pago');
      }
      window.location.href = data.sessionUrl;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error iniciando el pago. Intenta de nuevo.');
      setLoadingPlan(null);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 flex flex-col">
      <OnboardingNavbar />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <div className="w-full max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#4b4b4b] dark:text-white mb-3 tracking-tight lowercase">
              elige cómo quieres aprender
            </h1>
            <p className="text-base text-[#777777] dark:text-gray-400 max-w-lg mx-auto">
              Ya tenemos tu proyecto y tus respuestas. Elige un plan para
              continuar.
            </p>
          </div>

          {canceled && (
            <div className="mb-6 mx-auto max-w-md p-4 bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded-2xl text-center">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
                Cancelaste el pago. Puedes intentar de nuevo o continuar con el
                plan gratis.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 mx-auto max-w-md p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-2xl text-center">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                {error}
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4 md:gap-6 items-stretch">
            {plans.map((plan) => {
              const highlighted = plan.popular || plan.id === preSelectedPlan;
              return (
                <Card
                  key={plan.id}
                  variant="neutral"
                  padding="lg"
                  className={`relative flex flex-col h-full w-full ${
                    highlighted
                      ? 'bg-[#1472FF]/10 dark:bg-[#1472FF]/20 border-[#1472FF] dark:border-[#1472FF] border-b-[#1472FF] dark:border-b-[#1472FF]'
                      : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="flex justify-center -mt-1 mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1472FF] text-white">
                        más popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-3xl font-extrabold text-[#4b4b4b] dark:text-white tracking-tight lowercase mb-2">
                    {plan.name}
                  </h3>

                  <p className="text-[#777777] dark:text-gray-400 text-sm mb-4">
                    {plan.description}
                  </p>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-[#1472FF]">
                        {plan.priceLabel}
                        {plan.priceSuffix && (
                          <span className="text-xl font-bold">
                            {plan.priceSuffix}
                          </span>
                        )}
                      </span>
                      {plan.priceLabel !== 'Gratis' && (
                        <span className="text-[#777777] dark:text-gray-400 text-xs">
                          USD
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#777777] dark:text-gray-400 mt-1">
                      {plan.footnote}
                    </p>
                  </div>

                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
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
                        <span className="text-xs text-[#4b4b4b] dark:text-gray-300 leading-snug">
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    depth={plan.popular ? 'bottom' : 'full'}
                    size="none"
                    rounded2xl
                    disabled={loadingPlan !== null}
                    onClick={() => {
                      if (plan.id === 'basic') handleSelectFree();
                      else handleSelectPaid(plan.id);
                    }}
                    className={`w-full py-4 text-sm mt-auto ${
                      !plan.popular
                        ? 'text-[#1472FF] border-[#1472FF] hover:bg-[#1472FF]/5'
                        : ''
                    }`}
                  >
                    {loadingPlan === plan.id ? 'Redirigiendo…' : plan.cta}
                  </Button>
                </Card>
              );
            })}
          </div>

          <p className="text-center text-xs text-[#777777] dark:text-gray-500 mt-8">
            Pagos procesados por Stripe. Puedes cancelar en cualquier momento.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
