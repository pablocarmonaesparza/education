/**
 * Layout para rutas autenticadas del Simulador.
 *
 * Auth guard: si no hay session válida en Supabase, redirige a /auth/login
 * con `?next=` para retomar el flujo post-login.
 *
 * Asume que el callback de auth (app/auth/callback/route.ts) crea/upserta
 * la row en simulador.users (bridge a auth.users). Si falta, el usuario
 * está logueado en Supabase pero sin row simulador → puede ocurrir en
 * casos legacy de Itera Courses. En esos casos lo enviamos a onboarding.
 */

import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isDevBypassActive } from "@/lib/dev/devBypass";
import { AppShell } from "./AppShell";
import { SimuladorProviders } from "./providers";
import "./simulador.css";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Dev bypass: en dev local está ON por default (cualquier browser entra sin
  // togglear); en Vercel preview es opt-in con cookie `itera_dev_bypass=1`.
  // NUNCA funciona en producción real. Opt-out local con cookie `=0` desde /dev.
  const cookieStore = await cookies();
  const devBypass = isDevBypassActive(
    cookieStore.get("itera_dev_bypass")?.value,
  );

  const pathname = (await headers()).get("x-itera-pathname") ?? "";

  if (!user && !devBypass) {
    redirect(`/auth/login?next=${encodeURIComponent(pathname || "/dashboard")}`);
  }

  return (
    <div className="simulador-root min-h-screen surface-canvas">
      <SimuladorProviders>
        <AppShell>{children}</AppShell>
      </SimuladorProviders>
    </div>
  );
}
