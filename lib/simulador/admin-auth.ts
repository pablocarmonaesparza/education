import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isStaffEmail } from "@/lib/simulador/is-staff";
import { isDevBypassActive } from "@/lib/dev/devBypass";

/**
 * Gate de staff para las APIs de /admin.
 *
 * Honra el mismo dev bypass que los layouts (app)/(onboarding): en dev local
 * (o Vercel preview con cookie) las superficies de SOLO LECTURA se pueden usar
 * sin login. En producción real es imposible: isDevBypassEnabled() devuelve
 * false incondicionalmente cuando VERCEL_ENV === "production", incluso con
 * NEXT_PUBLIC_DEV_BYPASS_ENABLED seteada (R-06 del RULES_LEDGER).
 *
 * Importante: en modo bypass NO hay sesión, así que `user` puede ser null. Las
 * rutas de MUTACIÓN (que atribuyen la acción a un usuario real, p. ej. audit o
 * review) deben checar `if (!staff.user)` y rechazar — un bypass de dev no debe
 * escribir registros firmados.
 */
export async function requireSimuladorStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const devBypass = isDevBypassActive(
    cookieStore.get("itera_dev_bypass")?.value,
  );

  if (!user) {
    if (devBypass) return { ok: true as const, user: null };
    return {
      ok: false as const,
      response: NextResponse.json({ error: "No autenticado." }, { status: 401 }),
    };
  }

  if (!isStaffEmail(user.email)) {
    if (devBypass) return { ok: true as const, user };
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Acceso restringido a staff de Itera." },
        { status: 403 },
      ),
    };
  }

  return { ok: true as const, user };
}
