import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  assertFieldTestLlmConfigured,
  assertFieldTestRateLimitConfigured,
  getFieldTestToken,
} from "@/lib/simulador/field-test/security";
import {
  evaluateFieldTestSession,
  getFieldTestSession,
  insertFieldTestEvent,
} from "@/lib/simulador/field-test/service";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ session_id: string }> },
) {
  assertFieldTestRateLimitConfigured();
  assertFieldTestLlmConfigured();
  const { session_id } = await params;
  const token = getFieldTestToken(req);
  if (!token) {
    return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
  }

  const session = await getFieldTestSession({ sessionId: session_id, token });
  if (!session) {
    return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
  }

  if (session.status === "published") {
    return NextResponse.json({
      session_id,
      status: "published",
      evaluation_started: false,
    });
  }

  if (session.status === "submitted" || session.status === "evaluating") {
    return NextResponse.json({
      session_id,
      status: session.status,
      evaluation_started: false,
    });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .schema("simulador")
    .from("field_test_sessions")
    .update({
      status: "submitted",
      completed_at: new Date().toISOString(),
    })
    .eq("id", session_id);

  if (error) {
    return NextResponse.json(
      { error: "No se pudo cerrar la sesión." },
      { status: 500 },
    );
  }

  await insertFieldTestEvent({
    sessionId: session_id,
    eventType: "submitted",
    payload: {},
  });

  try {
    await admin
      .schema("simulador")
      .from("field_test_sessions")
      .update({ status: "evaluating" })
      .eq("id", session_id);
    await evaluateFieldTestSession(session_id);
  } catch (err) {
    console.error("[field-test/complete] judge failed", err);
    await admin
      .schema("simulador")
      .from("field_test_sessions")
      .update({ status: "failed", report_status: "failed" })
      .eq("id", session_id);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "No se pudo generar el reporte preliminar.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    session_id,
    status: "published",
    evaluation_started: false,
  });
}
