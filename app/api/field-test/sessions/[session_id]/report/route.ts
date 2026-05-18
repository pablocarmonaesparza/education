import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFieldTestToken } from "@/lib/simulador/field-test/security";
import {
  getFieldTestSession,
  insertFieldTestEvent,
} from "@/lib/simulador/field-test/service";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ session_id: string }> },
) {
  const { session_id } = await params;
  const token = getFieldTestToken(req);
  if (!token) {
    return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
  }

  const session = await getFieldTestSession({ sessionId: session_id, token });
  if (!session) {
    return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data: report } = await admin
    .schema("simulador")
    .from("field_test_reports")
    .select("id, status, payload_json, generated_at")
    .eq("field_test_session_id", session_id)
    .maybeSingle();

  if (!report) {
    return NextResponse.json({
      status: "none",
      session_status: session.status,
      message:
        session.status === "failed"
          ? "No se pudo generar el reporte preliminar."
          : "Evaluación en curso.",
    });
  }

  await insertFieldTestEvent({
    sessionId: session_id,
    eventType: "report_viewed",
    payload: { report_id: report.id },
  });

  return NextResponse.json({
    status: report.status,
    report_id: report.id,
    generated_at: report.generated_at,
    payload: report.payload_json,
  });
}
