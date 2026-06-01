/**
 * POST /api/sessions
 *
 * Crea o resume una sesión de diagnóstico para el user autenticado.
 *
 * Body: { case_slug: string }  (ej. "marketing_urgent_campaign_pii")
 *
 * Resuelve el case_variant primario de ese caso y:
 *   - Si ya hay una session in_progress del user → retorna esa (resume).
 *   - Si no → crea una assignment ad-hoc (sprint=null por v0) + session nueva.
 *
 * Respuesta:
 *   200 { session_id, status, case_template_id, case_variant_id, last_step_ordinal }
 *   400 { error } — slug inválido
 *   401 { error } — no autenticado
 *   500 { error } — BD error
 *
 * Nota v0: las sessions de Fase 0 pueden no tener sprint asignado todavía
 * (no hay Sprint package activo). El schema permite sprint_id=null en
 * simulation_sessions, pero assignments requiere sprint_id. Workaround:
 * crear un "sprint personal" implícito por user para Fase 0 standalone.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildRuntimeCaseMeta } from "@/lib/simulador/runtime-case-meta";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  let body: { case_slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const caseSlug = body.case_slug?.trim();
  if (!caseSlug) {
    return NextResponse.json(
      { error: "Falta case_slug en el body." },
      { status: 400 },
    );
  }

  // Resolver simulador.users.id. Usamos admin client después de validar
  // auth.getUser(); evita falsos negativos por RLS/schema exposure cuando
  // el bridge existe pero PostgREST no lo expone al cliente regular.
  const admin = createAdminClient();
  const { data: simUser } = await admin
    .schema("simulador")
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!simUser) {
    return NextResponse.json(
      { error: "Bridge user no inicializado. Re-loguéate." },
      { status: 500 },
    );
  }

  // Orgs del viewer. Las resolvemos ANTES de elegir el template para scopearlo
  // (globales + sus orgs) en la misma query: así un slug bespoke de OTRA org no
  // se encuentra (404) en vez de filtrar su existencia con un 403, y nunca gana
  // por versión más alta sobre un global/propio accesible. El admin client
  // bypassa RLS, por eso el scope es explícito.
  const { data: viewerOrgs } = await admin
    .schema("simulador")
    .from("organization_memberships")
    .select("organization_id")
    .eq("user_id", simUser.id);
  const viewerOrgIds = (viewerOrgs ?? [])
    .map((r) => r.organization_id as string)
    .filter(Boolean);

  // Resolver case_template accesible (global o de una org del viewer), versión
  // activa más alta, + primary variant.
  let templateQuery = admin
    .schema("simulador")
    .from("case_templates")
    .select(
      "id, slug, version, title, difficulty, duration_estimate_min, rubric_id, level_primary, career_key, organization_id",
    )
    .eq("slug", caseSlug)
    .eq("status", "active");
  templateQuery = viewerOrgIds.length
    ? templateQuery.or(
        `organization_id.is.null,organization_id.in.(${viewerOrgIds.join(",")})`,
      )
    : templateQuery.is("organization_id", null);
  const { data: caseTemplate } = await templateQuery
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!caseTemplate) {
    return NextResponse.json(
      { error: `Caso "${caseSlug}" no encontrado o no activo.` },
      { status: 404 },
    );
  }

  // Aislamiento por empresa: ya garantizado arriba. El template resuelto es
  // global (organization_id null) o de una org del viewer, porque la query lo
  // scopeó a `viewerOrgIds`. Un caso bespoke de otra empresa simplemente no se
  // encuentra (404), sin oráculo de existencia.

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

  // ¿Ya tiene una session in_progress de este variant? → resume.
  const { data: existing } = await admin
    .schema("simulador")
    .from("simulation_sessions")
    .select("id, status, metadata")
    .eq("user_id", simUser.id)
    .eq("case_variant_id", variant.id)
    .in("status", ["in_progress", "paused", "not_started"])
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      session_id: existing.id,
      status: existing.status,
      case_template_id: caseTemplate.id,
      case_variant_id: variant.id,
      case_meta: caseMeta,
      resumed: true,
    });
  }

  // ============================================================================
  // Resolver team del user (RLS-safe: solo lee su propia membership).
  // ============================================================================
  // Si el caso es bespoke (org-scoped), el sprint/assignment/session deben colgar
  // de un team de ESA empresa, no del primer team del user (que podría ser de otra
  // org si es multi-org). Filtramos la membership por la org del caso vía join
  // inner a teams. Para casos globales (null) se conserva el comportamiento previo.
  const orgScope = (caseTemplate.organization_id as string | null) ?? null;

  let membershipQuery = admin
    .schema("simulador")
    .from("team_memberships")
    .select("team_id, teams!inner(id, organization_id)")
    .eq("user_id", simUser.id);
  if (orgScope) {
    membershipQuery = membershipQuery.eq("teams.organization_id", orgScope);
  }
  const { data: membershipRow } = await membershipQuery.limit(1).maybeSingle();

  if (!membershipRow) {
    return NextResponse.json(
      {
        error: orgScope
          ? "No perteneces a un equipo de la empresa de este caso. Pide a tu admin que te invite."
          : "No estás asignado a ningún equipo. Pide a tu admin que te invite a un team.",
      },
      { status: 400 },
    );
  }

  const teamRel = (membershipRow as { teams: unknown }).teams;
  const team = (Array.isArray(teamRel) ? teamRel[0] : teamRel) as
    | { id: string; organization_id: string }
    | undefined;

  if (!team) {
    return NextResponse.json({ error: "Team no encontrado." }, { status: 500 });
  }

  // ============================================================================
  // Escalamos a admin client para crear sprint + assignment + session.
  //
  // Por qué: RLS exige `is_org_admin()` para escribir en sprints y assignments
  // (caso B2B normal: admin crea sprint → invita employees → assigna casos).
  // En Fase 0 standalone queremos que el employee pueda auto-iniciar un
  // diagnóstico inmediatamente al unirse a la org.
  //
  // Seguridad: ya validamos auth.getUser() arriba + scope todo a team del user
  // resuelto via team_memberships (RLS-safe). El admin client solo se usa para
  // escribir filas atadas a ese team_id/user_id.
  // ============================================================================
  const SPRINT_NAME = "Fase 0 — Diagnóstico standalone";

  // Upsert sprint (uno por team, reutilizable).
  let { data: sprint } = await admin
    .schema("simulador")
    .from("sprints")
    .select("id")
    .eq("organization_id", team.organization_id)
    .eq("team_id", team.id)
    .eq("name", SPRINT_NAME)
    .maybeSingle();

  if (!sprint) {
    const { data: newSprint, error: sprintErr } = await admin
      .schema("simulador")
      .from("sprints")
      .insert({
        organization_id: team.organization_id,
        team_id: team.id,
        name: SPRINT_NAME,
        status: "active",
        start_date: new Date().toISOString().slice(0, 10),
      })
      .select("id")
      .single();
    if (sprintErr || !newSprint) {
      console.error("[api/sessions] sprint insert failed:", sprintErr);
      return NextResponse.json(
        { error: "No se pudo crear sprint." },
        { status: 500 },
      );
    }
    sprint = newSprint;
  }

  // Resolver o crear assignment (idempotente: unique key sprint+user+variant).
  let { data: assignment } = await admin
    .schema("simulador")
    .from("assignments")
    .select("id")
    .eq("sprint_id", sprint.id)
    .eq("user_id", simUser.id)
    .eq("case_variant_id", variant.id)
    .maybeSingle();

  if (!assignment) {
    const { data: newAssignment, error: assignErr } = await admin
      .schema("simulador")
      .from("assignments")
      .insert({
        sprint_id: sprint.id,
        user_id: simUser.id,
        case_variant_id: variant.id,
        assignment_kind: "primary",
        status: "started",
      })
      .select("id")
      .single();
    if (assignErr || !newAssignment) {
      if (assignErr?.code === "23505") {
        const { data: racedAssignment } = await admin
          .schema("simulador")
          .from("assignments")
          .select("id")
          .eq("sprint_id", sprint.id)
          .eq("user_id", simUser.id)
          .eq("case_variant_id", variant.id)
          .maybeSingle();

        if (racedAssignment) {
          assignment = racedAssignment;

          const { data: racedSession } = await admin
            .schema("simulador")
            .from("simulation_sessions")
            .select("id, status")
            .eq("user_id", simUser.id)
            .eq("case_variant_id", variant.id)
            .in("status", ["in_progress", "paused", "not_started"])
            .order("started_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (racedSession) {
            return NextResponse.json({
              session_id: racedSession.id,
              status: racedSession.status,
              case_template_id: caseTemplate.id,
              case_variant_id: variant.id,
              case_meta: caseMeta,
              resumed: true,
            });
          }
        }
      }

      if (!assignment) {
        console.error("[api/sessions] assignment insert failed:", assignErr);
        return NextResponse.json(
          { error: "No se pudo crear assignment." },
          { status: 500 },
        );
      }
    } else {
      assignment = newAssignment;
    }
  }

  // Crear session. El user puede escribir sus propias sessions vía RLS,
  // pero usamos admin client por consistencia con el flujo anterior y
  // para evitar otro round-trip con cliente distinto.
  const { data: session, error: sessErr } = await admin
    .schema("simulador")
    .from("simulation_sessions")
    .insert({
      assignment_id: assignment.id,
      case_variant_id: variant.id,
      user_id: simUser.id,
      sprint_id: sprint.id,
      status: "in_progress",
      metadata: {
        case_meta: caseMeta,
      },
    })
    .select("id, status")
    .single();

  if (sessErr || !session) {
    console.error("[api/sessions] session insert failed:", sessErr);
    return NextResponse.json(
      { error: "No se pudo crear sesión." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    session_id: session.id,
    status: session.status,
    case_template_id: caseTemplate.id,
    case_variant_id: variant.id,
    case_meta: caseMeta,
    resumed: false,
  });
}
