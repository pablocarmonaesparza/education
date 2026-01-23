'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/dashboard/Sidebar';
import TutorChatButton from '@/components/dashboard/TutorChatButton';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { createClient } from '@/lib/supabase/client';

function ProfileButton() {
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

  return (
    <div className="relative">
      <button
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        className="flex items-center gap-3 px-3 py-2 rounded-2xl transition-all duration-150 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={userName}
            className="w-9 h-9 rounded-xl object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-xl bg-[#1472FF] flex items-center justify-center text-white text-sm font-bold">
            {userInitials}
          </div>
        )}
        <div className="text-left hidden sm:block">
          <p className="text-sm font-bold text-[#4b4b4b] dark:text-white">{userName || 'Usuario'}</p>
        </div>
        <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 py-2 z-20 shadow-lg">
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
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebar();
  
  return (
    <main className={`transition-all duration-300 min-h-screen ${isExpanded ? 'ml-64' : 'ml-20'}`}>
      {/* Top Header with Profile */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="flex justify-end items-center h-16 px-6">
          <ProfileButton />
        </div>
      </div>
      
      {/* Content */}
      <div className="px-0">
        {children}
      </div>
    </main>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Sidebar />
        <DashboardContent>{children}</DashboardContent>
        <TutorChatButton />
      </div>
    </SidebarProvider>
  );
}
