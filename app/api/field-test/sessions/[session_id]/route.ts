import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFieldTestToken } from "@/lib/simulador/field-test/security";
import {
  getFieldTestSession,
  latestFieldTestResponses,
} from "@/lib/simulador/field-test/service";
import { buildRuntimeCaseMeta } from "@/lib/simulador/runtime-case-meta";

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
  const admin = createAdminClient();
  const [{ data: caseTemplate }, { data: variant }] = await Promise.all([
    admin
      .schema("simulador")
      .from("case_templates")
      .select(
        "id, slug, version, title, difficulty, duration_estimate_min, level_primary, career_key",
      )
      .eq("id", session.case_template_id)
      .maybeSingle(),
    admin
      .schema("simulador")
      .from("case_variants")
      .select("id, slug, variant_role, level, career_key")
      .eq("id", session.case_variant_id)
      .maybeSingle(),
  ]);
  const caseMeta = caseTemplate
    ? buildRuntimeCaseMeta({
        caseTemplate,
        caseVariant: variant,
      })
    : null;

  return NextResponse.json({
    session: {
      id: session.id,
      status: session.status,
      report_status: session.report_status,
      case_variant_id: session.case_variant_id,
      case_template_id: session.case_template_id,
    },
    responses,
    case_meta: caseMeta,
  });
}
