'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

export default function DashboardNavbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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
    { href: '/dashboard', label: 'Inicio' },
    { href: '/dashboard/ruta', label: 'Ruta' },
    { href: '/dashboard/salon', label: 'Salón' },
    { href: '/dashboard/retos', label: 'Retos' },
  ];

  // Update indicator position
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
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20 relative">
          
          {/* Logo - Left */}
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/images/logo-dark.png"
              alt="Itera"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Navigation - Center */}
          <div 
            ref={navRef}
            className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-active={isActive}
                  className={`relative pb-1 text-sm font-medium transition-colors duration-300 ${
                    isActive
                      ? 'text-[#1472FF]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            
            {/* Sliding indicator */}
            <div
              className="absolute bottom-0 h-0.5 bg-gradient-to-r from-[#1472FF] to-[#5BA0FF] rounded-full transition-all duration-300"
              style={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
              }}
            />
          </div>

          {/* Right side - Upgrade + Profile */}
          <div className="flex items-center gap-3">
            {/* Upgrade Plan */}
            <button 
              className="hidden md:block px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-all relative bg-transparent"
            >
              <span 
                className="absolute inset-0 rounded-full z-0"
                style={{
                  background: 'linear-gradient(90deg, #1472FF 0%, #5BA0FF 50%, #1472FF 100%)',
                }}
              />
              <span 
                className="absolute inset-[2px] rounded-full bg-white z-[1]"
              />
              <span className="relative z-[2] bg-gradient-to-r from-[#1472FF] to-[#5BA0FF] bg-clip-text text-transparent">
                Mejorar Plan
              </span>
            </button>
            
            {/* Profile button */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="h-10 w-10 rounded-full overflow-hidden border-2 border-transparent hover:border-gray-200 transition-colors focus:outline-none focus:border-gray-300"
              >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1472FF] to-[#5BA0FF] flex items-center justify-center text-white text-xs font-semibold">
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
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-gray-200 py-1 z-20">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{userName || 'Usuario'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.profile?.email}</p>
                  </div>
                  <Link
                    href="/dashboard/perfil"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Mi Perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}



