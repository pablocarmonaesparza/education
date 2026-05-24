import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isStaffEmail } from "@/lib/simulador/is-staff";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = (await headers()).get("x-itera-pathname") ?? "/admin";

  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(pathname)}`);
  }

  if (!isStaffEmail(user.email)) {
    redirect("/staff");
  }

  return children;
}
