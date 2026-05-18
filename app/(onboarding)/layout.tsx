/**
 * Layout para rutas de onboarding B2B (buyer signup → org → team → invite).
 *
 * Auth guard: igual que (app)/layout — redirect a /auth/login si no hay session.
 * Wrappea con .simulador-root + SimuladorProviders + simulador.css.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  if (!user) {
    redirect("/auth/login?next=/onboarding/org");
  }

  return (
    <div className="simulador-root dark min-h-screen surface-canvas">
      <SimuladorProviders>{children}</SimuladorProviders>
    </div>
  );
}
