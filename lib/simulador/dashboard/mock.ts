/**
 * Mock del dashboard manager — SOLO para QA visual con dev-bypass.
 *
 * Se sirve desde `/api/dashboard` únicamente cuando `isDevBypassEnabled()` es
 * true (dev/preview, nunca producción) Y la cookie `itera_dev_bypass=1` está
 * presente Y no hay sesión real. Permite revisar el diseño del dashboard
 * (el "wow moment") sin sembrar datos reales en Supabase.
 *
 * Construido desde `DIMENSIONS` para no desincronizarse del schema real:
 * los KPIs, la matriz y los conteos se computan de la lista de members, así
 * que el agregado siempre es internamente consistente.
 */

import { BAND_REPRESENTATIVE_SCORE, DIMENSIONS } from "@/lib/simulador/config";
import type { BandKey } from "@/lib/simulador/config";

type Action = "pilotar" | "entrenar" | "pausar" | "escalar";
type Status =
  | "not_started"
  | "in_progress"
  | "paused"
  | "submitted"
  | "evaluated"
  | "completed";

const DIM_IDS = DIMENSIONS.map((d) => d.id);

// R-13: representativos canónicos — con literales locales (85/60/35) el mock
// producía bandas imposibles (banda "A" con score 77 < corte A) en el QA.
function bandToScore(b: BandKey | null): number | null {
  if (b === "A" || b === "M" || b === "B") return BAND_REPRESENTATIVE_SCORE[b];
  return null;
}

/** Mapea las 6 bandas posicionales a {dimId: band}. */
function dims(...vals: BandKey[]): Record<string, BandKey> {
  return Object.fromEntries(DIM_IDS.map((id, i) => [id, vals[i] ?? "M"]));
}

interface MockMember {
  name: string;
  email: string;
  status: Status;
  readiness: BandKey | null;
  dims: BandKey[] | null;
  action: Action | null;
  risk: number;
  highRisk: number;
  durationMin: number | null;
  reportStatus: string | null;
  /** Attempts de práctica completed (histórico). */
  practiceTotal: number;
  /** Attempts de práctica completed en los últimos 7 días. */
  practiceWeek: number;
  /** Última actividad, en días hacia atrás desde Date.now(). null = sin actividad. */
  lastActiveDaysAgo: number | null;
}

// Glosario §8.2: el cast por defecto es US-plausible (sin nombres acentuados).
// Actividad: los de banda A practican más; "Marcus Webb" lleva 9 días inactivo
// (dispara la fila de inactividad del panel "Needs a push"); los not_started
// no tienen actividad → last_active_at null.
const MEMBERS: MockMember[] = [
  { name: "Sarah Mitchell", email: "smitchell@company.com", status: "evaluated", readiness: "A", dims: ["A", "A", "M", "A", "A", "M"], action: "pilotar", risk: 0, highRisk: 0, durationMin: 19, reportStatus: "published", practiceTotal: 42, practiceWeek: 7, lastActiveDaysAgo: 0.2 },
  { name: "David Reyes", email: "dreyes@company.com", status: "evaluated", readiness: "A", dims: ["A", "M", "A", "A", "M", "A"], action: "pilotar", risk: 1, highRisk: 0, durationMin: 23, reportStatus: "published", practiceTotal: 48, practiceWeek: 9, lastActiveDaysAgo: 0.6 },
  { name: "Rachel Brennan", email: "rbrennan@company.com", status: "evaluated", readiness: "M", dims: ["M", "M", "B", "M", "A", "M"], action: "entrenar", risk: 2, highRisk: 0, durationMin: 27, reportStatus: "published", practiceTotal: 26, practiceWeek: 4, lastActiveDaysAgo: 1.1 },
  { name: "Andrew Kim", email: "akim@company.com", status: "evaluated", readiness: "M", dims: ["A", "M", "M", "B", "M", "M"], action: "entrenar", risk: 1, highRisk: 0, durationMin: 25, reportStatus: "published", practiceTotal: 31, practiceWeek: 5, lastActiveDaysAgo: 0.9 },
  { name: "Megan Foster", email: "mfoster@company.com", status: "submitted", readiness: "B", dims: ["B", "B", "M", "B", "B", "M"], action: "pausar", risk: 3, highRisk: 1, durationMin: 31, reportStatus: "pending_review", practiceTotal: 12, practiceWeek: 2, lastActiveDaysAgo: 1.8 },
  { name: "Jordan Ellis", email: "jellis@company.com", status: "evaluated", readiness: "B", dims: ["M", "B", "B", "B", "M", "B"], action: "escalar", risk: 4, highRisk: 2, durationMin: 17, reportStatus: "published", practiceTotal: 9, practiceWeek: 1, lastActiveDaysAgo: 1.6 },
  { name: "Priya Raman", email: "praman@company.com", status: "in_progress", readiness: null, dims: null, action: null, risk: 0, highRisk: 0, durationMin: null, reportStatus: null, practiceTotal: 6, practiceWeek: 3, lastActiveDaysAgo: 0.4 },
  { name: "Marcus Webb", email: "mwebb@company.com", status: "in_progress", readiness: null, dims: null, action: null, risk: 0, highRisk: 0, durationMin: null, reportStatus: null, practiceTotal: 4, practiceWeek: 0, lastActiveDaysAgo: 9 },
  { name: "Laura Chen", email: "lchen@company.com", status: "not_started", readiness: null, dims: null, action: null, risk: 0, highRisk: 0, durationMin: null, reportStatus: null, practiceTotal: 0, practiceWeek: 0, lastActiveDaysAgo: null },
  { name: "Thomas Reed", email: "treed@company.com", status: "not_started", readiness: null, dims: null, action: null, risk: 0, highRisk: 0, durationMin: null, reportStatus: null, practiceTotal: 0, practiceWeek: 0, lastActiveDaysAgo: null },
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0] ?? "")
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Semanas con inicio LUNES en UTC — mismo helper que /api/dashboard.
function floorToMondayUTC(d: Date): Date {
  const daysSinceMonday = (d.getUTCDay() + 6) % 7;
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - daysSinceMonday),
  );
}

// Actividad por semana (8 buckets, la última = semana actual). La práctica de
// la última semana debe cuadrar con la suma de practice_completed_week de los
// members (31) — el mock es internamente consistente por contrato.
// Suma = 6 = members con sesión completada (consistencia narrativa del mock).
const ASSESSMENTS_BY_WEEK = [0, 1, 0, 1, 0, 1, 1, 2];
const PRACTICE_BY_WEEK = [4, 7, 9, 12, 15, 19, 24, 31];

export function getMockDashboard() {
  const members = MEMBERS.map((m, i) => ({
    user_id: `mock-user-${i + 1}`,
    full_name: m.name,
    email: m.email,
    session_id: m.status === "not_started" ? null : `mock-session-${i + 1}`,
    session_status: m.status,
    session_duration_min: m.durationMin,
    readiness_band: m.readiness,
    // Promedio 0-100 de las bandas por dimensión — mismo cómputo que el endpoint.
    readiness_score: m.dims
      ? Math.round(
          m.dims.reduce((acc, b) => acc + (bandToScore(b) ?? 0), 0) /
            m.dims.length,
        )
      : null,
    dimension_bands: m.dims ? dims(...m.dims) : null,
    recommendation_action: m.action,
    risk_events_count: m.risk,
    high_risk_events_count: m.highRisk,
    report_id: m.reportStatus ? `mock-report-${i + 1}` : null,
    report_status: m.reportStatus,
    practice_completed_total: m.practiceTotal,
    practice_completed_week: m.practiceWeek,
    last_active_at:
      m.lastActiveDaysAgo !== null
        ? new Date(Date.now() - m.lastActiveDaysAgo * DAY_MS).toISOString()
        : null,
    initials: initials(m.name),
  }));

  const isDone = (s: Status) =>
    s === "submitted" || s === "evaluated" || s === "completed";
  const isActive = (s: Status) => s === "in_progress" || s === "paused";

  const total = members.length;
  const completed = members.filter((m) => isDone(m.session_status)).length;
  const inProgress = members.filter((m) => isActive(m.session_status)).length;
  const notStarted = total - completed - inProgress;

  const readinessByBand: Record<BandKey, number> = { A: 0, M: 0, B: 0 };
  const recommendationCounts: Record<Action, number> = {
    pilotar: 0,
    entrenar: 0,
    pausar: 0,
    escalar: 0,
  };
  const matrix: Record<string, Record<BandKey, number>> = Object.fromEntries(
    DIM_IDS.map((id) => [id, { A: 0, M: 0, B: 0 }]),
  );
  const totals: Record<string, { sum: number; count: number }> =
    Object.fromEntries(DIM_IDS.map((id) => [id, { sum: 0, count: 0 }]));

  let riskTotal = 0;
  let highRiskTotal = 0;
  let pendingReview = 0;
  let practiceCompletedTotal = 0;
  let practiceCompletedWeek = 0;
  let activeThisWeek = 0;
  const weekAgoMs = Date.now() - 7 * DAY_MS;

  for (const m of members) {
    if (m.readiness_band) readinessByBand[m.readiness_band]++;
    if (m.recommendation_action) recommendationCounts[m.recommendation_action]++;
    riskTotal += m.risk_events_count;
    highRiskTotal += m.high_risk_events_count;
    if (m.report_status === "pending_review") pendingReview++;
    practiceCompletedTotal += m.practice_completed_total;
    practiceCompletedWeek += m.practice_completed_week;
    if (m.last_active_at && new Date(m.last_active_at).getTime() >= weekAgoMs) {
      activeThisWeek++;
    }
    if (m.dimension_bands) {
      for (const id of DIM_IDS) {
        const band = m.dimension_bands[id];
        const sc = bandToScore(band);
        if (sc !== null) {
          matrix[id][band]++;
          totals[id].sum += sc;
          totals[id].count += 1;
        }
      }
    }
  }

  const dimensionsAvg: Record<string, number> = {};
  for (const id of DIM_IDS) {
    dimensionsAvg[id] = totals[id].count
      ? Math.round(totals[id].sum / totals[id].count)
      : 0;
  }

  // 8 semanas lunes-UTC reales desde Date.now(); la última es la actual.
  const currentMonday = floorToMondayUTC(new Date());
  const activityByWeek = ASSESSMENTS_BY_WEEK.map((assessments, i) => ({
    week_start: new Date(currentMonday.getTime() - (7 - i) * 7 * DAY_MS)
      .toISOString()
      .slice(0, 10),
    assessments,
    practice: PRACTICE_BY_WEEK[i] ?? 0,
  }));

  return {
    viewer_role: "manager",
    mock: true,
    team: { id: "mock-team", name: "Growth · US" },
    sprint: {
      id: "mock-sprint",
      name: "Assessment sprint · Q2",
      status: "active",
      start_date: "2026-06-02",
      end_date: "2026-06-19",
    },
    available_cases: [
      // difficulty ∈ CHECK de BD ('baseline','intermediate','advanced'): el mock
      // traía "intermedio"/"básico", que no son valores válidos del contrato.
      { slug: "marketing_urgent_campaign_pii", title: "Urgent campaign with sensitive data", difficulty: "intermediate", duration_estimate_min: 18 },
      { slug: "marketing_copy_with_brand_voice", title: "Copy in the brand voice", difficulty: "baseline", duration_estimate_min: 15 },
    ],
    members,
    aggregate: {
      total,
      completed,
      in_progress: inProgress,
      not_started: notStarted,
      completion_pct: total > 0 ? Math.round((completed / total) * 100) : 0,
      readiness_by_band: readinessByBand,
      dimensions_avg: dimensionsAvg,
      dimension_band_matrix: matrix,
      risk_events_total: riskTotal,
      high_risk_events_total: highRiskTotal,
      pending_review_count: pendingReview,
      recommendation_counts: recommendationCounts,
      days_left: 4,
      activity_by_week: activityByWeek,
      practice_completed_total: practiceCompletedTotal,
      practice_completed_week: practiceCompletedWeek,
      active_this_week: activeThisWeek,
    },
  };
}
