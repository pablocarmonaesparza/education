/**
 * /dashboard — router por rol (resuelve la ambigüedad del FRONT_CONTRACT).
 *
 * Es el destino post-login: todos los redirects de auth/error/success apuntan
 * aquí. Ya no renderiza una tercera vista propia (era un fork duplicado del
 * dashboard del manager que vive en /staff). Redirige por rol a la superficie
 * canónica:
 *   - manager / org_admin / billing_admin → /staff  (dashboard de equipo)
 *   - empleado (o cualquier miembro sin scope de manager) → /team
 *   - sin membership → /onboarding/org
 *
 * Decisión de mapa (F3, 2026-07-02): /team y /staff son las entradas canónicas
 * por rol (FRONT_CONTRACT §tabla). /dashboard deja de ser "ambigua".
 */

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDevBypassActive } from "@/lib/dev/devBypass";

export const runtime = "nodejs";

const MANAGER_ORG_ROLES = new Set(["org_admin", "billing_admin"]);

export default async function DashboardRouter() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Dev-only: bajo bypass mandamos a /staff para QA del dashboard de manager.
    const cookieStore = await cookies();
    if (isDevBypassActive(cookieStore.get("itera_dev_bypass")?.value)) {
      redirect("/staff");
    }
    redirect("/auth/login");
  }

  const admin = createAdminClient();
  const { data: simUser } = await admin
    .schema("simulador")
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!simUser) redirect("/onboarding/org");

  const simUserId = simUser.id as string;

  // Rol de equipo: la señal primaria manager/empleado.
  const { data: teamMembership } = await admin
    .schema("simulador")
    .from("team_memberships")
    .select("role")
    .eq("user_id", simUserId)
    .limit(1)
    .maybeSingle();

  if (teamMembership) {
    redirect(teamMembership.role === "manager" ? "/staff" : "/team");
  }

  // Sin equipo: un org_admin/billing_admin sin equipo sigue siendo manager.
  const { data: orgMembership } = await admin
    .schema("simulador")
    .from("organization_memberships")
    .select("role")
    .eq("user_id", simUserId)
    .limit(1)
    .maybeSingle();

  if (!orgMembership) redirect("/onboarding/org");
  redirect(
    MANAGER_ORG_ROLES.has(orgMembership.role as string) ? "/staff" : "/team",
  );
}
