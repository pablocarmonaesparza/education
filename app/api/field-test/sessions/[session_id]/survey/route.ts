import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enforceRateLimit, rateLimiters } from "@/lib/ratelimit";
import { getFieldTestToken } from "@/lib/simulador/field-test/security";
import {
  getFieldTestSession,
  sanitizeText,
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
  if (session.report_status !== "published") {
    return NextResponse.json(
      { error: "La encuesta se habilita después del reporte." },
      { status: 409 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const nps = Number(body.nps);
  const relevanceScore = Number(body.relevance_score);
  const openResponse = sanitizeText(body.open_response, 900);

  if (!Number.isInteger(nps) || nps < 0 || nps > 10) {
    return NextResponse.json({ error: "NPS inválido." }, { status: 400 });
  }
  if (
    !Number.isInteger(relevanceScore) ||
    relevanceScore < 1 ||
    relevanceScore > 5
  ) {
    return NextResponse.json(
      { error: "Relevancia inválida." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .schema("simulador")
    .from("field_test_step_events")
    .select("id")
    .eq("field_test_session_id", session_id)
    .eq("event_type", "reaction_survey_submitted")
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const { error: insertError } = await admin
    .schema("simulador")
    .from("field_test_step_events")
    .insert({
      field_test_session_id: session_id,
      step_key: null,
      event_type: "reaction_survey_submitted",
      payload_json: {
        field_test_session_id: session_id,
        nps,
        relevance_score: relevanceScore,
        open_response: openResponse || null,
        source: "field_test_mini_report",
        report_status: session.report_status,
      },
      metrics_json: {},
    });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    console.error("[field-test/survey] insert failed", insertError);
    return NextResponse.json(
      { error: "No se pudo guardar la encuesta." },
      { status: 500 },
    );
  }

  await admin
    .schema("simulador")
    .from("field_test_sessions")
    .update({ last_event_at: new Date().toISOString() })
    .eq("id", session_id);

  return NextResponse.json({ ok: true });
}
