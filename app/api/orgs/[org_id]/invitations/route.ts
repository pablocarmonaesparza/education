/**
 * POST /api/orgs/[org_id]/invitations
 *
 * Crea invitaciones por email para que participantes (managers/employees)
 * se unan a la org. Genera token UUID + envía email con link
 * /auth/invitation/[token].
 *
 * Solo org_admin de la org puede invitar (enforced por RLS + check explícito).
 *
 * Body: {
 *   emails: string[],
 *   team_id?: string,
 *   intended_role: 'manager' | 'employee' | 'viewer'
 * }
 *
 * Respuesta:
 *   200 { invitations: [{id, email, token, status}, ...], skipped: [{email, reason}] }
 *   400 { error } — body inválido
 *   401 { error } — no autenticado
 *   403 { error } — no es org_admin
 */

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendInvitationEmail } from "@/lib/email/simulador";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * GET /api/orgs/[org_id]/invitations
 *
 * Lista las invitaciones de la org para la UI del manager (modal de invitar
 * + checklist de arranque en /staff). Mismo gate que el POST de abajo:
 * auth.getUser → ensure_bridge_user → membresía org_admin explícita.
 *
 * Nota: `email_status` (sent/skipped/failed) NO se persiste — solo existe en
 * la respuesta del POST al momento de enviar. Aquí devolvemos el `status` del
 * ciclo de vida de la invitación (pending/accepted/expired/revoked), que es
 * lo que el dashboard necesita para "N accepted · M pending".
 *
 * Respuesta:
 *   200 {
 *     invitations: [{ id, email, status, intended_role, team, created_at, expires_at }],
 *     counts: { pending, accepted, expired, revoked }
 *   }
 *   401 { error } — no autenticado
 *   403 { error } — no es org_admin
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ org_id: string }> },
) {
  const { org_id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: bridgeId, error: bridgeError } = await admin
    .schema("simulador")
    .rpc("ensure_bridge_user", { p_auth_user_id: user.id });

  if (bridgeError || !bridgeId) {
    console.error("[api/invitations] ensure_bridge_user failed:", bridgeError);
    return NextResponse.json(
      { error: "Bridge user not initialized." },
      { status: 500 },
    );
  }

  const { data: membership } = await admin
    .schema("simulador")
    .from("organization_memberships")
    .select("role")
    .eq("organization_id", org_id)
    .eq("user_id", bridgeId)
    .eq("role", "org_admin")
    .maybeSingle();

  if (!membership) {
    return NextResponse.json(
      { error: "You do not have org_admin permissions in this organization." },
      { status: 403 },
    );
  }

  const { data: rows, error: listError } = await admin
    .schema("simulador")
    .from("invitations")
    .select(
      "id, email, status, intended_role, created_at, expires_at, team:teams(name)",
    )
    .eq("organization_id", org_id)
    .order("created_at", { ascending: false });

  if (listError) {
    console.error("[api/invitations] list error:", listError);
    return NextResponse.json(
      { error: "Could not load invitations." },
      { status: 500 },
    );
  }

  const counts = { pending: 0, accepted: 0, expired: 0, revoked: 0 };
  const invitations = (rows ?? []).map((row) => {
    const status = String(row.status ?? "pending");
    if (status in counts) counts[status as keyof typeof counts] += 1;
    // El embed `team:teams(name)` puede venir como objeto (FK many-to-one) o
    // array según cómo PostgREST detecte la relación; normalizamos a string.
    const team = row.team as
      | { name?: string | null }
      | Array<{ name?: string | null }>
      | null;
    const teamName = Array.isArray(team)
      ? (team[0]?.name ?? null)
      : (team?.name ?? null);
    return {
      id: row.id as string,
      email: row.email as string,
      status,
      intended_role: row.intended_role as string,
      team: teamName,
      created_at: row.created_at as string,
      expires_at: row.expires_at as string | null,
    };
  });

  return NextResponse.json({ invitations, counts });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ org_id: string }> },
) {
  const { org_id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const admin = createAdminClient();

  let body: {
    // Modo nuevo: array de invitaciones con role por persona.
    invitations?: Array<{
      email: string;
      intended_role: "manager" | "employee" | "viewer";
    }>;
    // Modo legacy: array plano de emails + role global.
    emails?: string[];
    team_id?: string;
    intended_role?: "manager" | "employee" | "viewer";
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Normalizar: convertir el shape legacy a invitations[]. Una sola
  // representación interna simplifica el resto del endpoint.
  const invitationsInput: Array<{ email: string; intended_role: string }> = [];
  if (Array.isArray(body.invitations)) {
    for (const i of body.invitations) {
      if (!i || typeof i.email !== "string") continue;
      invitationsInput.push({
        email: i.email,
        intended_role: i.intended_role ?? "employee",
      });
    }
  } else if (Array.isArray(body.emails)) {
    const legacyRole = body.intended_role ?? "employee";
    for (const e of body.emails) {
      if (typeof e !== "string") continue;
      invitationsInput.push({ email: e, intended_role: legacyRole });
    }
  }

  // Dedupe por email + valida role.
  const seen = new Set<string>();
  const invitationsClean: Array<{ email: string; intended_role: string }> = [];
  for (const i of invitationsInput) {
    const email = i.email.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) continue;
    if (seen.has(email)) continue;
    if (!["manager", "employee", "viewer"].includes(i.intended_role)) continue;
    seen.add(email);
    invitationsClean.push({ email, intended_role: i.intended_role });
  }

  if (invitationsClean.length === 0) {
    return NextResponse.json(
      { error: "Provide at least one valid email." },
      { status: 400 },
    );
  }

  // Resolver/crear simulador.users.id del invitador. En producción no
  // dependemos de lectura RLS aquí: primero validamos auth.getUser(), luego
  // validamos membresía org_admin explícitamente con admin client.
  const { data: bridgeId, error: bridgeError } = await admin
    .schema("simulador")
    .rpc("ensure_bridge_user", { p_auth_user_id: user.id });

  if (bridgeError || !bridgeId) {
    console.error("[api/invitations] ensure_bridge_user failed:", bridgeError);
    return NextResponse.json(
      { error: "Bridge user not initialized." },
      { status: 500 },
    );
  }

  const { data: simUser } = await admin
    .schema("simulador")
    .from("users")
    .select("id, email, full_name")
    .eq("id", bridgeId)
    .maybeSingle();

  if (!simUser) {
    return NextResponse.json(
      { error: "Bridge user not initialized." },
      { status: 500 },
    );
  }

  // Verificar que es org_admin (RLS también lo bloquearía pero damos error
  // explícito mejor que silent fail).
  const { data: membership } = await admin
    .schema("simulador")
    .from("organization_memberships")
    .select("role")
    .eq("organization_id", org_id)
    .eq("user_id", simUser.id)
    .eq("role", "org_admin")
    .maybeSingle();

  if (!membership) {
    return NextResponse.json(
      { error: "You do not have org_admin permissions in this organization." },
      { status: 403 },
    );
  }

  // R-03 (pablo-005): gate de seats. La suma de miembros actuales + invitaciones
  // pendientes + este lote no puede exceder los asientos pagados. Nunca corta
  // sesiones en curso: solo bloquea nuevas invitaciones. Sin suscripción activa
  // no hay asientos que gastar. El manager compra más asientos o espera a que
  // alguien libere el suyo.
  const { data: activeSub } = await admin
    .schema("simulador")
    .from("subscriptions")
    .select("seats, status")
    .eq("organization_id", org_id)
    .in("status", ["active", "trial"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const seats = typeof activeSub?.seats === "number" ? activeSub.seats : null;
  if (seats !== null) {
    const [{ count: memberCount }, { count: pendingCount }] = await Promise.all([
      admin
        .schema("simulador")
        .from("organization_memberships")
        .select("user_id", { count: "exact", head: true })
        .eq("organization_id", org_id),
      admin
        .schema("simulador")
        .from("invitations")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", org_id)
        .eq("status", "pending"),
    ]);
    const used = (memberCount ?? 0) + (pendingCount ?? 0);
    const available = seats - used;
    if (invitationsClean.length > available) {
      return NextResponse.json(
        {
          error:
            available <= 0
              ? `You have no seats left (${used} of ${seats} taken by members and pending invitations). Add seats to your plan to invite more people.`
              : `You have ${available} seat(s) left and you are inviting ${invitationsClean.length}. Trim the list or add seats to your plan.`,
          seats,
          used,
          available: Math.max(0, available),
        },
        { status: 409 },
      );
    }
  }

  const { data: org } = await admin
    .schema("simulador")
    .from("organizations")
    .select("name")
    .eq("id", org_id)
    .maybeSingle();

  let teamName = "your team";
  if (body.team_id) {
    const { data: team } = await admin
      .schema("simulador")
      .from("teams")
      .select("id, name, organization_id")
      .eq("id", body.team_id)
      .maybeSingle();

    if (!team || team.organization_id !== org_id) {
      return NextResponse.json(
        { error: "That team does not belong to this organization." },
        { status: 400 },
      );
    }
    teamName = team.name ?? "your team";
  }

  // Bulk insert invitations. El índice único parcial
  // (organization_id, email) where status='pending' previene duplicados.
  const skipped: { email: string; reason: string }[] = [];
  const created: { id: string; email: string; token: string }[] = [];

  for (const { email, intended_role } of invitationsClean) {
    const token = randomUUID();
    const { data: inv, error: insErr } = await admin
      .schema("simulador")
      .from("invitations")
      .insert({
        organization_id: org_id,
        team_id: body.team_id ?? null,
        invited_by: simUser.id,
        email,
        token,
        intended_role,
        status: "pending",
      })
      .select("id, email, token, intended_role")
      .single();

    if (insErr) {
      // 23505 = unique violation (ya hay invitation pending para este email).
      if (insErr.code === "23505") {
        skipped.push({ email, reason: "already invited (pending)" });
      } else {
        console.error("[api/invitations] insert error:", email, insErr);
        skipped.push({ email, reason: "database error" });
      }
      continue;
    }
    created.push({ id: inv.id, email: inv.email, token: inv.token });
  }

  // Enviar emails con el link de invitación.
  // Best-effort: si AgentMail falla, el token sigue siendo válido y el admin
  // puede compartir el link manualmente desde la UI.
  const origin = req.nextUrl.origin;
  const emailStatusById = new Map<string, "sent" | "skipped" | "failed">();
  const emailReasonById = new Map<string, string>();
  const inviterName =
    simUser.full_name ?? user.email ?? "A colleague on your team";
  const inviterRole =
    membership.role === "org_admin" ? "organization admin" : membership.role;
  const orgName = org?.name ?? "your organization";

  for (const inv of created) {
    const result = await sendInvitationEmail({
      to: inv.email,
      acceptUrl: `${origin}/auth/invitation/${inv.token}`,
      inviterName,
      inviterRole,
      teamName,
      orgName,
    });
    if (result.ok) {
      emailStatusById.set(inv.id, "sent");
    } else {
      const status = result.reason === "not_configured" ? "skipped" : "failed";
      emailStatusById.set(inv.id, status);
      emailReasonById.set(inv.id, result.reason);
      if (status === "failed") {
        console.warn(
          "[api/invitations] email send failed for",
          inv.email,
          result.reason,
        );
      }
    }
  }

  return NextResponse.json({
    invitations: created.map((c) => ({
      id: c.id,
      email: c.email,
      // No exponemos el token al cliente excepto para el primer admin que
      // puede necesitarlo para compartir link manual. Riesgo bajo en v0
      // porque el token es de single-use.
      token: c.token,
      status: "pending",
      email_status: emailStatusById.get(c.id) ?? "skipped",
      email_reason: emailReasonById.get(c.id) ?? null,
    })),
    skipped,
  });
}
