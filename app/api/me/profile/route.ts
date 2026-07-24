/**
 * /api/me/profile — perfil real del usuario (F4, mata el mock de /perfil).
 *
 * GET  → { profile } con nombre, email, puesto, idioma, notificaciones + org y
 *        equipo (de memberships) + fecha de alta. job_title y notifications
 *        viven en users.metadata (no hay columnas dedicadas); el resto son
 *        columnas reales (full_name, email, locale, created_at).
 * PATCH → guarda full_name / job_title / locale / notifications (autosave del
 *        cliente). Solo campos presentes en el body.
 *
 * En dev bypass resuelve al usuario demo (ana.demo@%). Service role para leer
 * memberships/org/team con nombres.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDevBypassActive } from "@/lib/dev/devBypass";

export const runtime = "nodejs";

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  locale: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

async function resolveUser(): Promise<
  { ok: true; admin: ReturnType<typeof createAdminClient>; user: UserRow } | { ok: false; res: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = createAdminClient();

  let query = admin
    .schema("simulador")
    .from("users")
    .select("id, email, full_name, locale, metadata, created_at");

  if (user) {
    query = query.eq("auth_user_id", user.id);
  } else {
    const cookieStore = await cookies();
    if (!isDevBypassActive(cookieStore.get("itera_dev_bypass")?.value)) {
      return { ok: false, res: NextResponse.json({ error: "Not signed in." }, { status: 401 }) };
    }
    query = query.ilike("email", "ana.demo@%");
  }

  const { data } = await query.limit(1).maybeSingle();
  if (!data) {
    return { ok: false, res: NextResponse.json({ error: "User not found." }, { status: 404 }) };
  }
  return { ok: true, admin, user: data as UserRow };
}

function initialsFrom(name: string | null, email: string): string {
  const base = (name ?? email).trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

async function serialize(admin: ReturnType<typeof createAdminClient>, u: UserRow) {
  const meta = (u.metadata ?? {}) as Record<string, unknown>;

  // Org + equipo del usuario (el primero que tenga).
  const { data: orgMem } = await admin
    .schema("simulador")
    .from("organization_memberships")
    .select("organization_id")
    .eq("user_id", u.id)
    .limit(1)
    .maybeSingle();
  let orgName: string | null = null;
  if (orgMem?.organization_id) {
    const { data: org } = await admin
      .schema("simulador")
      .from("organizations")
      .select("name")
      .eq("id", orgMem.organization_id)
      .maybeSingle();
    orgName = (org?.name as string) ?? null;
  }

  const { data: teamMem } = await admin
    .schema("simulador")
    .from("team_memberships")
    .select("team_id")
    .eq("user_id", u.id)
    .limit(1)
    .maybeSingle();
  let teamName: string | null = null;
  if (teamMem?.team_id) {
    const { data: team } = await admin
      .schema("simulador")
      .from("teams")
      .select("name")
      .eq("id", teamMem.team_id)
      .maybeSingle();
    teamName = (team?.name as string) ?? null;
  }

  return {
    full_name: u.full_name ?? "",
    email: u.email,
    initials: initialsFrom(u.full_name, u.email),
    job_title: typeof meta.job_title === "string" ? meta.job_title : "",
    locale: u.locale ?? "es-419",
    notifications_enabled: meta.notifications_enabled !== false,
    org_name: orgName,
    team_name: teamName,
    member_since: u.created_at,
  };
}

export async function GET() {
  const r = await resolveUser();
  if (!r.ok) return r.res;
  return NextResponse.json({ profile: await serialize(r.admin, r.user) });
}

export async function PATCH(req: NextRequest) {
  const r = await resolveUser();
  if (!r.ok) return r.res;
  const { admin, user } = r;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  const meta = { ...((user.metadata ?? {}) as Record<string, unknown>) };
  let metaTouched = false;

  if (typeof body.full_name === "string") {
    const name = body.full_name.trim();
    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    update.full_name = name;
  }
  if (typeof body.locale === "string" && body.locale.trim()) {
    update.locale = body.locale.trim();
  }
  if (typeof body.job_title === "string") {
    meta.job_title = body.job_title.trim();
    metaTouched = true;
  }
  if (typeof body.notifications_enabled === "boolean") {
    meta.notifications_enabled = body.notifications_enabled;
    metaTouched = true;
  }
  if (metaTouched) update.metadata = meta;

  if (Object.keys(update).length > 0) {
    const { error } = await admin
      .schema("simulador")
      .from("users")
      .update(update)
      .eq("id", user.id);
    if (error) {
      console.error("[me/profile] update failed", error);
      return NextResponse.json({ error: "We could not save." }, { status: 500 });
    }
  }

  const { data: fresh } = await admin
    .schema("simulador")
    .from("users")
    .select("id, email, full_name, locale, metadata, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({ profile: await serialize(admin, (fresh ?? user) as UserRow) });
}
