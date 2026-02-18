'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import { CardFlat } from '@/components/ui/Card';
import { useSidebar } from '@/contexts/SidebarContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen } = useSidebar();
  const [user, setUser] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const supabase = createClient();

  const closeDrawer = () => setMobileOpen(false);

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
      name: 'Sesiones',
      href: '/dashboard/sesiones',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="2" y="4" width="20" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21h8M12 17v4" />
        </svg>
      ),
    },
    {
      name: 'Oportunidades',
      href: '/dashboard/oportunidades',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.547-.547z" />
        </svg>
      ),
    },
    {
      name: 'Network',
      href: '/dashboard/network',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      name: 'Pitch',
      href: '/dashboard/pitch',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      ),
    },
    {
      name: 'Calendario',
      href: '/dashboard/calendario',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Newsletters',
      href: '/dashboard/newsletters',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
    <>
      {/* Overlay when drawer open on mobile */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Cerrar menú"
        onClick={closeDrawer}
        onKeyDown={(e) => e.key === 'Enter' && closeDrawer()}
        className={`fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 flex flex-col z-50 w-64 transform transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo + close on mobile */}
        <div className="p-4 flex items-center justify-between">
          <Link href="/dashboard" onClick={closeDrawer} className="flex items-center">
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
          <IconButton
            variant="outline"
            onClick={closeDrawer}
            aria-label="Cerrar menú"
            className="md:hidden"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </IconButton>
        </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Button
                  href={item.href}
                  variant={isActive ? 'nav-active' : 'nav-inactive'}
                  size="md"
                  rounded2xl
                  className="flex items-center gap-3 justify-start w-full"
                  onClick={closeDrawer}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span>{item.name}</span>
                </Button>
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
              <IconButton as="div" size="lg">
                {userInitials}
              </IconButton>
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
              <CardFlat className="absolute bottom-full mb-2 left-0 right-0 py-2 z-20 shadow-lg">
                <Link
                  href="/dashboard/perfil"
                  onClick={() => { setShowProfileMenu(false); closeDrawer(); }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#4b4b4b] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Mi Perfil
                </Link>
                <button
                  onClick={() => { setShowProfileMenu(false); closeDrawer(); handleLogout(); }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar sesión
                </button>
              </CardFlat>
            </>
          )}
        </div>
      </div>
    </aside>
    </>
  );
}
