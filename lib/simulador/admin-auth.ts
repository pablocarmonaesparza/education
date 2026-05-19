import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isStaffEmail } from "@/lib/simulador/is-staff";

export async function requireSimuladorStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "No autenticado." }, { status: 401 }),
    };
  }

  if (!isStaffEmail(user.email)) {
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
