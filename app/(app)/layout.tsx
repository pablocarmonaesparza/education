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
import { headers } from "next/headers";
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

  if (!user) {
    const pathname = (await headers()).get("x-itera-pathname") ?? "/dashboard";
    redirect(`/auth/login?next=${encodeURIComponent(pathname)}`);
  }

  return (
    <div className="simulador-root dark min-h-screen surface-canvas">
      <SimuladorProviders>{children}</SimuladorProviders>
    </div>
  );
}
