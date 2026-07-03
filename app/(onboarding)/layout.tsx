/**
 * Layout para rutas de onboarding B2B (buyer signup → org → team → invite).
 *
 * Auth guard: igual que (app)/layout — redirect a /auth/login si no hay session.
 * Wrappea con .simulador-root + SimuladorProviders + simulador.css.
 */

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isDevBypassActive } from "@/lib/dev/devBypass";
import { SimuladorProviders } from "../(app)/providers";
import "../(app)/simulador.css";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Dev bypass: ver app/(app)/layout.tsx — ON por default en dev local.
  const cookieStore = await cookies();
  const devBypass = isDevBypassActive(
    cookieStore.get("itera_dev_bypass")?.value,
  );

  if (!user && !devBypass) {
    redirect("/auth/login?next=/onboarding/org");
  }

  return (
    <div className="simulador-root min-h-screen surface-canvas">
      <SimuladorProviders>{children}</SimuladorProviders>
    </div>
  );
}
