'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';

function CallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      // Handle OAuth errors
      const oauthError = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      if (oauthError) {
        const errorPage = searchParams.get('from') === 'signup' ? '/auth/signup' : '/auth/login';
        window.location.replace(`${errorPage}?error=${encodeURIComponent(errorDescription || oauthError)}`);
        return;
      }

      // Get the code from URL
      const code = searchParams.get('code');
      if (!code) {
        window.location.replace('/auth/login');
        return;
      }

      try {
        const supabase = createClient();

        // Exchange code for session — browser client has access to PKCE code_verifier cookie
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError || !data?.session?.user) {
          console.error('Code exchange failed:', exchangeError);
          const errorPage = searchParams.get('from') === 'signup' ? '/auth/signup' : '/auth/login';
          window.location.replace(`${errorPage}?error=${encodeURIComponent('Error de autenticación. Por favor intenta de nuevo.')}`);
          return;
        }

        // Session established — determine redirect
        const user = data.session.user;
        const pendingIdea = sessionStorage.getItem('pendingProjectIdea');

        if (pendingIdea) {
          window.location.replace('/onboarding');
          return;
        }

        try {
          const { data: intakeData } = await supabase
            .from('intake_responses')
            .select('generated_path')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          window.location.replace(intakeData?.generated_path ? '/dashboard' : '/onboarding');
        } catch {
          window.location.replace('/onboarding');
        }
      } catch (err) {
        console.error('Callback error:', err);
        window.location.replace('/auth/login?error=unexpected_error');
      }
    };

    handleCallback();
  }, [searchParams]);

  // Blank white screen — same as the existing loading states in the app
  return <div className="min-h-screen bg-white dark:bg-gray-900" />;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-gray-900" />}>
      <CallbackContent />
    </Suspense>
  );
}
