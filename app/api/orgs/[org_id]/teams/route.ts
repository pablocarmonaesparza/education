/**
 * POST /api/orgs/[org_id]/teams
 *
 * Crea el primer equipo del onboarding, asigna al buyer como manager del team
 * y abre un sprint Marketing/Growth activo. Sin esto, el buyer termina el
 * onboarding pero el dashboard no tiene superficie útil todavía.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { seedOrgWithLibrary } from "@/lib/simulador/generated-cases";

export const runtime = "nodejs";

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

  let body: { name?: string; department_key?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name || name.length < 2) {
    return NextResponse.json(
      { error: "El nombre del equipo debe tener al menos 2 caracteres." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data: bridgeId, error: bridgeError } = await admin
    .schema("simulador")
    .rpc("ensure_bridge_user", { p_auth_user_id: user.id });

  if (bridgeError || !bridgeId) {
    console.error("[api/teams] ensure_bridge_user failed:", bridgeError);
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
      { error: "No tienes permisos de admin en esta organización." },
      { status: 403 },
    );
  }

  const { data: team, error: teamError } = await admin
    .schema("simulador")
    .from("teams")
    .insert({
      organization_id: org_id,
      name,
      department_key: body.department_key ?? null,
    })
    .select("id, name")
    .single();

  if (teamError || !team) {
    console.error("[api/teams] teams.insert failed:", teamError);
    return NextResponse.json(
      { error: "No se pudo crear el equipo." },
      { status: 500 },
    );
  }

  const { error: teamMemberError } = await admin
    .schema("simulador")
    .from("team_memberships")
    .insert({
      team_id: team.id,
      user_id: bridgeId,
      role: "manager",
    });

  if (teamMemberError) {
    console.error("[api/teams] team_memberships.insert failed:", teamMemberError);
    await admin.schema("simulador").from("teams").delete().eq("id", team.id);
    return NextResponse.json(
      { error: "No se pudo asignar el manager al equipo." },
      { status: 500 },
    );
  }

  const { data: sprintPackage } = await admin
    .schema("simulador")
    .from("sprint_packages")
    .select("id")
    .eq("slug", "marketing_30d")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 30);

  const { data: sprint, error: sprintError } = await admin
    .schema("simulador")
    .from("sprints")
    .insert({
      sprint_package_id: sprintPackage?.id ?? null,
      organization_id: org_id,
      team_id: team.id,
      name: "Sprint Marketing/Growth 30d",
      status: "active",
      start_date: startDate.toISOString().slice(0, 10),
      end_date: endDate.toISOString().slice(0, 10),
      target_dimensions: [
        "contexto",
        "datos",
        "ejecucion_ia",
        "validacion",
        "juicio",
        "impacto",
      ],
    })
    .select("id, name, status")
    .single();

  if (sprintError || !sprint) {
    console.error("[api/teams] sprints.insert failed:", sprintError);
    await admin
      .schema("simulador")
      .from("team_memberships")
      .delete()
      .eq("team_id", team.id)
      .eq("user_id", bridgeId);
    await admin.schema("simulador").from("teams").delete().eq("id", team.id);
    return NextResponse.json(
      { error: "No se pudo crear el sprint inicial." },
      { status: 500 },
    );
  }

  // Hook de onboarding: siembra la biblioteca de casos ricos para esta empresa,
  // para que su equipo tenga casos jugables desde el día uno. No bloquea el
  // onboarding si falla. La generación bespoke por empresa (en vivo) es el paso
  // siguiente; esto entrega la biblioteca curada por el motor.
  let casesSeeded = 0;
  try {
    const results = await seedOrgWithLibrary(org_id, team.id, bridgeId);
    casesSeeded = results.filter((r) => r.id).length;
  } catch (e) {
    console.error(
      "[api/teams] seedOrgWithLibrary falló (no bloquea onboarding):",
      e,
    );
  }

  return NextResponse.json({
    id: team.id,
    name: team.name,
    sprint_id: sprint.id,
    sprint_name: sprint.name,
    cases_seeded: casesSeeded,
  });
}
