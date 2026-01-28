'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';

function CallbackContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Check for OAuth errors
      const oauthError = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      if (oauthError) {
        const errorPage = searchParams.get('from') === 'signup' ? '/auth/signup' : '/auth/login';
        window.location.href = `${errorPage}?error=${encodeURIComponent(errorDescription || oauthError)}`;
        return;
      }

      // Get the code from URL
      const code = searchParams.get('code');
      if (!code) {
        window.location.href = '/auth/login?error=no_code';
        return;
      }

      try {
        const supabase = createClient();

        // Exchange code for session - client-side has access to PKCE code_verifier cookie
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error('Code exchange failed:', exchangeError);
          setError('Error de autenticación. Por favor intenta de nuevo.');
          setTimeout(() => {
            const errorPage = searchParams.get('from') === 'signup' ? '/auth/signup' : '/auth/login';
            window.location.href = `${errorPage}?error=${encodeURIComponent('Error de autenticación. Por favor intenta de nuevo.')}`;
          }, 1500);
          return;
        }

        if (!data?.session?.user) {
          setError('No se pudo obtener la sesión.');
          setTimeout(() => {
            window.location.href = '/auth/login?error=session_error';
          }, 1500);
          return;
        }

        // Session established! Determine where to redirect
        const user = data.session.user;

        // Check for pending project idea
        const pendingIdea = typeof window !== 'undefined' ? sessionStorage.getItem('pendingProjectIdea') : null;
        if (pendingIdea) {
          window.location.href = '/onboarding';
          return;
        }

        // Check if user has a personalized path
        try {
          const { data: intakeData } = await supabase
            .from('intake_responses')
            .select('generated_path')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (intakeData?.generated_path) {
            window.location.href = '/dashboard';
          } else {
            window.location.href = '/onboarding';
          }
        } catch {
          window.location.href = '/onboarding';
        }
      } catch (err) {
        console.error('Callback error:', err);
        setError('Error inesperado. Redirigiendo...');
        setTimeout(() => {
          window.location.href = '/auth/login?error=unexpected_error';
        }, 1500);
      }
    };

    handleCallback();
  }, [searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center">
        {error ? (
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto text-red-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Redirigiendo...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-10 h-10 border-3 border-[#1472FF] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">Autenticando...</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
          <div className="w-10 h-10 border-3 border-[#1472FF] border-t-transparent rounded-full animate-spin" />
        </main>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
