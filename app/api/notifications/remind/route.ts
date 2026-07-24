/**
 * POST /api/notifications/remind
 *
 * El manager empuja a un empleado que no ha empezado (o dejó abandonada) su
 * assessment: manda un email real ("Your Itera assessment is waiting") con el
 * MISMO transporte AgentMail que usan las invitaciones (lib/email/simulador).
 * Sin persistencia nueva: el throttle de 24h vive en el cliente (localStorage).
 *
 * Body: { user_id: string }  — id de simulador.users del empleado.
 *
 * Gate de rol manager — mismo patrón de auth del GET de invitations
 * (auth.getUser → ensure_bridge_user → membresía explícita con admin client),
 * extendido al scope real del dashboard de equipo: autoriza si el caller es
 *   a) manager/admin/org_admin de un team donde el target es miembro, o
 *   b) org_admin de la organización dueña de un team del target.
 *
 * Respuesta:
 *   200 { sent: true }
 *   400 { sent: false, error } — body inválido
 *   401 { sent: false, error } — no autenticado
 *   403 { sent: false, error } — sin permisos de manager sobre esa persona
 *   404 { sent: false, error } — target inexistente o sin email
 *   502 { sent: false, error } — el envío falló (transporte devolvió error)
 *   503 { sent: false, error } — transporte de email no configurado en este env
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendAssessmentReminderEmail } from "@/lib/email/simulador";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { sent: false, error: "Not signed in." },
      { status: 401 },
    );
  }

  let body: { user_id?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { sent: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const targetId = typeof body.user_id === "string" ? body.user_id.trim() : "";
  if (!targetId) {
    return NextResponse.json(
      { sent: false, error: "Provide the user_id of the person to remind." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // Bridge user del caller (mismo RPC que invitations).
  const { data: bridgeId, error: bridgeError } = await admin
    .schema("simulador")
    .rpc("ensure_bridge_user", { p_auth_user_id: user.id });

  if (bridgeError || !bridgeId) {
    console.error("[api/remind] ensure_bridge_user failed:", bridgeError);
    return NextResponse.json(
      { sent: false, error: "Bridge user not initialized." },
      { status: 500 },
    );
  }

  if (bridgeId === targetId) {
    return NextResponse.json(
      { sent: false, error: "You cannot send a reminder to yourself." },
      { status: 400 },
    );
  }

  // Caller (nombre para el copy del email) + target (destinatario).
  const [{ data: caller }, { data: target }] = await Promise.all([
    admin
      .schema("simulador")
      .from("users")
      .select("id, email, full_name")
      .eq("id", bridgeId)
      .maybeSingle(),
    admin
      .schema("simulador")
      .from("users")
      .select("id, email, full_name")
      .eq("id", targetId)
      .maybeSingle(),
  ]);

  if (!caller) {
    return NextResponse.json(
      { sent: false, error: "Bridge user not initialized." },
      { status: 500 },
    );
  }

  if (!target?.email) {
    return NextResponse.json(
      { sent: false, error: "That person was not found." },
      { status: 404 },
    );
  }

  // Teams del target — base para el gate y para el nombre del team en el copy.
  const { data: targetTeamRows } = await admin
    .schema("simulador")
    .from("team_memberships")
    .select("team_id")
    .eq("user_id", targetId);

  const teamIds = [
    ...new Set((targetTeamRows ?? []).map((row) => row.team_id as string)),
  ];

  // a) ¿Caller con rol manager en un team compartido con el target?
  let sharedTeamId: string | null = null;
  if (teamIds.length > 0) {
    const { data: managerRow } = await admin
      .schema("simulador")
      .from("team_memberships")
      .select("team_id, role")
      .eq("user_id", bridgeId)
      .in("team_id", teamIds)
      .in("role", ["manager", "admin", "org_admin"])
      .limit(1)
      .maybeSingle();
    sharedTeamId = (managerRow?.team_id as string | undefined) ?? null;
  }

  // b) Si no, ¿org_admin de la org dueña de algún team del target?
  let authorized = sharedTeamId !== null;
  if (!authorized && teamIds.length > 0) {
    const { data: teamRows } = await admin
      .schema("simulador")
      .from("teams")
      .select("id, organization_id")
      .in("id", teamIds);

    const orgIds = [
      ...new Set(
        (teamRows ?? [])
          .map((row) => row.organization_id as string | null)
          .filter((id): id is string => !!id),
      ),
    ];

    if (orgIds.length > 0) {
      const { data: orgAdminRow } = await admin
        .schema("simulador")
        .from("organization_memberships")
        .select("organization_id")
        .eq("user_id", bridgeId)
        .in("organization_id", orgIds)
        .eq("role", "org_admin")
        .limit(1)
        .maybeSingle();
      authorized = !!orgAdminRow;
    }
  }

  if (!authorized) {
    return NextResponse.json(
      {
        sent: false,
        error: "You do not have manager permissions over this person.",
      },
      { status: 403 },
    );
  }

  // Nombre del team para el copy (best-effort; el compartido primero).
  let teamName = "your team";
  const teamIdForCopy = sharedTeamId ?? teamIds[0] ?? null;
  if (teamIdForCopy) {
    const { data: team } = await admin
      .schema("simulador")
      .from("teams")
      .select("name")
      .eq("id", teamIdForCopy)
      .maybeSingle();
    teamName = (team?.name as string | undefined) ?? teamName;
  }

  const result = await sendAssessmentReminderEmail({
    to: target.email,
    fullName: target.full_name ?? target.email.split("@")[0],
    managerName: caller.full_name ?? caller.email ?? "Your manager",
    teamName,
    dashboardUrl: `${req.nextUrl.origin}/dashboard`,
  });

  if (!result.ok) {
    const notConfigured = result.reason === "not_configured";
    if (!notConfigured) {
      console.warn("[api/remind] email send failed:", target.email, result.reason);
    }
    return NextResponse.json(
      {
        sent: false,
        error: notConfigured
          ? "Email sending is not configured in this environment."
          : "The reminder could not be sent. Try again in a minute.",
      },
      { status: notConfigured ? 503 : 502 },
    );
  }

  return NextResponse.json({ sent: true });
}
