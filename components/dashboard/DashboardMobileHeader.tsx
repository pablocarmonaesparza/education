'use client';

import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/shared/Button';
import { useSidebar } from '@/contexts/SidebarContext';

export default function DashboardMobileHeader() {
  const { setMobileOpen } = useSidebar();

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-14 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between px-4">
      <Link href="/dashboard" className="flex items-center">
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
      <Button
        variant="outline"
        size="icon"
        rounded2xl={false}
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </Button>
    </header>
  );
}
