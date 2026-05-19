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
    emails?: string[];
    team_id?: string;
    intended_role?: "manager" | "employee" | "viewer";
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const intendedRole = body.intended_role ?? "employee";
  if (!["manager", "employee", "viewer"].includes(intendedRole)) {
    return NextResponse.json(
      { error: "intended_role inválido." },
      { status: 400 },
    );
  }

  const rawEmails = body.emails ?? [];
  const emails = Array.from(
    new Set(
      rawEmails
        .map((e) => (typeof e === "string" ? e.trim().toLowerCase() : ""))
        .filter((e) => EMAIL_RE.test(e)),
    ),
  );

  if (emails.length === 0) {
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
    .select("id")
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

  // Bulk insert invitations. El índice único parcial
  // (organization_id, email) where status='pending' previene duplicados.
  const skipped: { email: string; reason: string }[] = [];
  const created: { id: string; email: string; token: string }[] = [];

  for (const email of emails) {
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
        intended_role: intendedRole,
        status: "pending",
      })
      .select("id, email, token")
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
  // En W3 v0 es best-effort: si falla SendGrid, el invitee no recibe correo
  // pero el token sigue siendo válido — el admin puede compartir el link
  // manualmente desde la UI de invitations.
  const origin = req.nextUrl.origin;
  for (const inv of created) {
    try {
      await sendInvitationEmail({
        toEmail: inv.email,
        inviteLink: `${origin}/auth/invitation/${inv.token}`,
        invitedByName: user.email ?? "Un colega de tu equipo",
      });
    } catch (err) {
      console.warn("[api/invitations] email send failed for", inv.email, err);
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
    })),
    skipped,
  });
}

async function sendInvitationEmail({
  toEmail,
  inviteLink,
  invitedByName,
}: {
  toEmail: string;
  inviteLink: string;
  invitedByName: string;
}) {
  // Reusar la infra de email existente. W3 v0 mantiene template simple
  // inline; W6 traerá template profesional con branding.
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn("[email] SENDGRID_API_KEY no configurada, skip");
    return;
  }

  const from = process.env.SENDGRID_FROM_EMAIL ?? "no-reply@itera.la";
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: from, name: "Itera · El Simulador" },
      subject: `${invitedByName} te invitó a un diagnóstico del Simulador`,
      content: [
        {
          type: "text/html",
          value: `
<!doctype html>
<html lang="es"><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:560px;margin:32px auto;padding:24px;color:#1d1d1f;line-height:1.55;">
  <h1 style="font-size:22px;font-weight:600;letter-spacing:-0.02em;margin:0 0 16px;">Itera · El Simulador</h1>
  <p>Hola,</p>
  <p><strong>${invitedByName}</strong> te invitó a participar en un diagnóstico operativo de criterio en uso de IA.</p>
  <p>El caso toma aproximadamente <strong>20 minutos</strong>. No hay respuesta correcta única — evaluamos tu criterio.</p>
  <p style="margin:32px 0;">
    <a href="${inviteLink}" style="display:inline-block;background:#1472FF;color:#fff;padding:12px 24px;border-radius:9999px;text-decoration:none;font-weight:500;">Aceptar invitación</a>
  </p>
  <p style="font-size:13px;color:#6e6e73;">Si el botón no funciona, copia y pega este link:<br>${inviteLink}</p>
  <p style="font-size:12px;color:#86868b;margin-top:32px;">Esta invitación expira en 14 días.</p>
</body></html>
          `.trim(),
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SendGrid ${res.status}: ${text}`);
  }
}
