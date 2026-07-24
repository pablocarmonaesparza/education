/**
 * POST /api/admin/cases/generate
 *
 * Genera un caso bespoke para una organización desde el backoffice de staff.
 * Es el equivalente staff de POST /api/orgs/[org_id]/cases/generate (que exige
 * ser org_admin de esa org — staff Itera no lo es). Reusa el MISMO motor
 * (buildBriefFromContext + generateCaseFromBrief + persistGeneratedCase); no
 * hay lógica de generación nueva aquí, solo un gate de auth distinto.
 *
 * La generación tarda minutos (8+ llamadas de LLM + loop de autocorrección).
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSimuladorStaff } from "@/lib/simulador/admin-auth";
import {
  generateCaseFromBrief,
  buildBriefFromContext,
} from "@/lib/simulador/casegen-runner";
import { persistGeneratedCase } from "@/lib/simulador/generated-cases";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const staff = await requireSimuladorStaff();
  if (!staff.ok) return staff.response;
  if (!staff.user) {
    return NextResponse.json(
      { error: "Generating a case requires a real session (not dev bypass)." },
      { status: 401 },
    );
  }

  const admin = createAdminClient();
  const { data: staffBridgeUserId, error: bridgeError } = await admin
    .schema("simulador")
    .rpc("ensure_bridge_user", { p_auth_user_id: staff.user.id });
  if (bridgeError || !staffBridgeUserId) {
    return NextResponse.json(
      { error: "Could not initialize the staff user." },
      { status: 500 },
    );
  }

  let body: {
    organization_id?: string;
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
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.organization_id) {
    return NextResponse.json(
      { error: "organization_id is required." },
      { status: 400 },
    );
  }

  const { data: org } = await admin
    .schema("simulador")
    .from("organizations")
    .select("*")
    .eq("id", body.organization_id)
    .maybeSingle();
  if (!org) {
    return NextResponse.json(
      { error: "Organization not found." },
      { status: 404 },
    );
  }

  if (body.team_id) {
    const { data: team } = await admin
      .schema("simulador")
      .from("teams")
      .select("id")
      .eq("id", body.team_id)
      .eq("organization_id", body.organization_id)
      .maybeSingle();
    if (!team) {
      return NextResponse.json(
        { error: "That team does not belong to this organization." },
        { status: 400 },
      );
    }
  }

  const brief = buildBriefFromContext({
    companyName: (org.name as string | undefined) ?? "la empresa",
    industry: body.industry ?? (org.industry as string | undefined) ?? null,
    region: (org.region as string | undefined) ?? null,
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
    organizationId: body.organization_id,
    teamId: body.team_id ?? null,
    playableCase: gen.playableCase,
    method: "engine",
    meta: { brief, generated_by: "admin_staff", staff_user_id: staffBridgeUserId },
    createdBy: staffBridgeUserId,
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
