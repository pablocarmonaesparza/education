'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import TutorChatButton from '@/components/dashboard/TutorChatButton';
import { SidebarProvider } from '@/contexts/SidebarContext';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [chatWidth, setChatWidth] = useState(256);

  useEffect(() => {
    // Listen for CSS variable changes
    const observer = new MutationObserver(() => {
      const width = getComputedStyle(document.documentElement).getPropertyValue('--chat-width');
      if (width) {
        setChatWidth(parseInt(width, 10) || 256);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    });

    // Initial value
    const initialWidth = getComputedStyle(document.documentElement).getPropertyValue('--chat-width');
    if (initialWidth) {
      setChatWidth(parseInt(initialWidth, 10) || 256);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <main
      className="transition-all duration-150 min-h-screen relative ml-64"
      style={{ marginRight: `${chatWidth}px` }}
    >
      {/* Content */}
      <div className="px-6">
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

