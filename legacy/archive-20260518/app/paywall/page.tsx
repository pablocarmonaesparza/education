'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Spinner } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import {
  loadLatestDraftForRehydrate,
  upsertIntakeDraft,
} from '@/lib/onboarding/persistIntake';

type Plan = 'monthly' | 'yearly';

const MONTHLY_ANNUALIZED = 19 * 12;
const YEARLY_SAVINGS = MONTHLY_ANNUALIZED - 199;

function PaywallContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canceled = searchParams.get('canceled') === '1';
  const planFromQuery = searchParams.get('plan');
  const [loadingPlan, setLoadingPlan] = useState<Plan | 'free' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preferredPlan, setPreferredPlan] = useState<Plan | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  // Lock síncrono para guardar contra doble-click. React state + `disabled`
  // tiene una ventana de varios ms entre el primer setLoadingPlan y el
  // re-render; en esa ventana el segundo click llega con `loadingPlan=null`
  // y dispara un upsert duplicado. useRef es síncrono y sí cierra la ventana.
  const submitLockRef = useRef(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('preferredPlan');
    const preferred =
      planFromQuery === 'monthly' || planFromQuery === 'yearly'
        ? planFromQuery
        : stored === 'monthly' || stored === 'yearly'
          ? (stored as Plan)
          : null;
    if (preferred) setPreferredPlan(preferred);

    // Guard: user autenticado + sin subscription activa + con projectIdea.
    // Orden importante:
    //   1. auth
    //   2. subscription_active → si ya paga, mandar a /courseCreation (el
    //      propio /courseCreation redirige a /dashboard si ya está generado).
    //      Esto evita rebotes indeseados cuando no hay draft null pero el
    //      user ya está suscrito.
    //   3. rehidratar draft desde DB si sessionStorage se perdió.
    const check = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth/login?redirectedFrom=/paywall');
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('subscription_active')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.subscription_active) {
        router.replace('/courseCreation');
        return;
      }

      if (!sessionStorage.getItem('projectIdea')) {
        const draft = await loadLatestDraftForRehydrate(supabase, user.id);
        if (!draft?.projectIdea) {
          router.replace('/projectDescription');
          return;
        }
        sessionStorage.setItem('intakeResponseId', draft.id);
        sessionStorage.setItem('projectIdea', draft.projectIdea);
        if (draft.courseMode === 'full') sessionStorage.setItem('courseMode', 'full');
        else sessionStorage.removeItem('courseMode');
        if (draft.questionnaire) {
          sessionStorage.setItem(
            'projectContext',
            JSON.stringify(draft.questionnaire)
          );
        }
      }

      setIsChecking(false);
    };
    void check();
  }, [router, planFromQuery]);

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

  const continueFree = async () => {
    // Lock síncrono — cierra la ventana entre dos clicks rápidos antes de que
    // React re-renderice `disabled`. Evita upserts duplicados que crearían
    // dos drafts activos para el mismo user (Codex flagged P1).
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    setError(null);
    setLoadingPlan('free');

    // El tier gratis sirve el catálogo completo (modo "full"), no la ruta
    // personalizada. /courseCreation ramifica entre full/personalized según
    // este flag; sin él cae al endpoint premium /api/generate-course y el
    // proxy responde 402 ("subscription_required"), rompiendo el flujo gratis.
    //
    // Persistimos el cambio en DB ANTES de navegar para que /courseCreation
    // no caiga al path premium si rehidrata desde DB (recarga, tab nuevo,
    // sessionStorage perdido). También copiamos `projectIdea` desde
    // sessionStorage al draft si la DB no lo tiene — en el path normal
    // /projectDescription ya escribió la idea, pero defensivamente cubrimos
    // el caso donde sessionStorage tiene idea sin draft asociado, para que
    // /courseCreation no rebote al user a /projectDescription pidiéndole
    // que escriba de nuevo.
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth/login?redirectedFrom=/paywall');
        return;
      }

      const sessionIdea = sessionStorage.getItem('projectIdea')?.trim() || '';
      const existingId =
        sessionStorage.getItem('intakeResponseId') || undefined;
      const patch: Parameters<typeof upsertIntakeDraft>[2] = {
        courseMode: 'full',
      };
      if (sessionIdea) patch.projectIdea = sessionIdea;

      const result = await upsertIntakeDraft(supabase, user.id, patch, existingId);

      if ('error' in result) {
        setError(
          'No pudimos preparar tu acceso gratis. Intenta de nuevo en un momento.',
        );
        setLoadingPlan(null);
        submitLockRef.current = false;
        return;
      }

      sessionStorage.setItem('intakeResponseId', result.id);
      sessionStorage.setItem('courseMode', 'full');
      router.push('/courseCreation');
    } catch {
      setError('Error inesperado. Intenta de nuevo.');
      setLoadingPlan(null);
      submitLockRef.current = false;
    }
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
        'la ia selecciona las lecciones que necesitas',
        'asistente virtual de seguimiento',
        'cancela cuando quieras',
      ],
      cta: 'empezar mensual',
      popular: preferredPlan ? preferredPlan === 'monthly' : preferredPlan === null,
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

  if (isChecking) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <Spinner />
      </main>
    );
  }

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

        {canceled && (
          <div className="mb-6 mx-auto max-w-md p-4 bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded-2xl text-center">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
              cancelaste el pago. puedes reintentar o continuar con el plan gratis.
            </p>
          </div>
        )}

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

        <p className="text-center text-xs text-ink-muted dark:text-gray-500 mt-8">
          pagos procesados por Stripe. puedes cancelar en cualquier momento.
        </p>
      </div>
    </main>
  );
}

export default function PaywallPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
          <Spinner />
        </main>
      }
    >
      <PaywallContent />
    </Suspense>
  );
}
