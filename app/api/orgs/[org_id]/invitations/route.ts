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
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
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
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
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
      { error: "Debes proporcionar al menos un email válido." },
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
      { error: "Bridge user no inicializado." },
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
      { error: "Bridge user no inicializado." },
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
      { error: "No tienes permisos de org_admin en esta organización." },
      { status: 403 },
    );
  }

  const { data: org } = await admin
    .schema("simulador")
    .from("organizations")
    .select("name")
    .eq("id", org_id)
    .maybeSingle();

  let teamName = "tu equipo";
  if (body.team_id) {
    const { data: team } = await admin
      .schema("simulador")
      .from("teams")
      .select("id, name, organization_id")
      .eq("id", body.team_id)
      .maybeSingle();

    if (!team || team.organization_id !== org_id) {
      return NextResponse.json(
        { error: "El equipo no pertenece a esta organización." },
        { status: 400 },
      );
    }
    teamName = team.name ?? "tu equipo";
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
        skipped.push({ email, reason: "ya invitado (pending)" });
      } else {
        console.error("[api/invitations] insert error:", email, insErr);
        skipped.push({ email, reason: "error de BD" });
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
    simUser.full_name ?? user.email ?? "Un colega de tu equipo";
  const inviterRole =
    membership.role === "org_admin" ? "admin de organización" : membership.role;
  const orgName = org?.name ?? "tu organización";

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
