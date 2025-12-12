import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import TutorChatButton from '@/components/dashboard/TutorChatButton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden">
      <DashboardNavbar />
      <main className="pt-20 pb-20 h-full overflow-x-hidden overflow-y-auto">
        {children}
      </main>
      <TutorChatButton />
    </div>
  );
}
