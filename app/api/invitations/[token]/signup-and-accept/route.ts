/**
 * POST /api/invitations/[token]/signup-and-accept
 *
 * Crea cuenta + acepta invitación en un solo paso.
 *
 * Por qué este endpoint y no el de /accept normal:
 *   - El invitado NO debe pasar por /onboarding/org (su org ya existe).
 *   - El invitado NO debe esperar email de confirmación (la invitación
 *     que el admin envió ya validó el ownership del email).
 *   - El signup normal de Supabase manda email de confirm; aquí lo
 *     saltamos via admin.auth.admin.createUser({ email_confirm: true }).
 *
 * Body: { name: string, password: string, job_title?: string }
 *   (email viene del token, no se acepta del cliente para prevenir hijacking)
 *
 * Respuesta:
 *   200 { ok, email, organization_id, role } — éxito (cliente hace signin)
 *   400 { error } — body inválido / token expirado / email ya registrado
 *   404 { error } — token no encontrado
 *   500 { error } — error interno
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

interface Body {
  name?: string;
  password?: string;
  job_title?: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const name = body.name?.trim();
  const password = body.password;
  const jobTitle = body.job_title?.trim() || null;

  if (!name || name.length < 2) {
    return NextResponse.json(
      { error: "El nombre es obligatorio (mínimo 2 caracteres)." },
      { status: 400 },
    );
  }
  if (!password || password.length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // 1. Resolver invitación.
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
      {
        error:
          inv.status === "accepted"
            ? "Esta invitación ya fue aceptada. Inicia sesión con tu cuenta."
            : `Invitación ya ${inv.status}.`,
      },
      { status: 400 },
    );
  }
  if (new Date(inv.expires_at) < new Date()) {
    return NextResponse.json(
      {
        error:
          "Invitación expirada. Pide al admin de tu organización que reenvíe el invite.",
      },
      { status: 400 },
    );
  }

  // 2. Crear cuenta auth.users con email pre-confirmado (la invitación ya
  //    validó el ownership del email).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: inv.email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      ...(jobTitle ? { job_title: jobTitle } : {}),
      invited_via_token: token,
    },
  });

  if (createErr || !created.user) {
    // Si el email ya existe en auth.users, es un user de otra org o un
    // signup previo. Lo derivamos a login.
    const msg = createErr?.message ?? "";
    if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already been registered")) {
      return NextResponse.json(
        {
          error:
            "Ya existe una cuenta con este email. Inicia sesión y vuelve a abrir el link de invitación.",
          code: "email_already_registered",
        },
        { status: 400 },
      );
    }
    console.error("[api/invitations/signup-and-accept] createUser failed:", createErr);
    return NextResponse.json(
      { error: "No pudimos crear tu cuenta. Reintenta o escríbenos a soporte@itera.la." },
      { status: 500 },
    );
  }

  const authUserId = created.user.id;

  // 3. Bridge auth.users → simulador.users.
  const { data: bridgeId, error: bridgeError } = await admin
    .schema("simulador")
    .rpc("ensure_bridge_user", { p_auth_user_id: authUserId });

  if (bridgeError || !bridgeId) {
    console.error(
      "[api/invitations/signup-and-accept] ensure_bridge_user failed:",
      bridgeError,
    );
    return NextResponse.json(
      { error: "Bridge user no inicializado." },
      { status: 500 },
    );
  }

  // 4. Persistir nombre + puesto en simulador.users.
  const { error: updErr } = await admin
    .schema("simulador")
    .from("users")
    .update({
      full_name: name,
      metadata: jobTitle ? { job_title: jobTitle } : {},
    })
    .eq("id", bridgeId);

  if (updErr) {
    // No bloqueante — el user ya está creado. Loggeamos para audit.
    console.warn(
      "[api/invitations/signup-and-accept] users update failed:",
      updErr,
    );
  }

  // 5. Crear org_membership.
  const { error: orgMemberErr } = await admin
    .schema("simulador")
    .from("organization_memberships")
    .insert({
      organization_id: inv.organization_id,
      user_id: bridgeId,
      role: "viewer",
    });

  if (orgMemberErr && orgMemberErr.code !== "23505") {
    console.error(
      "[api/invitations/signup-and-accept] org_membership failed:",
      orgMemberErr,
    );
    return NextResponse.json(
      { error: "No se pudo crear membresía de organización." },
      { status: 500 },
    );
  }

  // 6. Team membership (si la invitación incluía team_id).
  if (inv.team_id) {
    const { error: teamMemberErr } = await admin
      .schema("simulador")
      .from("team_memberships")
      .insert({
        team_id: inv.team_id,
        user_id: bridgeId,
        role: inv.intended_role,
      });
    if (teamMemberErr && teamMemberErr.code !== "23505") {
      console.error(
        "[api/invitations/signup-and-accept] team_membership failed:",
        teamMemberErr,
      );
      // No bloqueante para v0.
    }
  }

  // 7. Marcar invitación como aceptada.
  const { error: inviteUpdateErr } = await admin
    .schema("simulador")
    .from("invitations")
    .update({
      status: "accepted",
      accepted_by: bridgeId,
      accepted_at: new Date().toISOString(),
    })
    .eq("id", inv.id);

  if (inviteUpdateErr) {
    console.error(
      "[api/invitations/signup-and-accept] invitation update failed:",
      inviteUpdateErr,
    );
    // No bloqueante — el user ya tiene membership. La invitación queda en
    // pending pero ya está usada efectivamente.
  }

  return NextResponse.json({
    ok: true,
    email: inv.email,
    organization_id: inv.organization_id,
    role: inv.intended_role,
  });
}
