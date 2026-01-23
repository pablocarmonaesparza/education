import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import TutorChatButton from '@/components/dashboard/TutorChatButton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-white dark:bg-gray-950">
      <DashboardNavbar />
      <main className="h-screen overflow-x-hidden overflow-y-auto overscroll-none bg-white dark:bg-gray-950">
        <div className="pt-20 pb-24 min-h-full">
          {children}
        </div>
      </main>
      <TutorChatButton />
    </div>
  );
}
