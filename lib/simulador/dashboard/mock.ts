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

import { DIMENSIONS } from "@/lib/simulador/config";
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

function bandToScore(b: BandKey | null): number | null {
  if (b === "A") return 85;
  if (b === "M") return 60;
  if (b === "B") return 35;
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
}

const MEMBERS: MockMember[] = [
  { name: "María Fernanda Ríos", email: "mfrios@empresa.com", status: "evaluated", readiness: "A", dims: ["A", "A", "M", "A", "A", "M"], action: "pilotar", risk: 0, highRisk: 0, durationMin: 19, reportStatus: "published" },
  { name: "Diego Salcedo", email: "dsalcedo@empresa.com", status: "evaluated", readiness: "A", dims: ["A", "M", "A", "A", "M", "A"], action: "pilotar", risk: 1, highRisk: 0, durationMin: 23, reportStatus: "published" },
  { name: "Valentina Cossío", email: "vcossio@empresa.com", status: "evaluated", readiness: "M", dims: ["M", "M", "B", "M", "A", "M"], action: "entrenar", risk: 2, highRisk: 0, durationMin: 27, reportStatus: "published" },
  { name: "Andrés Belmonte", email: "abelmonte@empresa.com", status: "evaluated", readiness: "M", dims: ["A", "M", "M", "B", "M", "M"], action: "entrenar", risk: 1, highRisk: 0, durationMin: 25, reportStatus: "published" },
  { name: "Camila Restrepo", email: "crestrepo@empresa.com", status: "submitted", readiness: "B", dims: ["B", "B", "M", "B", "B", "M"], action: "pausar", risk: 3, highRisk: 1, durationMin: 31, reportStatus: "pending_review" },
  { name: "Joaquín Vélez", email: "jvelez@empresa.com", status: "evaluated", readiness: "B", dims: ["M", "B", "B", "B", "M", "B"], action: "escalar", risk: 4, highRisk: 2, durationMin: 17, reportStatus: "published" },
  { name: "Renata Aguilar", email: "raguilar@empresa.com", status: "in_progress", readiness: null, dims: null, action: null, risk: 0, highRisk: 0, durationMin: null, reportStatus: null },
  { name: "Sebastián Mora", email: "smora@empresa.com", status: "in_progress", readiness: null, dims: null, action: null, risk: 0, highRisk: 0, durationMin: null, reportStatus: null },
  { name: "Lucía Paredes", email: "lparedes@empresa.com", status: "not_started", readiness: null, dims: null, action: null, risk: 0, highRisk: 0, durationMin: null, reportStatus: null },
  { name: "Tomás Iriarte", email: "tiriarte@empresa.com", status: "not_started", readiness: null, dims: null, action: null, risk: 0, highRisk: 0, durationMin: null, reportStatus: null },
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

export function getMockDashboard() {
  const members = MEMBERS.map((m, i) => ({
    user_id: `mock-user-${i + 1}`,
    full_name: m.name,
    email: m.email,
    session_id: m.status === "not_started" ? null : `mock-session-${i + 1}`,
    session_status: m.status,
    session_duration_min: m.durationMin,
    readiness_band: m.readiness,
    dimension_bands: m.dims ? dims(...m.dims) : null,
    recommendation_action: m.action,
    risk_events_count: m.risk,
    high_risk_events_count: m.highRisk,
    report_id: m.reportStatus ? `mock-report-${i + 1}` : null,
    report_status: m.reportStatus,
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

  for (const m of members) {
    if (m.readiness_band) readinessByBand[m.readiness_band]++;
    if (m.recommendation_action) recommendationCounts[m.recommendation_action]++;
    riskTotal += m.risk_events_count;
    highRiskTotal += m.high_risk_events_count;
    if (m.report_status === "pending_review") pendingReview++;
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

  return {
    viewer_role: "manager",
    mock: true,
    team: { id: "mock-team", name: "Growth · LATAM" },
    sprint: {
      id: "mock-sprint",
      name: "Sprint diagnóstico · Q2",
      status: "active",
      start_date: "2026-06-02",
      end_date: "2026-06-19",
    },
    available_cases: [
      { slug: "marketing_urgent_campaign_pii", title: "Campaña urgente con datos sensibles", difficulty: "intermedio", duration_estimate_min: 18 },
      { slug: "marketing_copy_with_brand_voice", title: "Copy con voz de marca", difficulty: "básico", duration_estimate_min: 15 },
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
    },
  };
}
