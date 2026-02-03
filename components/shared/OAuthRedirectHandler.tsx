'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

/**
 * This component handles OAuth redirects that land on the wrong page.
 * If the URL contains a `code` parameter (from OAuth), it redirects to /auth/callback.
 * This is a fallback for when Supabase's redirect URL configuration is incorrect.
 * 
 * NOTE: The proper fix is to configure Supabase Dashboard correctly:
 * Authentication > URL Configuration > Redirect URLs should include:
 * - http://localhost:3000/auth/callback (development)
 * - https://yourdomain.com/auth/callback (production)
 */
export default function OAuthRedirectHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (code) {
      // OAuth code received on wrong page, redirect to callback immediately
      setIsRedirecting(true);
      const callbackUrl = `/auth/callback?code=${code}`;
      window.location.replace(callbackUrl); // Use replace to avoid back button issues
    } else if (error) {
      // OAuth error received, redirect to login with error
      setIsRedirecting(true);
      const loginUrl = `/auth/login?error=${encodeURIComponent(errorDescription || error)}`;
      window.location.replace(loginUrl);
    }
  }, [searchParams, router]);

  // Show a loading overlay while redirecting to prevent flash of content
  if (isRedirecting) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg 
            className="animate-spin h-10 w-10 text-[#1472FF]" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Completando autenticación...
          </p>
        </div>
      </div>
    );
  }

  return null;
}
