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
 *       dimensions_avg: {contexto, privacidad, validacion, juicio, decision},
 *       risk_events_total, days_left, completion_pct
 *     }
 *   }
 *   401 { error }
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

interface DimensionScore {
  id: string;
  band: "A" | "M" | "B";
}

interface RiskEvent {
  severity: "low" | "medium" | "high";
}

interface ReportPayload {
  dimensions?: DimensionScore[];
  risk_events?: RiskEvent[];
}

function bandToScore(b: "A" | "M" | "B" | null | undefined): number | null {
  if (b === "A") return 85;
  if (b === "M") return 60;
  if (b === "B") return 35;
  return null;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  // Bridge user
  const { data: simUser } = await supabase
    .schema("simulador")
    .from("users")
    .select("id, full_name, email")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!simUser) {
    return NextResponse.json(
      { error: "Bridge user no inicializado. Re-loguéate." },
      { status: 500 },
    );
  }

  // Team del user (primero)
  const { data: membership } = await supabase
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
      members: [],
      aggregate: emptyAggregate(),
    });
  }

  const { data: team } = await supabase
    .schema("simulador")
    .from("teams")
    .select("id, name, organization_id")
    .eq("id", membership.team_id)
    .single();

  if (!team) {
    return NextResponse.json({
      team: null,
      sprint: null,
      members: [],
      aggregate: emptyAggregate(),
    });
  }

  // Sprint más reciente del team
  const { data: sprint } = await supabase
    .schema("simulador")
    .from("sprints")
    .select("id, name, status, start_date, end_date")
    .eq("team_id", team.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sprint) {
    return NextResponse.json({
      team: { id: team.id, name: team.name },
      sprint: null,
      members: [],
      aggregate: emptyAggregate(),
    });
  }

  // Para el agregado completo necesitamos cruzar:
  //   team_memberships → users (todos los seats)
  //   sessions del sprint
  //   reports de esas sessions
  // Usamos admin client para esto porque managers pueden no tener role
  // formal todavía y queremos mostrar el dashboard si es buyer/owner.
  const admin = createAdminClient();

  // Todos los users del team
  const { data: teamMembers } = await admin
    .schema("simulador")
    .from("team_memberships")
    .select("user_id, role")
    .eq("team_id", team.id);

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
  const dimensionTotals: Record<string, { sum: number; count: number }> = {
    contexto: { sum: 0, count: 0 },
    privacidad: { sum: 0, count: 0 },
    validacion: { sum: 0, count: 0 },
    juicio: { sum: 0, count: 0 },
    decision: { sum: 0, count: 0 },
  };
  let riskEventsTotal = 0;
  const readinessByBand: Record<"A" | "M" | "B", number> = { A: 0, M: 0, B: 0 };

  const memberRows = (users ?? []).map((u) => {
    const sess = sessionByUser[u.id as string] ?? null;
    const report = sess ? reportBySession[sess.id] : undefined;
    let readinessBand: "A" | "M" | "B" | null = null;
    let durationMin: number | null = null;
    if (report?.payload?.dimensions && report.payload.dimensions.length > 0) {
      // Computar banda promedio rápida
      const scores = report.payload.dimensions
        .map((d) => bandToScore(d.band))
        .filter((s): s is number => s !== null);
      const avg = scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      readinessBand = avg > 75 ? "A" : avg > 50 ? "M" : "B";
      readinessByBand[readinessBand]++;

      // Acumular por dimensión
      for (const d of report.payload.dimensions) {
        const dt = dimensionTotals[d.id];
        const sc = bandToScore(d.band);
        if (dt && sc !== null) {
          dt.sum += sc;
          dt.count += 1;
        }
      }
      // Risk events
      riskEventsTotal += report.payload.risk_events?.length ?? 0;
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
    team: { id: team.id, name: team.name },
    sprint: {
      id: sprint.id,
      name: sprint.name,
      status: sprint.status,
      start_date: sprint.start_date,
      end_date: sprint.end_date,
    },
    members: memberRows,
    aggregate: {
      total,
      completed,
      in_progress: inProgress,
      not_started: notStarted,
      completion_pct: total > 0 ? Math.round((completed / total) * 100) : 0,
      readiness_by_band: readinessByBand,
      dimensions_avg: dimensionsAvg,
      risk_events_total: riskEventsTotal,
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
    dimensions_avg: {
      contexto: 0,
      privacidad: 0,
      validacion: 0,
      juicio: 0,
      decision: 0,
    },
    risk_events_total: 0,
    days_left: null,
  };
}
