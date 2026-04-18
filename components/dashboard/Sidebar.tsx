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
  const { mobileOpen, setMobileOpen, lessonNav } = useSidebar();
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
    { name: 'Inicio', href: '/dashboard', disabled: false },
    { name: 'Sesiones', href: '/dashboard/sesiones', disabled: true },
    { name: 'Oportunidades', href: '/dashboard/oportunidades', disabled: true },
    { name: 'Network', href: '/dashboard/network', disabled: true },
    { name: 'Pitch', href: '/dashboard/pitch', disabled: true },
    { name: 'Calendario', href: '/dashboard/calendario', disabled: true },
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

      {/* Navigation — swaps to lesson nav when a lesson overlay is open. */}
      {lessonNav ? (
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="px-2 pb-3 mb-2 border-b border-gray-200 dark:border-gray-900">
            <h2 className="text-lg font-bold lowercase text-[#4b4b4b] dark:text-gray-200 truncate">
              {lessonNav.phaseName}
            </h2>
          </div>
          <ul className="space-y-2">
            {lessonNav.lessons.map((l) => {
              const isActive = l.id === lessonNav.activeLessonId;
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => {
                      lessonNav.onSelectLesson(l.id);
                      closeDrawer();
                    }}
                    className={[
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                      isActive
                        ? 'bg-[#1472FF] text-white'
                        : l.isCompleted
                          ? 'text-[#4b4b4b] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          : 'text-[#4b4b4b] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                        isActive
                          ? 'bg-white/20 text-white'
                          : l.isCompleted
                            ? 'bg-[#22c55e] text-white'
                            : 'bg-gray-200 dark:bg-gray-800 text-[#777777] dark:text-gray-400',
                      ].join(' ')}
                    >
                      {l.isCompleted ? (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        l.order
                      )}
                    </span>
                    <span className={`text-sm leading-tight truncate ${isActive ? 'font-bold' : 'font-medium'}`}>
                      {l.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : (
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              if (item.disabled) {
                return (
                  <li key={item.href}>
                    <div
                      aria-disabled="true"
                      className="w-full flex items-center justify-start px-4 py-3 text-sm font-bold uppercase tracking-wide rounded-2xl text-gray-300 dark:text-gray-600 cursor-not-allowed select-none"
                    >
                      {item.name}
                    </div>
                  </li>
                );
              }
              return (
                <li key={item.href}>
                  <Button
                    href={item.href}
                    variant={isActive ? 'nav-active' : 'nav-inactive'}
                    size="md"
                    rounded2xl
                    className="flex items-center justify-start w-full"
                    onClick={closeDrawer}
                  >
                    {item.name}
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

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
