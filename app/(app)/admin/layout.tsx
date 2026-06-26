import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isStaffEmail } from "@/lib/simulador/is-staff";
import { isDevBypassActive } from "@/lib/dev/devBypass";

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

  // Mismo dev bypass que el layout (app): en dev local / preview el staff puede
  // revisar /admin sin login. NUNCA en producción real.
  const cookieStore = await cookies();
  const devBypass = isDevBypassActive(
    cookieStore.get("itera_dev_bypass")?.value,
  );

  if (!user && !devBypass) {
    redirect(`/auth/login?next=${encodeURIComponent(pathname)}`);
  }

  if (user && !isStaffEmail(user.email) && !devBypass) {
    redirect("/dashboard");
  }

  return children;
}
