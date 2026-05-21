/**
 * GET /api/invitations/[token]
 *
 * Devuelve metadata pública de la invitación para que la landing
 * (/auth/invitation/[token]) muestre nombre de la org + email pre-fill
 * del form sin requerir sesión activa.
 *
 * No autenticado. Sólo retorna info no sensible: email destinatario,
 * nombre de la org, nombre del invitador, status, expiración.
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: inv, error } = await admin
    .schema("simulador")
    .from("invitations")
    .select(
      "id, email, organization_id, team_id, invited_by, intended_role, status, expires_at",
    )
    .eq("token", token)
    .maybeSingle();

  if (error || !inv) {
    return NextResponse.json(
      { error: "Invitación no encontrada." },
      { status: 404 },
    );
  }

  const expired = new Date(inv.expires_at) < new Date();
  const usable = inv.status === "pending" && !expired;

  // Best-effort: nombre de la org y del invitador para mensaje contextual.
  const [orgRes, inviterRes] = await Promise.all([
    admin
      .schema("simulador")
      .from("organizations")
      .select("name")
      .eq("id", inv.organization_id)
      .maybeSingle(),
    admin
      .schema("simulador")
      .from("users")
      .select("full_name, email")
      .eq("id", inv.invited_by)
      .maybeSingle(),
  ]);

  return NextResponse.json({
    email: inv.email,
    organization_name: orgRes.data?.name ?? null,
    inviter_name:
      inviterRes.data?.full_name ?? inviterRes.data?.email ?? null,
    intended_role: inv.intended_role,
    status: inv.status,
    expired,
    usable,
  });
}
