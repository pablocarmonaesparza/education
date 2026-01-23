'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import TutorChatButton from '@/components/dashboard/TutorChatButton';
import { SidebarProvider } from '@/contexts/SidebarContext';

function DashboardContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="transition-all duration-300 min-h-screen relative ml-64 mr-96">
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

