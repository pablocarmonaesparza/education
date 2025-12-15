import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import TutorChatButton from '@/components/dashboard/TutorChatButton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen">
      <DashboardNavbar />
      <main className="h-screen overflow-x-hidden overflow-y-auto">
        <div className="pt-20 pb-24 min-h-full">
          {children}
        </div>
      </main>
      <TutorChatButton />
    </div>
  );
}
