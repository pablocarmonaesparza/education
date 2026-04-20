'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  name: string;
  email: string;
}

/**
 * Centralized auth hook — fetches user + profile, exposes signOut.
 * Replaces duplicated auth logic in DashboardNavbar, Sidebar, DashboardHeader.
 */
export function useAuth() {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: dbProfile } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', user.id)
          .single();

        setUser(user);
        setProfile({
          name: dbProfile?.name || user.user_metadata?.name || user.email?.split('@')[0] || '',
          email: dbProfile?.email || user.email || '',
        });
      }
      setLoading(false);
    }
    fetchUser();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return { user, profile, loading, signOut, supabase };
}
