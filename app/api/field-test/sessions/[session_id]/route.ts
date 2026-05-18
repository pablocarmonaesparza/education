import { NextRequest, NextResponse } from "next/server";
import { getFieldTestToken } from "@/lib/simulador/field-test/security";
import {
  getFieldTestSession,
  latestFieldTestResponses,
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

  const responses = await latestFieldTestResponses(session_id);
  return NextResponse.json({
    session: {
      id: session.id,
      status: session.status,
      report_status: session.report_status,
      case_variant_id: session.case_variant_id,
      case_template_id: session.case_template_id,
    },
    responses,
  });
}
