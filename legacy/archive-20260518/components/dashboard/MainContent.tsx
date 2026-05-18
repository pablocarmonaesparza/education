'use client';

import { useSidebar } from '@/contexts/SidebarContext';
import { useEffect, useState } from 'react';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebar();
  const [sidebarWidth, setSidebarWidth] = useState('256px');

  useEffect(() => {
    setSidebarWidth(isExpanded ? '256px' : '80px');
    // Actualizar CSS variable para el header fijo
    document.documentElement.style.setProperty('--sidebar-width', sidebarWidth);
  }, [isExpanded, sidebarWidth]);

  return (
    <main
      className={`flex-grow transition-all duration-300 ${
        isExpanded ? 'ml-64' : 'ml-20'
      }`}
    >
      {children}
    </main>
  );
}
