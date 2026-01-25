'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export default function DashboardHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<{ name: string | null; email: string } | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Watch for changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    async function fetchUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setUserProfile({
            name: profileData.name,
            email: profileData.email || user.email || '',
          });
        } else {
          setUserProfile({
            name: user.user_metadata?.name || null,
            email: user.email || '',
          });
        }
      }
    }

    fetchUserData();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const getInitials = (name: string | null, email: string): string => {
    if (name) {
      const names = name.trim().split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const userInitials = userProfile ? getInitials(userProfile.name, userProfile.email) : 'U';
  const userDisplayName = userProfile?.name || userProfile?.email?.split('@')[0] || 'Usuario';

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-950 z-30 flex items-center justify-between px-4">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2">
        {isDark ? (
          <Image
            src="/images/itera-logo-dark.png"
            alt="Itera"
            width={120}
            height={40}
            className="h-8 w-auto"
            priority
          />
        ) : (
          <Image
            src="/images/itera-logo-light.png"
            alt="Itera"
            width={120}
            height={40}
            className="h-8 w-auto"
            priority
          />
        )}
      </Link>

      {/* Right side - Settings and Profile */}
      <div className="flex items-center gap-4">
        {/* Settings Button */}
        <button
          onClick={() => setShowSettingsMenu(!showSettingsMenu)}
          className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Configuración"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>

          {/* Settings Dropdown Menu */}
          {showSettingsMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowSettingsMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-950 py-2 z-20">
                <button
                  onClick={() => {
                    setShowSettingsMenu(false);
                    // TODO: Navigate to settings page
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Configuración
                </button>
                <button
                  onClick={() => {
                    setShowSettingsMenu(false);
                    // TODO: Navigate to preferences page
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Preferencias
                </button>
              </div>
            </>
          )}
        </button>

        {/* Profile Button */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Perfil"
          >
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt={userDisplayName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#1472FF] flex items-center justify-center text-white text-sm font-semibold">
                {userInitials}
              </div>
            )}
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-950 py-2 z-20">
                <div className="px-4 py-3 border-b-2 border-gray-200 dark:border-gray-950">
                  <p className="text-sm font-bold text-[#4b4b4b] dark:text-gray-100">{userDisplayName}</p>
                  <p className="text-xs text-[#777777] dark:text-gray-400 truncate">{userProfile?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    // TODO: Navigate to profile page
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Ver Perfil
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cerrar Sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

