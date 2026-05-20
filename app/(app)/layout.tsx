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

  // Dev bypass: en development con cookie `itera_dev_bypass=1`, skip el auth
  // guard para que se puedan revisar todas las pantallas sin login.
  // Activable desde /dev. NUNCA funciona en producción.
  const cookieStore = await cookies();
  const devBypass =
    process.env.NODE_ENV !== "production" &&
    cookieStore.get("itera_dev_bypass")?.value === "1";

  if (!user && !devBypass) {
    const pathname = (await headers()).get("x-itera-pathname") ?? "/dashboard";
    redirect(`/auth/login?next=${encodeURIComponent(pathname)}`);
  }

  return (
    <div className="simulador-root min-h-screen surface-canvas">
      <SimuladorProviders>{children}</SimuladorProviders>
    </div>
  );
}
