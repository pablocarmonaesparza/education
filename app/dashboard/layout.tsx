'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import TutorChatButton from '@/components/dashboard/TutorChatButton';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebar();
  
  return (
    <main className={`transition-all duration-300 min-h-screen ${isExpanded ? 'ml-64' : 'ml-20'}`}>
      <div className="p-6">
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
