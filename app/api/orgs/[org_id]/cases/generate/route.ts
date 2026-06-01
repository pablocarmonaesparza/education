/**
 * POST /api/orgs/[org_id]/cases/generate
 *
 * Genera un caso BESPOKE para la empresa, corriendo el motor con el contexto de
 * su onboarding (industria, área, rol). Lo persiste en simulador.generated_cases.
 * Solo org_admin. Los pasos de LLM corren con la llave del entorno (en producción
 * la del cliente).
 *
 * La generación tarda minutos (8+ llamadas de LLM + loop de autocorrección). A
 * escala conviene moverlo a un worker/cola; aquí corre inline con timeout largo.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  generateCaseFromBrief,
  buildBriefFromContext,
} from "@/lib/simulador/casegen-runner";
import { persistGeneratedCase } from "@/lib/simulador/generated-cases";

export const runtime = "nodejs";
export const maxDuration = 300;

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
  const { data: bridgeId, error: bridgeError } = await admin
    .schema("simulador")
    .rpc("ensure_bridge_user", { p_auth_user_id: user.id });
  if (bridgeError || !bridgeId) {
    return NextResponse.json(
      { error: "No se pudo sincronizar tu cuenta." },
      { status: 500 },
    );
  }

  const { data: membership } = await admin
    .schema("simulador")
    .from("organization_memberships")
    .select("role")
    .eq("organization_id", org_id)
    .eq("user_id", bridgeId)
    .eq("role", "org_admin")
    .maybeSingle();
  if (!membership) {
    return NextResponse.json(
      { error: "Necesitas ser admin de la organización." },
      { status: 403 },
    );
  }

  let body: {
    team_id?: string;
    department?: string;
    role?: string;
    level?: string;
    scenario?: string;
    industry?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    /* sin body, se deriva del contexto */
  }

  // Integridad de tenant: el team_id (si viene) debe ser de esta org.
  if (body.team_id) {
    const { data: team } = await admin
      .schema("simulador")
      .from("teams")
      .select("id")
      .eq("id", body.team_id)
      .eq("organization_id", org_id)
      .maybeSingle();
    if (!team) {
      return NextResponse.json(
        { error: "El equipo no pertenece a esta organización." },
        { status: 400 },
      );
    }
  }

  const { data: org } = await admin
    .schema("simulador")
    .from("organizations")
    .select("*")
    .eq("id", org_id)
    .maybeSingle();

  const brief = buildBriefFromContext({
    companyName: (org?.name as string | undefined) ?? "la empresa",
    industry: body.industry ?? (org?.industry as string | undefined) ?? null,
    region: (org?.region as string | undefined) ?? null,
    department: body.department ?? null,
    role: body.role ?? null,
    level: body.level ?? null,
    scenario: body.scenario ?? null,
  });

  const gen = await generateCaseFromBrief(brief, { maxAttempts: 3 });
  if (!gen.ok || !gen.playableCase) {
    return NextResponse.json(
      { ok: false, result: gen.result, diagnostics: gen.diagnostics },
      { status: 422 },
    );
  }

  const persisted = await persistGeneratedCase({
    organizationId: org_id,
    teamId: body.team_id ?? null,
    playableCase: gen.playableCase,
    method: "engine",
    meta: { brief },
    createdBy: bridgeId,
    status: "active",
  });

  return NextResponse.json({
    ok: true,
    case_id: gen.playableCase.caseId,
    generated_case_id: persisted.id,
    title: gen.playableCase.sections[0]?.slides[0]?.title ?? gen.playableCase.caseId,
    total_slides: gen.playableCase.totalSlides,
  });
}
