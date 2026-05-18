'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSidebar } from '@/contexts/SidebarContext';
import IconButton from '@/components/ui/IconButton';
import StatsPills from '@/components/dashboard/StatsPills';

export default function DashboardMobileHeader() {
  const { setMobileOpen } = useSidebar();

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-14 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 flex items-center gap-2 px-3">
      <Link href="/dashboard" className="flex items-center shrink-0">
        <Image
          src="/images/itera-logo-light.png"
          alt="Itera"
          width={90}
          height={28}
          className="h-6 w-auto dark:hidden"
        />
        <Image
          src="/images/itera-logo-dark.png"
          alt="Itera"
          width={90}
          height={28}
          className="h-6 w-auto hidden dark:block"
        />
      </Link>
      {/* Gamification pills — same component used in the desktop tutor panel.
          Wrapped in a flex-1 min-w-0 so the pills compress proportionally
          between the logo and the menu button on narrow viewports. */}
      <div className="flex-1 min-w-0">
        <StatsPills />
      </div>
      <IconButton
        variant="outline"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
        className="shrink-0"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </IconButton>
    </header>
  );
}
