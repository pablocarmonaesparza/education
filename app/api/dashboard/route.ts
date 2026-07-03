/**
 * GET /api/dashboard
 *
 * Devuelve datos agregados para el dashboard del manager. Scope:
 *   - Team del user autenticado (resuelto via team_memberships)
 *   - Sprint activo más reciente de ese team
 *   - Sessions + reports asociados → aggregate de bandas + dimensiones
 *
 * RLS controla acceso: managers/admins ven sessions del team, users ven
 * sólo las suyas. Para una vista "manager dashboard" verdadera, el
 * caller debe ser manager/admin. Si es employee, el endpoint retorna
 * un view limitado (solo su propia session).
 *
 * Respuesta:
 *   200 {
 *     team: {id, name} | null,
 *     sprint: {id, name, start_date, status} | null,
 *     members: [{ ... }],
 *     aggregate: {
 *       total, completed, in_progress, not_started,
 *       readiness_by_band: {A, M, B},
 *       dimensions_avg: {contexto, datos, ejecucion_ia, validacion, juicio, impacto},
 *       risk_events_total, days_left, completion_pct
 *     }
 *   }
 *   401 { error }
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DIMENSIONS } from "@/lib/simulador/config";
import { normalizeReportDimensions } from "@/lib/simulador/reports/model";
import { isDevBypassActive } from "@/lib/dev/devBypass";
import { getMockDashboard } from "@/lib/simulador/dashboard/mock";

export const runtime = "nodejs";

interface DimensionScore {
  id: string;
  band: "A" | "M" | "B";
}

interface RiskEvent {
  severity: "low" | "medium" | "high";
}

type ManagerAction = "pilotar" | "entrenar" | "pausar" | "escalar";

interface ReportPayload {
  dimensions?: DimensionScore[];
  risk_events?: RiskEvent[];
  recommendation?: {
    action?: ManagerAction;
  };
}

interface AvailableCase {
  slug: string;
  title: string;
  difficulty: string | null;
  duration_estimate_min: number | null;
}

function bandToScore(b: "A" | "M" | "B" | null | undefined): number | null {
  if (b === "A") return 85;
  if (b === "M") return 60;
  if (b === "B") return 35;
  return null;
}

function emptyDimensionTotals(): Record<string, { sum: number; count: number }> {
  return Object.fromEntries(
    DIMENSIONS.map((dimension) => [dimension.id, { sum: 0, count: 0 }]),
  );
}

function emptyDimensionAverages(): Record<string, number> {
  return Object.fromEntries(DIMENSIONS.map((dimension) => [dimension.id, 0]));
}

function emptyDimensionBandMatrix(): Record<
  string,
  Record<"A" | "M" | "B", number>
> {
  return Object.fromEntries(
    DIMENSIONS.map((dimension) => [dimension.id, { A: 0, M: 0, B: 0 }]),
  );
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // Dev-only: con el bypass activo servimos data mock para QA visual del
    // dashboard manager. `isDevBypassActive` es false en producción.
    const cookieStore = await cookies();
    if (isDevBypassActive(cookieStore.get("itera_dev_bypass")?.value)) {
      return NextResponse.json(getMockDashboard());
    }
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  // Bridge user — usamos admin client porque PostgREST puede no exponer
  // el schema "simulador" al cliente regular si la BD no está configurada
  // para exposed_schemas. El admin client (service_role) bypassa todo
  // y ya validamos el user vía auth.getUser() arriba.
  const adminForUser = createAdminClient();
  const bridgeResult = await adminForUser
    .schema("simulador")
    .from("users")
    .select("id, full_name, email")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  console.log("[dashboard] bridge lookup", {
    auth_user_id: user.id,
    has_simUser: !!bridgeResult.data,
    error: bridgeResult.error?.message ?? null,
  });

  const simUser = bridgeResult.data;
  if (!simUser) {
    return NextResponse.json(
      {
        error: "Bridge user no inicializado. Re-loguéate.",
      },
      { status: 500 },
    );
  }

  // Team del user — admin client por el mismo motivo (PostgREST schema exposure).
  const { data: membership } = await adminForUser
    .schema("simulador")
    .from("team_memberships")
    .select("team_id, role")
    .eq("user_id", simUser.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({
      team: null,
      sprint: null,
      available_cases: [],
      members: [],
      aggregate: emptyAggregate(),
    });
  }

  const { data: team } = await adminForUser
    .schema("simulador")
    .from("teams")
    .select("id, name, organization_id")
    .eq("id", membership.team_id)
    .single();

  if (!team) {
    return NextResponse.json({
      team: null,
      sprint: null,
      available_cases: [],
      members: [],
      aggregate: emptyAggregate(),
    });
  }

  // Sprint para dashboard manager.
  //
  // El runtime productivo (/case) puede crear un sprint standalone ad-hoc sin
  // sprint_package_id para que arranque rápido. Ese sprint no debe ocultar el sprint de
  // equipo con paquete/casos/reportes, porque el dashboard agrega evidencia de
  // sprint operativo. Preferimos sprints empaquetados y usamos standalone sólo
  // como fallback.
  const sprintSelect = "id, name, status, start_date, end_date, sprint_package_id";
  const { data: packagedSprint } = await adminForUser
    .schema("simulador")
    .from("sprints")
    .select(sprintSelect)
    .eq("team_id", team.id)
    .not("sprint_package_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let sprint = packagedSprint ?? null;
  if (!sprint) {
    const { data: fallbackSprint } = await adminForUser
      .schema("simulador")
      .from("sprints")
      .select(sprintSelect)
      .eq("team_id", team.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    sprint = fallbackSprint ?? null;
  }

  if (!sprint) {
    return NextResponse.json({
      team: { id: team.id, name: team.name },
      sprint: null,
      available_cases: [],
      members: [],
      aggregate: emptyAggregate(),
    });
  }

  const viewerRole = String(membership.role ?? "employee");
  const canSeeTeam = ["manager", "admin", "org_admin"].includes(viewerRole);

  // Para el agregado completo necesitamos cruzar:
  //   team_memberships → users (todos los seats)
  //   sessions del sprint
  //   reports de esas sessions
  // Usamos admin client para esto porque managers pueden no tener role
  // formal todavía y queremos mostrar el dashboard si es buyer/owner.
  const admin = createAdminClient();
  const availableCases = await loadAvailableCases(
    admin,
    (sprint.sprint_package_id as string | null) ?? null,
    (team.organization_id as string | null) ?? null,
  );

  // Members del team que aparecen en el dashboard.
  // Excluimos managers/org_admins: el dashboard agrega empleados (operadores),
  // y un manager no debe aparecerse a sí mismo como "no iniciado".
  let membersQuery = admin
    .schema("simulador")
    .from("team_memberships")
    .select("user_id, role")
    .eq("team_id", team.id);

  if (canSeeTeam) {
    membersQuery = membersQuery.eq("role", "employee");
  } else {
    membersQuery = membersQuery.eq("user_id", simUser.id);
  }

  const { data: teamMembers } = await membersQuery;

  const userIds = (teamMembers ?? []).map((tm) => tm.user_id);
  const { data: users } = await admin
    .schema("simulador")
    .from("users")
    .select("id, full_name, email")
    .in("id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]);

  // Sessions del sprint
  const { data: sessions } = await admin
    .schema("simulador")
    .from("simulation_sessions")
    .select(
      "id, user_id, status, started_at, completed_at, case_variant_id",
    )
    .eq("sprint_id", sprint.id);

  // Reports de esas sessions
  const sessionIds = (sessions ?? []).map((s) => s.id);
  const { data: reports } =
    sessionIds.length > 0
      ? await admin
          .schema("simulador")
          .from("reports")
          .select("id, simulation_session_id, status, payload_json")
          .eq("report_type", "participant_mirror")
          .in("simulation_session_id", sessionIds)
      : { data: [] };

  // Index
  const sessionByUser: Record<
    string,
    {
      id: string;
      status: string;
      started_at: string | null;
      completed_at: string | null;
    } | null
  > = {};
  for (const s of sessions ?? []) {
    sessionByUser[s.user_id as string] = {
      id: s.id as string,
      status: s.status as string,
      started_at: (s.started_at as string | null) ?? null,
      completed_at: (s.completed_at as string | null) ?? null,
    };
  }
  const reportBySession: Record<
    string,
    {
      id: string;
      status: string;
      payload: ReportPayload | null;
    }
  > = {};
  for (const r of reports ?? []) {
    reportBySession[r.simulation_session_id as string] = {
      id: r.id as string,
      status: r.status as string,
      payload: (r.payload_json as ReportPayload | null) ?? null,
    };
  }

  // Build members list + aggregate
  const dimensionTotals = emptyDimensionTotals();
  let riskEventsTotal = 0;
  let highRiskEventsTotal = 0;
  let pendingReviewCount = 0;
  const readinessByBand: Record<"A" | "M" | "B", number> = { A: 0, M: 0, B: 0 };
  const recommendationCounts: Record<ManagerAction, number> = {
    pilotar: 0,
    entrenar: 0,
    pausar: 0,
    escalar: 0,
  };
  const dimensionBandMatrix = emptyDimensionBandMatrix();

  const memberRows = (users ?? []).map((u) => {
    const sess = sessionByUser[u.id as string] ?? null;
    const report = sess ? reportBySession[sess.id] : undefined;
    let readinessBand: "A" | "M" | "B" | null = null;
    let durationMin: number | null = null;
    let dimensionBands: Record<string, "A" | "M" | "B"> | null = null;
    let recommendationAction: ManagerAction | null = null;
    let riskEventsCount = 0;
    let highRiskEventsCount = 0;
    if (report?.payload?.dimensions && report.payload.dimensions.length > 0) {
      dimensionBands = {};
      const normalizedDimensions = normalizeReportDimensions(report.payload);
      // Computar banda promedio rápida
      const scores = normalizedDimensions
        .map((d) => bandToScore(d.band))
        .filter((s): s is number => s !== null);
      const avg = scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      readinessBand = avg > 75 ? "A" : avg > 50 ? "M" : "B";
      readinessByBand[readinessBand]++;

      // Acumular por dimensión
      for (const d of normalizedDimensions) {
        const dt = dimensionTotals[d.id];
        const sc = bandToScore(d.band);
        if (dt && sc !== null) {
          dt.sum += sc;
          dt.count += 1;
          dimensionBands[d.id] = d.band;
          const matrixRow = dimensionBandMatrix[d.id];
          if (matrixRow) matrixRow[d.band] += 1;
        }
      }
    }

    if (report?.payload) {
      riskEventsCount = report.payload.risk_events?.length ?? 0;
      highRiskEventsCount =
        report.payload.risk_events?.filter((event) => event.severity === "high")
          .length ?? 0;
      riskEventsTotal += riskEventsCount;
      highRiskEventsTotal += highRiskEventsCount;
      if (report.status === "pending_review") pendingReviewCount += 1;

      if (report.payload.recommendation?.action) {
        recommendationAction = report.payload.recommendation.action;
        recommendationCounts[recommendationAction] += 1;
      }
    }

    if (sess?.started_at && sess.completed_at) {
      const ms =
        new Date(sess.completed_at).getTime() -
        new Date(sess.started_at).getTime();
      durationMin = Math.round(ms / 60000);
    }

    return {
      user_id: u.id as string,
      full_name: (u.full_name as string | null) ?? null,
      email: u.email as string,
      session_id: sess?.id ?? null,
      session_status: sess?.status ?? "not_started",
      session_duration_min: durationMin,
      readiness_band: readinessBand,
      dimension_bands: dimensionBands,
      recommendation_action: recommendationAction,
      risk_events_count: riskEventsCount,
      high_risk_events_count: highRiskEventsCount,
      report_id: report?.id ?? null,
      report_status: report?.status ?? null,
    };
  });

  const total = memberRows.length;
  const completed = memberRows.filter(
    (m) =>
      m.session_status === "submitted" ||
      m.session_status === "evaluated" ||
      m.session_status === "completed",
  ).length;
  const inProgress = memberRows.filter(
    (m) => m.session_status === "in_progress",
  ).length;
  const notStarted = total - completed - inProgress;

  const dimensionsAvg: Record<string, number> = {};
  for (const [k, v] of Object.entries(dimensionTotals)) {
    dimensionsAvg[k] = v.count > 0 ? Math.round(v.sum / v.count) : 0;
  }

  const today = new Date();
  const endDate = sprint.end_date ? new Date(sprint.end_date) : null;
  const daysLeft = endDate
    ? Math.max(
        0,
        Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
      )
    : null;

  return NextResponse.json({
    viewer_role: viewerRole,
    team: { id: team.id, name: team.name },
    sprint: {
      id: sprint.id,
      name: sprint.name,
      status: sprint.status,
      start_date: sprint.start_date,
      end_date: sprint.end_date,
    },
    available_cases: availableCases,
    members: memberRows,
    aggregate: {
      total,
      completed,
      in_progress: inProgress,
      not_started: notStarted,
      completion_pct: total > 0 ? Math.round((completed / total) * 100) : 0,
      readiness_by_band: readinessByBand,
      dimensions_avg: dimensionsAvg,
      dimension_band_matrix: dimensionBandMatrix,
      risk_events_total: riskEventsTotal,
      high_risk_events_total: highRiskEventsTotal,
      pending_review_count: pendingReviewCount,
      recommendation_counts: recommendationCounts,
      days_left: daysLeft,
    },
  });
}

function emptyAggregate() {
  return {
    total: 0,
    completed: 0,
    in_progress: 0,
    not_started: 0,
    completion_pct: 0,
    readiness_by_band: { A: 0, M: 0, B: 0 },
    dimensions_avg: emptyDimensionAverages(),
    dimension_band_matrix: emptyDimensionBandMatrix(),
    risk_events_total: 0,
    high_risk_events_total: 0,
    pending_review_count: 0,
    recommendation_counts: { pilotar: 0, entrenar: 0, pausar: 0, escalar: 0 },
    days_left: null,
  };
}

async function loadAvailableCases(
  admin: ReturnType<typeof createAdminClient>,
  sprintPackageId: string | null,
  orgId: string | null,
): Promise<AvailableCase[]> {
  if (sprintPackageId) {
    const { data: packageRows } = await admin
      .schema("simulador")
      .from("sprint_package_cases")
      .select(
        "display_order, status, case_template:case_templates(slug, title, difficulty, duration_estimate_min, status, organization_id)",
      )
      .eq("sprint_package_id", sprintPackageId)
      .eq("status", "ready")
      .order("display_order", { ascending: true });

    const cases = (packageRows ?? [])
      .map((row) => {
        const template = Array.isArray(row.case_template)
          ? row.case_template[0]
          : row.case_template;
        if (!template || template.status !== "active") return null;
        // Defensa en profundidad: el admin client bypassa RLS. Si un
        // sprint_package_cases apuntara a un template bespoke de OTRA org, no
        // filtramos su metadata: solo globales (null) o de la org del viewer.
        if (template.organization_id && template.organization_id !== orgId)
          return null;
        return {
          slug: String(template.slug),
          title: String(template.title),
          difficulty: (template.difficulty as string | null) ?? null,
          duration_estimate_min:
            (template.duration_estimate_min as number | null) ?? null,
        };
      })
      .filter((item): item is AvailableCase => Boolean(item));

    if (cases.length > 0) return cases;
  }

  // Scope por org: casos globales (organization_id null) + los bespoke de ESTA
  // empresa. Nunca los bespoke de otra (el admin client bypassa RLS).
  let templatesQuery = admin
    .schema("simulador")
    .from("case_templates")
    .select("slug, title, difficulty, duration_estimate_min, organization_id")
    .eq("status", "active");
  templatesQuery = orgId
    ? templatesQuery.or(`organization_id.is.null,organization_id.eq.${orgId}`)
    : templatesQuery.is("organization_id", null);
  const { data: templates } = await templatesQuery.order("updated_at", {
    ascending: false,
  });

  return (templates ?? []).map((template) => ({
    slug: String(template.slug),
    title: String(template.title),
    difficulty: (template.difficulty as string | null) ?? null,
    duration_estimate_min:
      (template.duration_estimate_min as number | null) ?? null,
  }));
}
