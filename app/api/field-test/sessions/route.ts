import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enforceRateLimit, rateLimiters } from "@/lib/ratelimit";
import {
  createOpaqueToken,
  assertFieldTestRateLimitConfigured,
  hashRequestPart,
  hashToken,
  requestIp,
  requestUserAgent,
  setFieldTestCookie,
} from "@/lib/simulador/field-test/security";
import {
  FIELD_TEST_CASE_SLUG,
  insertFieldTestEvent,
  latestFieldTestResponses,
  sanitizeText,
} from "@/lib/simulador/field-test/service";
import { buildRuntimeCaseMeta } from "@/lib/simulador/runtime-case-meta";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  assertFieldTestRateLimitConfigured();
  const blocked = await enforceRateLimit(req, rateLimiters.standard);
  if (blocked) return blocked;

  let body: { case_slug?: string; website?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  if (sanitizeText(body.website, 200)) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const caseSlug = sanitizeText(body.case_slug, 120) || FIELD_TEST_CASE_SLUG;
  if (caseSlug !== FIELD_TEST_CASE_SLUG) {
    return NextResponse.json(
      { error: "Este caso no está disponible en field-test." },
      { status: 404 },
    );
  }

  const admin = createAdminClient();
  const existingToken = req.cookies.get("itera_field_test")?.value;
  if (existingToken) {
    const { data: existing } = await admin
      .schema("simulador")
      .from("field_test_sessions")
      .select(
        "id, status, case_template_id, case_variant_id, report_status, expires_at",
      )
      .eq("case_slug", caseSlug)
      .eq("public_token_hash", hashToken(existingToken))
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (
      existing &&
      new Date(String(existing.expires_at)).getTime() > Date.now()
    ) {
      const responses = await latestFieldTestResponses(existing.id as string);
      const caseMeta = await loadCaseMeta({
        admin,
        caseTemplateId: existing.case_template_id as string,
        caseVariantId: existing.case_variant_id as string,
      });
      return NextResponse.json({
        session_id: existing.id,
        status: existing.status,
        report_status: existing.report_status,
        case_template_id: existing.case_template_id,
        case_variant_id: existing.case_variant_id,
        case_meta: caseMeta,
        responses,
        resumed: true,
      });
    }
  }

  const { data: caseTemplate } = await admin
    .schema("simulador")
    .from("case_templates")
    .select(
      "id, slug, version, title, difficulty, duration_estimate_min, level_primary, career_key",
    )
    .eq("slug", caseSlug)
    .eq("status", "active")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!caseTemplate) {
    return NextResponse.json(
      { error: `Caso "${caseSlug}" no encontrado o no activo.` },
      { status: 404 },
    );
  }

  const { data: variant } = await admin
    .schema("simulador")
    .from("case_variants")
    .select("id, slug, variant_role, level, career_key")
    .eq("case_template_id", caseTemplate.id)
    .eq("variant_role", "primary")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!variant) {
    return NextResponse.json(
      { error: `No hay variante primary activa para ${caseSlug}.` },
      { status: 404 },
    );
  }

  const caseMeta = buildRuntimeCaseMeta({
    caseTemplate,
    caseVariant: variant,
  });

  const token = createOpaqueToken();
  const { data: session, error } = await admin
    .schema("simulador")
    .from("field_test_sessions")
    .insert({
      case_slug: caseSlug,
      case_template_id: caseTemplate.id,
      case_variant_id: variant.id,
      public_token_hash: hashToken(token),
      ip_hash: hashRequestPart(requestIp(req)),
      user_agent_hash: hashRequestPart(requestUserAgent(req)),
      metadata_json: {
        source: "landing-field-test",
        protocol: "field_test_v0",
        case_meta: caseMeta,
      },
    })
    .select("id, status, case_template_id, case_variant_id, report_status")
    .single();

  if (error || !session) {
    console.error("[field-test/sessions] insert failed", error);
    return NextResponse.json(
      { error: "No se pudo crear la sesión de prueba." },
      { status: 500 },
    );
  }

  await insertFieldTestEvent({
    sessionId: session.id as string,
    eventType: "field_test_started",
    payload: { case_slug: caseSlug },
  });

  const res = NextResponse.json({
    session_id: session.id,
    status: session.status,
    report_status: session.report_status,
    case_template_id: session.case_template_id,
    case_variant_id: session.case_variant_id,
    case_meta: caseMeta,
    responses: {},
    resumed: false,
  });
  setFieldTestCookie(res, token);
  return res;
}

async function loadCaseMeta({
  admin,
  caseTemplateId,
  caseVariantId,
}: {
  admin: ReturnType<typeof createAdminClient>;
  caseTemplateId: string;
  caseVariantId: string;
}) {
  const [{ data: caseTemplate }, { data: variant }] = await Promise.all([
    admin
      .schema("simulador")
      .from("case_templates")
      .select(
        "id, slug, version, title, difficulty, duration_estimate_min, level_primary, career_key",
      )
      .eq("id", caseTemplateId)
      .maybeSingle(),
    admin
      .schema("simulador")
      .from("case_variants")
      .select("id, slug, variant_role, level, career_key")
      .eq("id", caseVariantId)
      .maybeSingle(),
  ]);

  if (!caseTemplate) return null;
  return buildRuntimeCaseMeta({
    caseTemplate,
    caseVariant: variant,
  });
}
