import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TutorContent from '@/components/dashboard/TutorContent';

export default async function TutorPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user chats with tutor (in the future, this would come from a chats table)
  // For now, we'll return an empty array or mock data
  const chats: any[] = [];

  return (
    <TutorContent chats={chats} />
  );
}







