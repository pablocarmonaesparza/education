'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { CardFlat } from '@/components/ui/Card';
import Divider from '@/components/ui/Divider';

export default function DashboardNavbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRef = useRef<HTMLDivElement>(null);
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

  const navLinks = [
    { href: '/dashboard', label: 'Inicio', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { href: '/dashboard/retos', label: 'Retos', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )},
  ];

  // Update indicator position (desktop only)
  useEffect(() => {
    if (navRef.current) {
      const activeLink = navRef.current.querySelector(`[data-active="true"]`) as HTMLElement;
      if (activeLink) {
        const navRect = navRef.current.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        setIndicatorStyle({
          left: linkRect.left - navRect.left,
          width: linkRect.width,
        });
      }
    }
  }, [pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  // Get user initials
  const userName = user?.profile?.name || user?.profile?.email?.split('@')[0] || '';
  const userInitials = userName
    ? userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';
  const avatarUrl = user?.user_metadata?.avatar_url;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-950">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20 relative">
            
            {/* Logo - Left */}
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/images/itera-logo-light.png"
                alt="Itera"
                width={120}
                height={40}
                className="h-8 w-auto dark:hidden"
                priority
              />
              <Image
                src="/images/itera-logo-dark.png"
                alt="Itera"
                width={120}
                height={40}
                className="h-8 w-auto hidden dark:block"
                priority
              />
            </Link>

            {/* Navigation - Center (Desktop only) */}
            <div 
              ref={navRef}
              className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1"
            >
              {/* Sliding background indicator */}
              <div
                className="absolute h-[calc(100%-8px)] bg-white dark:bg-gray-700 rounded-xl shadow-sm transition-all duration-300 ease-out"
                style={{
                  left: indicatorStyle.left + 4,
                  width: indicatorStyle.width,
                }}
              />
              
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-active={isActive}
                    className={`relative z-10 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide transition-colors duration-300 ${
                      isActive
                        ? 'text-[#4b4b4b] dark:text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Right side - Upgrade + Profile (Desktop) */}
            <div className="hidden md:flex items-center gap-3">
              {/* Upgrade Plan */}
              <Button variant="primary" size="md" rounded2xl>
                Mejorar Plan
              </Button>
              
              {/* Profile button */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="h-10 w-10 rounded-full overflow-hidden border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors focus:outline-none focus:border-gray-300"
                >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1472FF] flex items-center justify-center text-white text-xs font-semibold">
                    {userInitials}
                  </div>
                )}
              </button>

              {/* Profile dropdown */}
              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowProfileMenu(false)} 
                  />
                  <CardFlat className="absolute right-0 top-full mt-2 w-48 py-2 z-20 shadow-lg">
                    <div className="px-4 py-3 border-b-2 border-gray-200 dark:border-gray-900">
                      <p className="text-sm font-bold text-[#4b4b4b] dark:text-white truncate">{userName || 'Usuario'}</p>
                      <p className="text-xs text-[#777777] dark:text-gray-400 truncate">{user?.profile?.email}</p>
                    </div>
                    <Link
                      href="/dashboard/perfil"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#4b4b4b] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Mi Perfil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
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

            {/* Mobile: Profile + Hamburger */}
            <div className="flex md:hidden items-center gap-2">
              {/* Profile button (mobile) */}
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  setShowProfileMenu(!showProfileMenu);
                }}
                className="h-9 w-9 rounded-full overflow-hidden border-2 border-transparent"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1472FF] flex items-center justify-center text-white text-xs font-semibold">
                    {userInitials}
                  </div>
                )}
              </button>

              {/* Hamburger button */}
              <button 
                onClick={() => {
                  setShowProfileMenu(false);
                  setShowMobileMenu(!showMobileMenu);
                }}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {showMobileMenu ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Profile Dropdown */}
        {showProfileMenu && (
          <CardFlat className="md:hidden absolute right-4 top-20 w-48 py-2 z-50 shadow-lg">
            <div className="px-4 py-3 border-b-2 border-gray-200 dark:border-gray-900">
              <p className="text-sm font-bold text-[#4b4b4b] dark:text-white truncate">{userName || 'Usuario'}</p>
              <p className="text-xs text-[#777777] dark:text-gray-400 truncate">{user?.profile?.email}</p>
            </div>
            <Link
              href="/dashboard/perfil"
              onClick={() => setShowProfileMenu(false)}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#4b4b4b] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Mi Perfil
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </CardFlat>
        )}
      </nav>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 top-20 bg-black/20 dark:bg-black/40 z-30 md:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div className={`fixed top-20 left-0 right-0 bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-950 z-40 md:hidden transform transition-transform duration-300 ease-out ${
        showMobileMenu ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="container mx-auto px-4 py-4">
          {/* Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-150 ${
                    isActive
                      ? 'bg-[#1472FF] text-white border-b-4 border-[#0E5FCC]'
                      : 'text-[#4b4b4b] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
                  }`}
                >
                  {link.icon}
                  <span className="font-bold">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <Divider className="my-4" />

          {/* Upgrade Plan Button (Mobile) */}
          <Button variant="primary" size="lg" rounded2xl className="w-full">
            Mejorar Plan
          </Button>
        </div>
      </div>
    </>
  );
}
