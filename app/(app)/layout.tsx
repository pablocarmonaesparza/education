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
import { isDevBypassEnabled } from "@/lib/dev/devBypass";
import { AppSidebar } from "@/components/simulador/AppSidebar";
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

  // Dev bypass: en development o Vercel preview, con cookie
  // `itera_dev_bypass=1` activa, skip el auth guard para revisar todas las
  // pantallas sin login. Activable desde /dev. NUNCA funciona en producción
  // real (Vercel production deploy o standalone production).
  const cookieStore = await cookies();
  const devBypass =
    isDevBypassEnabled() &&
    cookieStore.get("itera_dev_bypass")?.value === "1";

  if (!user && !devBypass) {
    const pathname = (await headers()).get("x-itera-pathname") ?? "/dashboard";
    redirect(`/auth/login?next=${encodeURIComponent(pathname)}`);
  }

  return (
    <div className="simulador-root min-h-screen surface-canvas">
      <SimuladorProviders>
        <AppSidebar />
        {/* Offset del contenido para no quedar debajo del sidebar fijo
            (224px). En mobile/tablet (md:) el sidebar está hidden y el
            contenido vuelve a full-width. */}
        <div className="md:pl-[224px]">{children}</div>
      </SimuladorProviders>
    </div>
  );
}
