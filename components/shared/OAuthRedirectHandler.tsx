'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

/**
 * This component handles OAuth redirects that land on the wrong page.
 * If the URL contains a `code` parameter (from OAuth), it redirects to /auth/callback.
 * This is a fallback for when Supabase's redirect URL configuration is incorrect.
 */
export default function OAuthRedirectHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (code) {
      // OAuth code received on wrong page, redirect to callback
      const callbackUrl = `/auth/callback?code=${code}`;
      window.location.href = callbackUrl;
    } else if (error) {
      // OAuth error received, redirect to login with error
      const loginUrl = `/auth/login?error=${encodeURIComponent(errorDescription || error)}`;
      window.location.href = loginUrl;
    }
  }, [searchParams, router]);

  return null;
}
