'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import OnboardingNavbar from '@/components/onboarding/OnboardingNavbar';
import { Spinner } from '@/components/ui';
import Button from '@/components/ui/Button';

/**
 * Post-Stripe success page.
 *
 * Stripe redirects here with `?session_id=...`. The webhook may not have
 * fired yet (usually lands within a few seconds), so we poll
 * `users.subscription_active` until it flips true, then forward to
 * /courseCreation to trigger the personalized generation.
 *
 * If the user is already mid-onboarding (projectIdea in sessionStorage)
 * we go straight to courseCreation; otherwise to the dashboard.
 */
function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState<'waiting' | 'ready' | 'timeout'>(
    'waiting'
  );

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 30; // ~60s with 2s interval

    const poll = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth/login');
        return;
      }

      const tick = async () => {
        if (cancelled) return;
        attempts += 1;
        const { data: profile } = await supabase
          .from('users')
          .select('subscription_active')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.subscription_active) {
          setStatus('ready');
          const hasDraft =
            typeof window !== 'undefined' &&
            sessionStorage.getItem('projectIdea');
          // If the user just finished onboarding, continue to generation.
          // Otherwise just send them to the dashboard.
          setTimeout(() => {
            router.replace(hasDraft ? '/courseCreation' : '/dashboard');
          }, 800);
          return;
        }

        if (attempts >= maxAttempts) {
          setStatus('timeout');
          return;
        }
        setTimeout(tick, 2000);
      };

      tick();
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [router, sessionId]);

  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-gray-800">
      <OnboardingNavbar />
      <section className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {status === 'waiting' && (
          <>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#4b4b4b] dark:text-white mb-3 tracking-tight lowercase">
              activando tu suscripción
            </h1>
            <p className="text-base text-[#777777] dark:text-gray-400 mb-6">
              Esto toma solo unos segundos…
            </p>
            <Spinner />
          </>
        )}

        {status === 'ready' && (
          <>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#4b4b4b] dark:text-white mb-3 tracking-tight lowercase">
              pago confirmado
            </h1>
            <p className="text-base text-[#777777] dark:text-gray-400">
              Un momento, te llevamos a tu curso…
            </p>
          </>
        )}

        {status === 'timeout' && (
          <>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#4b4b4b] dark:text-white mb-3 tracking-tight lowercase">
              pago recibido
            </h1>
            <p className="text-base text-[#777777] dark:text-gray-400 mb-6 max-w-md">
              Tu pago está procesándose. Si no ves los cambios en un minuto,
              recarga el dashboard.
            </p>
            <Button variant="primary" size="lg" rounded2xl href="/dashboard">
              Ir al dashboard
            </Button>
          </>
        )}
      </section>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
