'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import TutorChatButton from '@/components/dashboard/TutorChatButton';
import DashboardMobileHeader from '@/components/dashboard/DashboardMobileHeader';
import { SidebarProvider } from '@/contexts/SidebarContext';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [chatWidth, setChatWidth] = useState(256);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const w = getComputedStyle(document.documentElement).getPropertyValue('--chat-width');
      if (w) setChatWidth(parseInt(w, 10) || 256);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    const initial = getComputedStyle(document.documentElement).getPropertyValue('--chat-width');
    if (initial) setChatWidth(parseInt(initial, 10) || 256);
    return () => observer.disconnect();
  }, []);

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
        className="transition-all duration-150 min-h-screen relative pt-14 md:pt-0 ml-0 md:ml-64"
        style={{ marginRight: isMobile ? 0 : `${chatWidth}px` }}
      >
        <div className="px-4 sm:px-6">
          {children}
        </div>
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
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Sidebar />
        <DashboardContent>{children}</DashboardContent>
        <TutorChatButton />
      </div>
    </SidebarProvider>
  );
}

