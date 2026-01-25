'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', user.id)
          .single();
        
        setUser({
          ...user,
          profile: profile || { name: user.user_metadata?.name, email: user.email }
        });
      }
    }
    fetchUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const userName = user?.profile?.name || user?.profile?.email?.split('@')[0] || '';
  const userInitials = userName
    ? userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';
  const avatarUrl = user?.user_metadata?.avatar_url;

  const navItems = [
    {
      name: 'Inicio',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Retos',
      href: '/dashboard/retos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen bg-white dark:bg-gray-950 border-r-2 border-gray-200 dark:border-gray-800 flex flex-col z-50 w-64">
      {/* Logo */}
      <div className="p-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/images/itera-logo-light.png"
            alt="Itera"
            width={100}
            height={32}
            className="h-7 w-auto dark:hidden"
            priority
          />
          <Image
            src="/images/itera-logo-dark.png"
            alt="Itera"
            width={100}
            height={32}
            className="h-7 w-auto hidden dark:block"
            priority
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-150 ${
                    isActive
                      ? 'bg-[#1472FF] text-white border-b-4 border-[#0E5FCC]'
                      : 'text-[#4b4b4b] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="font-bold uppercase">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section - Profile */}
      <div className="p-3">
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl transition-all duration-150 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-[#1472FF] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {userInitials}
              </div>
            )}
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-sm font-bold text-[#4b4b4b] dark:text-white truncate">{userName || 'Usuario'}</p>
              <p className="text-xs text-[#777777] dark:text-gray-400 truncate">{user?.profile?.email}</p>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowProfileMenu(false)} 
              />
              <div className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-gray-950 rounded-2xl border-2 border-gray-200 dark:border-gray-700 py-2 z-20 shadow-lg">
                <button className="w-full rounded-2xl font-bold uppercase tracking-wide text-sm bg-[#1472FF] text-white border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-0 active:mt-1 transition-all duration-150 flex items-center justify-center gap-2 px-4 py-3 mx-2 mb-2">
                  Mejorar Plan
                </button>
                <Link
                  href="/dashboard/perfil"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#4b4b4b] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Mi Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
