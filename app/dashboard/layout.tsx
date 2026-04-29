'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import GamificationSidebar from '@/components/dashboard/GamificationSidebar';
import FloatingChat from '@/components/dashboard/FloatingChat';
import DashboardMobileHeader from '@/components/dashboard/DashboardMobileHeader';
import { SidebarProvider } from '@/contexts/SidebarContext';

// Anchos fijos de los dos sidebars (deben coincidir con `w-64` en
// `components/dashboard/Sidebar.tsx` y `GamificationSidebar.tsx`).
// Mantenerlos en sincronía si alguno cambia.
const SIDEBAR_WIDTH_PX = 256;

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const h = () => setIsMobile(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  return (
    <>
      <DashboardMobileHeader />
      <main
        className="transition-all duration-150 min-h-screen relative pt-14 md:pt-0 ml-0 md:ml-64 bg-white dark:bg-gray-800"
        style={{ marginRight: isMobile ? 0 : `${SIDEBAR_WIDTH_PX}px` }}
      >
        <div className="px-4 sm:px-6 min-h-full">{children}</div>
      </main>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-white dark:bg-gray-800">
        <Sidebar />
        <DashboardContent>{children}</DashboardContent>
        <GamificationSidebar />
        <FloatingChat />
      </div>
    </SidebarProvider>
  );
}
