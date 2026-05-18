import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enforceRateLimit, rateLimiters } from "@/lib/ratelimit";
import { getFieldTestToken } from "@/lib/simulador/field-test/security";
import {
  getFieldTestSession,
  insertFieldTestEvent,
  sanitizeText,
  validEmail,
} from "@/lib/simulador/field-test/service";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ session_id: string }> },
) {
  const blocked = await enforceRateLimit(req, rateLimiters.standard);
  if (blocked) return blocked;

  const { session_id } = await params;
  const token = getFieldTestToken(req);
  if (!token) {
    return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
  }

  const session = await getFieldTestSession({ sessionId: session_id, token });
  if (!session) {
    return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const name = sanitizeText(body.name, 120);
  const email = sanitizeText(body.email, 254).toLowerCase();
  const company = sanitizeText(body.company, 200);
  const role = sanitizeText(body.role, 120);
  const teamSize = sanitizeText(body.team_size, 80);

  if (!name || !email || !company) {
    return NextResponse.json(
      { error: "Faltan campos requeridos." },
      { status: 400 },
    );
  }
  if (!validEmail(email)) {
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .schema("simulador")
    .from("field_test_leads")
    .insert({
      field_test_session_id: session_id,
      name,
      email,
      company,
      role: role || null,
      team_size: teamSize || null,
      consent_to_contact: body.consent_to_contact !== false,
      metadata_json: {
        report_status: session.report_status,
      },
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[field-test/lead] insert failed", error);
    return NextResponse.json(
      { error: "No se pudo guardar el contacto." },
      { status: 500 },
    );
  }

  await insertFieldTestEvent({
    sessionId: session_id,
    eventType: "email_captured",
    payload: { lead_id: data.id, company, role, team_size: teamSize },
  });

  return NextResponse.json({ ok: true, id: data.id });
}
