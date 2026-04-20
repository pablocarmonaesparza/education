'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from './utils';

/**
 * Lazy-initializes the Supabase browser client and checks configuration.
 * Replaces the duplicated useEffect in login/signup pages.
 */
export function useSupabaseInit() {
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);
  const [showSupabaseWarning, setShowSupabaseWarning] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsMounted(true);

    const urlError = searchParams.get('error');
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }

    if (typeof window !== 'undefined') {
      if (isSupabaseConfigured()) {
        try {
          setSupabase(createClient());
          setShowSupabaseWarning(false);
        } catch (err: any) {
          console.error('Error initializing Supabase client:', err);
          setShowSupabaseWarning(true);
        }
      } else {
        setShowSupabaseWarning(true);
      }
    }
  }, [searchParams]);

  return { supabase, showSupabaseWarning, isMounted, error, setError };
}
