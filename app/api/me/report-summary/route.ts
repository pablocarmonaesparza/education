/**
 * GET /api/me/report-summary — resumen agregado de reportes del viewer (R-29).
 *
 * Junta las simulation_sessions del usuario con sus reports participant_mirror
 * visibles (published / pending_review / shared) y agrega:
 *   - global: casos completados, banda global (moda), score 0-100, distribución
 *     de bandas, última actividad y recomendación más reciente.
 *   - dimensions: por cada una de las 6 dimensiones canónicas, score
 *     representativo promedio, banda y trend cronológico de bandas.
 *   - riskEvents: agregados por type (count + severidad máxima).
 *   - cases: por sesión con reporte, slug/título del caso, banda, score y
 *     session_id para linkear al reporte individual.
 *   - practice: practice_unlocks del user con su beat.
 *
 * R-13: el mapeo score↔banda usa SOLO bandFromScore100/BAND_REPRESENTATIVE_SCORE
 * de lib/simulador/config — cero cortes locales.
 *
 * Auth: bridge simulador.users por auth_user_id; en dev con bypass sirve el
 * user demo (ana.demo@%), mismo patrón que GET /api/cases. Imposible en prod.
 *
 * Respuesta: 200 ReportSummary · 401 { error } · 500 { error }
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDevBypassActive } from "@/lib/dev/devBypass";
import {
  BAND_REPRESENTATIVE_SCORE,
  DIMENSIONS,
  bandFromScore100,
  type BandKey,
} from "@/lib/simulador/config";
import {
  computeOverall,
  normalizeReportDimensions,
  type ReportPayload,
} from "@/lib/simulador/reports/model";
import type {
  RecommendationAction,
  ReportSummary,
  ReportSummaryCase,
  ReportSummaryDimension,
  ReportSummaryPractice,
  ReportSummaryRiskEvent,
  RiskSeverity,
} from "@/lib/simulador/report-summary";

export const runtime = "nodejs";

const VISIBLE_REPORT_STATUS = new Set(["pending_review", "published", "shared"]);
const SEVERITY_RANK: Record<RiskSeverity, number> = { low: 0, medium: 1, high: 2 };
const RECOMMENDATION_ACTIONS = new Set<RecommendationAction>([
  "pilotar",
  "entrenar",
  "pausar",
  "escalar",
]);

const BAND_RANK: Record<BandKey, number> = { B: 0, M: 1, A: 2 };

function emptySummary(): ReportSummary {
  return {
    global: {
      casesCompleted: 0,
      band: null,
      score: null,
      bandDistribution: { A: 0, M: 0, B: 0 },
      lastActivityAt: null,
      recommendation: null,
    },
    dimensions: [],
    riskEvents: [],
    cases: [],
    practice: [],
  };
}

function isSeverity(value: unknown): value is RiskSeverity {
  return value === "low" || value === "medium" || value === "high";
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = createAdminClient();

  let simUserId: string | null = null;

  if (user) {
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
    simUserId = simUser.id as string;
  } else {
    // Dev-only: con el bypass activo servimos el resumen del participante demo
    // sembrado (QA realista). `isDevBypassActive` es false en producción.
    const cookieStore = await cookies();
    if (!isDevBypassActive(cookieStore.get("itera_dev_bypass")?.value)) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }
    const { data: demoUser } = await admin
      .schema("simulador")
      .from("users")
      .select("id")
      .ilike("email", "ana.demo@%")
      .limit(1)
      .maybeSingle();
    simUserId = (demoUser?.id as string) ?? null;
  }

  if (!simUserId) return NextResponse.json(emptySummary());

  // Sesiones del user → reportes participant_mirror visibles.
  const { data: sessions } = await admin
    .schema("simulador")
    .from("simulation_sessions")
    .select("id, completed_at, started_at, case_variant_id")
    .eq("user_id", simUserId);

  const practice = await fetchPractice(admin, simUserId);

  if (!sessions?.length) {
    return NextResponse.json({ ...emptySummary(), practice });
  }

  const sessionIds = sessions.map((s) => s.id as string);
  const { data: reportRows } = await admin
    .schema("simulador")
    .from("reports")
    .select("id, simulation_session_id, status, payload_json, generated_at")
    .in("simulation_session_id", sessionIds)
    .eq("report_type", "participant_mirror");

  // Un reporte por sesión: gana el generated_at más reciente.
  const reportBySession = new Map<
    string,
    { payload: ReportPayload; generatedAt: string | null }
  >();
  for (const r of reportRows ?? []) {
    if (!VISIBLE_REPORT_STATUS.has(r.status as string)) continue;
    const sessionId = r.simulation_session_id as string | null;
    if (!sessionId) continue;
    const generatedAt = (r.generated_at as string) ?? null;
    const existing = reportBySession.get(sessionId);
    if (existing && (existing.generatedAt ?? "") >= (generatedAt ?? "")) continue;
    reportBySession.set(sessionId, {
      payload: r.payload_json as ReportPayload,
      generatedAt,
    });
  }

  if (reportBySession.size === 0) {
    return NextResponse.json({ ...emptySummary(), practice });
  }

  // Caso de cada sesión: case_variants → case_templates (slug, title).
  const sessionMeta = new Map(
    sessions.map((s) => [
      s.id as string,
      {
        completedAt: (s.completed_at as string) ?? null,
        startedAt: (s.started_at as string) ?? null,
        variantId: s.case_variant_id as string,
      },
    ]),
  );
  const variantIds = [
    ...new Set(
      [...reportBySession.keys()]
        .map((id) => sessionMeta.get(id)?.variantId)
        .filter((v): v is string => Boolean(v)),
    ),
  ];
  const { data: variants } = await admin
    .schema("simulador")
    .from("case_variants")
    .select("id, case_template_id")
    .in("id", variantIds);
  const templateByVariant = new Map(
    (variants ?? []).map((v) => [v.id as string, v.case_template_id as string]),
  );
  const templateIds = [...new Set(templateByVariant.values())];
  const { data: templates } = await admin
    .schema("simulador")
    .from("case_templates")
    .select("id, slug, title")
    .in("id", templateIds);
  const templateById = new Map(
    (templates ?? []).map((t) => [
      t.id as string,
      { slug: t.slug as string, title: t.title as string },
    ]),
  );

  // Entradas por caso en orden cronológico (viejo → reciente).
  const entries = [...reportBySession.entries()]
    .map(([sessionId, report]) => {
      const meta = sessionMeta.get(sessionId);
      const templateId = meta ? templateByVariant.get(meta.variantId) : undefined;
      const template = templateId ? templateById.get(templateId) : undefined;
      const overall = computeOverall(report.payload ?? {});
      const sortKey =
        meta?.completedAt ?? report.generatedAt ?? meta?.startedAt ?? "";
      return {
        sessionId,
        slug: template?.slug ?? "",
        title: template?.title ?? "Caso",
        band: overall.band,
        score: overall.score,
        completedAt: meta?.completedAt ?? report.generatedAt,
        payload: report.payload,
        sortKey,
      };
    })
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  // ── Global ────────────────────────────────────────────────────────────────
  const bandDistribution: Record<BandKey, number> = { A: 0, M: 0, B: 0 };
  for (const e of entries) bandDistribution[e.band] += 1;
  const avgScore = Math.round(
    entries.reduce((acc, e) => acc + e.score, 0) / entries.length,
  );
  // Moda de bandas; empate se resuelve con la banda del score promedio (R-13).
  const topCount = Math.max(...(["A", "M", "B"] as BandKey[]).map((b) => bandDistribution[b]));
  const modeBands = (["A", "M", "B"] as BandKey[]).filter(
    (b) => bandDistribution[b] === topCount,
  );
  const globalBand =
    modeBands.length === 1 ? modeBands[0] : bandFromScore100(avgScore);

  const lastEntry = entries[entries.length - 1];
  const rawRecommendation = lastEntry.payload?.recommendation;
  const recommendation =
    rawRecommendation && RECOMMENDATION_ACTIONS.has(rawRecommendation.action)
      ? {
          action: rawRecommendation.action,
          reason:
            typeof rawRecommendation.reason === "string"
              ? rawRecommendation.reason
              : "",
          appliesTo:
            typeof rawRecommendation.applies_to === "string"
              ? rawRecommendation.applies_to
              : null,
        }
      : null;

  const lastActivityAt = entries.reduce<string | null>(
    (acc, e) =>
      e.completedAt && (!acc || e.completedAt > acc) ? e.completedAt : acc,
    null,
  );

  // ── Dimensiones ───────────────────────────────────────────────────────────
  const perDimension = new Map<
    string,
    { trend: BandKey[]; latestRationale: string | null; perCase: { entry: (typeof entries)[number]; band: BandKey }[] }
  >(DIMENSIONS.map((d) => [d.id, { trend: [], latestRationale: null, perCase: [] }]));

  for (const entry of entries) {
    const normalized = normalizeReportDimensions(entry.payload ?? {});
    for (const dim of normalized) {
      const agg = perDimension.get(dim.id);
      if (!agg) continue;
      agg.trend.push(dim.band);
      agg.latestRationale = dim.rationale || agg.latestRationale;
      agg.perCase.push({ entry, band: dim.band });
    }
  }

  const dimensions: ReportSummaryDimension[] = DIMENSIONS.map((d) => {
    const agg = perDimension.get(d.id)!;
    const score = Math.round(
      agg.trend.reduce((acc, b) => acc + BAND_REPRESENTATIVE_SCORE[b], 0) /
        Math.max(agg.trend.length, 1),
    );
    // Mejor/peor caso solo cuando hay ≥2 casos y las bandas difieren.
    let bestCase: ReportSummaryDimension["bestCase"] = null;
    let worstCase: ReportSummaryDimension["worstCase"] = null;
    if (agg.perCase.length >= 2) {
      const sorted = [...agg.perCase].sort(
        (a, b) => BAND_RANK[b.band] - BAND_RANK[a.band],
      );
      const best = sorted[0];
      const worst = sorted[sorted.length - 1];
      if (best.band !== worst.band && best.entry.slug && worst.entry.slug) {
        bestCase = { slug: best.entry.slug, title: best.entry.title };
        worstCase = { slug: worst.entry.slug, title: worst.entry.title };
      }
    }
    return {
      id: d.id,
      score,
      band: bandFromScore100(score),
      trend: agg.trend,
      latestRationale: agg.latestRationale,
      bestCase,
      worstCase,
    };
  });

  // ── Risk events ───────────────────────────────────────────────────────────
  const riskByType = new Map<string, ReportSummaryRiskEvent>();
  for (const entry of entries) {
    const events = Array.isArray(entry.payload?.risk_events)
      ? entry.payload.risk_events
      : [];
    for (const event of events) {
      if (typeof event?.type !== "string" || !event.type) continue;
      const severity: RiskSeverity = isSeverity(event.severity)
        ? event.severity
        : "low";
      const current = riskByType.get(event.type);
      if (!current) {
        riskByType.set(event.type, {
          type: event.type,
          count: 1,
          maxSeverity: severity,
        });
      } else {
        current.count += 1;
        if (SEVERITY_RANK[severity] > SEVERITY_RANK[current.maxSeverity]) {
          current.maxSeverity = severity;
        }
      }
    }
  }
  const riskEvents = [...riskByType.values()].sort(
    (a, b) =>
      SEVERITY_RANK[b.maxSeverity] - SEVERITY_RANK[a.maxSeverity] ||
      b.count - a.count,
  );

  const cases: ReportSummaryCase[] = [...entries]
    .reverse()
    .map(({ sessionId, slug, title, band, score, completedAt }) => ({
      sessionId,
      slug,
      title,
      band,
      score,
      completedAt,
    }));

  const summary: ReportSummary = {
    global: {
      casesCompleted: entries.length,
      band: globalBand,
      score: avgScore,
      bandDistribution,
      lastActivityAt,
      recommendation,
    },
    dimensions,
    riskEvents,
    cases,
    practice,
  };

  return NextResponse.json(summary);
}

type AdminClient = ReturnType<typeof createAdminClient>;

/** Practice unlocks del user con su beat. Nunca rompe el resumen: a lo sumo []. */
async function fetchPractice(
  admin: AdminClient,
  simUserId: string,
): Promise<ReportSummaryPractice[]> {
  try {
    const { data } = await admin
      .schema("simulador")
      .from("practice_unlocks")
      .select("status, unlocked_at, practice_beats(slug, title, duration_estimate_min)")
      .eq("user_id", simUserId)
      .order("unlocked_at", { ascending: false });

    const bySlug = new Map<string, ReportSummaryPractice>();
    for (const row of data ?? []) {
      const beatRaw = (row as { practice_beats: unknown }).practice_beats;
      const beat = (Array.isArray(beatRaw) ? beatRaw[0] : beatRaw) as {
        slug?: string;
        title?: string;
        duration_estimate_min?: number;
      } | null;
      if (!beat?.slug || !beat.title || bySlug.has(beat.slug)) continue;
      bySlug.set(beat.slug, {
        slug: beat.slug,
        title: beat.title,
        status: String(row.status ?? "unlocked"),
        durationMin: beat.duration_estimate_min ?? 5,
      });
    }
    return [...bySlug.values()];
  } catch {
    return [];
  }
}
