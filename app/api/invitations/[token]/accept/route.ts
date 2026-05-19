/**
 * POST /api/invitations/[token]/accept
 *
 * Acepta una invitación pendiente: linkea al user autenticado con la org
 * de la invitación y le asigna su rol (manager/employee/viewer).
 *
 * Pre-requisitos:
 *   - User ya hizo signup/login con el email de la invitación.
 *   - Token válido y status='pending' y no expirado.
 *
 * Respuesta:
 *   200 { organization_id, role } — éxito
 *   400 { error } — token inválido / expirado / no es para este email
 *   401 { error } — no autenticado
 *   404 { error } — token no encontrado
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendInvitationAcceptedEmail } from "@/lib/email/simulador";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const admin = createAdminClient();

  // Resolver invitación.
  const { data: inv, error: invError } = await admin
    .schema("simulador")
    .from("invitations")
    .select(
      "id, organization_id, team_id, invited_by, email, intended_role, status, expires_at",
    )
    .eq("token", token)
    .maybeSingle();

  if (invError || !inv) {
    return NextResponse.json(
      { error: "Invitación no encontrada." },
      { status: 404 },
    );
  }

  if (inv.status !== "pending") {
    return NextResponse.json(
      { error: `Invitación ya ${inv.status}.` },
      { status: 400 },
    );
  }

  if (new Date(inv.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "Invitación expirada. Pide otra al admin de tu organización." },
      { status: 400 },
    );
  }

  // Verificar que el email de la invitación coincide con el del user logueado.
  // Si no coincide, podría ser intento de hijacking.
  if (
    user.email &&
    inv.email.toLowerCase() !== user.email.toLowerCase()
  ) {
    return NextResponse.json(
      {
        error: `Esta invitación es para ${inv.email}. Loguéate con esa cuenta.`,
      },
      { status: 400 },
    );
  }

  // Resolver/crear simulador.users.id. El flujo de signup puede entregar
  // sesión directa sin pasar por /auth/callback, así que garantizamos bridge
  // aquí antes de crear memberships.
  const { data: bridgeId, error: bridgeError } = await admin
    .schema("simulador")
    .rpc("ensure_bridge_user", { p_auth_user_id: user.id });

  if (bridgeError || !bridgeId) {
    console.error("[api/invitations/accept] ensure_bridge_user failed:", bridgeError);
    return NextResponse.json(
      { error: "Bridge user no inicializado. Refresca y vuelve a intentar." },
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
      { error: "Bridge user no inicializado. Refresca y vuelve a intentar." },
      { status: 500 },
    );
  }

  // Crear org_membership con rol acordado (org_admin si es manager,
  // viewer en otros casos). v0 simple: todos terminan como 'viewer' en
  // org_memberships (para acceso lectura del dashboard), y manager/employee
  // se aplica en team_memberships si hay team_id.
  const { error: orgMemberErr } = await admin
    .schema("simulador")
    .from("organization_memberships")
    .insert({
      organization_id: inv.organization_id,
      user_id: simUser.id,
      role: "viewer",
    });

  if (orgMemberErr && orgMemberErr.code !== "23505") {
    console.error("[api/invitations/accept] org_membership failed:", orgMemberErr);
    return NextResponse.json(
      { error: "No se pudo crear membresía de organización." },
      { status: 500 },
    );
  }

  // Si la invitación incluye team_id, crear team_membership con el rol acordado.
  if (inv.team_id) {
    const { error: teamMemberErr } = await admin
      .schema("simulador")
      .from("team_memberships")
      .insert({
        team_id: inv.team_id,
        user_id: simUser.id,
        role: inv.intended_role,
      });
    if (teamMemberErr && teamMemberErr.code !== "23505") {
      console.error("[api/invitations/accept] team_membership failed:", teamMemberErr);
      // No es bloqueante para v0 — el user ya está en la org.
    }
  }

  // Marcar invitación como aceptada.
  const { error: inviteUpdateErr } = await admin
    .schema("simulador")
    .from("invitations")
    .update({
      status: "accepted",
      accepted_by: simUser.id,
      accepted_at: new Date().toISOString(),
    })
    .eq("id", inv.id);

  if (inviteUpdateErr) {
    console.error(
      "[api/invitations/accept] invitation update failed:",
      inviteUpdateErr,
    );
    return NextResponse.json(
      { error: "No se pudo marcar la invitación como aceptada." },
      { status: 500 },
    );
  }

  // Avisar al invitador que alguien aceptó. Best-effort: nunca bloquea el
  // accept flow ni revierte memberships.
  try {
    const { data: inviter } = await admin
      .schema("simulador")
      .from("users")
      .select("email, full_name")
      .eq("id", inv.invited_by)
      .maybeSingle();

    if (inviter?.email) {
      let invitationQuery = admin
        .schema("simulador")
        .from("invitations")
        .select("status")
        .eq("organization_id", inv.organization_id);
      if (inv.team_id) {
        invitationQuery = invitationQuery.eq("team_id", inv.team_id);
      }
      const { data: invitationRows } = await invitationQuery;
      const statuses = invitationRows ?? [];
      const acceptedCount = statuses.filter(
        (row) => row.status === "accepted",
      ).length;
      const pendingCount = statuses.filter(
        (row) => row.status === "pending",
      ).length;
      const origin = req.nextUrl.origin;

      const result = await sendInvitationAcceptedEmail({
        to: inviter.email,
        inviterName:
          inviter.full_name ?? inviter.email.split("@")[0] ?? "manager",
        inviteeName:
          simUser.full_name ?? user.email?.split("@")[0] ?? "participante",
        inviteeEmail: simUser.email ?? user.email ?? inv.email,
        totalInvited: statuses.length,
        acceptedCount,
        pendingCount,
        dashboardUrl: `${origin}/dashboard`,
      });

      if (!result.ok && result.reason !== "not_configured") {
        console.warn(
          "[api/invitations/accept] accepted email failed:",
          result.reason,
        );
      }
    }
  } catch (err) {
    console.warn("[api/invitations/accept] accepted email threw:", err);
  }

  return NextResponse.json({
    organization_id: inv.organization_id,
    role: inv.intended_role,
  });
}
