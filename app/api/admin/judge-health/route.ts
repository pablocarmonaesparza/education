/**
 * GET /api/admin/judge-health
 *
 * Observabilidad operacional del judge: volumen, recomendaciones,
 * cola humana, modelos usados y runs recientes. Es health interno, no métrica
 * comercial para el manager.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSimuladorStaff } from "@/lib/simulador/admin-auth";

export const runtime = "nodejs";

type EvaluationRunRow = {
  id: string;
  simulation_session_id: string;
  judge_model: string;
  judge_prompt_version: string;
  computed_recommendation: string | null;
  dimension_scores_json: unknown;
  risk_summary_json: unknown;
  created_at: string;
};

type QueueRow = {
  id: string;
  evaluation_run_id: string;
  status: string;
  due_at: string | null;
  required_review_count: number;
  completed_review_count: number;
  triggered_by: string;
  created_at: string;
};

export async function GET(req: NextRequest) {
  const staff = await requireSimuladorStaff();
  if (!staff.ok) return staff.response;

  const { searchParams } = new URL(req.url);
  const days = Math.min(
    Math.max(Number(searchParams.get("days") ?? "30") || 30, 1),
    90,
  );
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const admin = createAdminClient();

  const [{ data: runs, error: runsError }, { data: queue, error: queueError }] =
    await Promise.all([
      admin
        .schema("simulador")
        .from("evaluation_runs")
        .select(
          "id, simulation_session_id, judge_model, judge_prompt_version, computed_recommendation, dimension_scores_json, risk_summary_json, created_at",
        )
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(200),
      admin
        .schema("simulador")
        .from("human_review_queue")
        .select(
          "id, evaluation_run_id, status, due_at, required_review_count, completed_review_count, triggered_by, created_at",
        )
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

  if (runsError || queueError) {
    console.error("[admin/judge-health] list failed", { runsError, queueError });
    return NextResponse.json(
      { error: "Could not read judge health." },
      { status: 500 },
    );
  }

  const runRows = (runs ?? []) as EvaluationRunRow[];
  const queueRows = (queue ?? []) as QueueRow[];
  const openQueue = queueRows.filter((item) =>
    ["queued", "in_review"].includes(item.status),
  );
  const overdueQueue = openQueue.filter(
    (item) => item.due_at && new Date(item.due_at).getTime() < Date.now(),
  );

  return NextResponse.json({
    window_days: days,
    summary: {
      evaluation_runs: runRows.length,
      review_required: queueRows.length,
      open_review: openQueue.length,
      overdue_review: overdueQueue.length,
      high_risk_reviews: queueRows.filter(
        (item) => item.triggered_by === "risk_high",
      ).length,
      recommendations: countBy(runRows, "computed_recommendation"),
      models: countBy(runRows, "judge_model"),
      prompt_versions: countBy(runRows, "judge_prompt_version"),
      risk_events: countRiskEvents(runRows),
    },
    recent_runs: runRows.slice(0, 25).map((run) => ({
      id: run.id,
      session_id: run.simulation_session_id,
      judge_model: run.judge_model,
      prompt_version: run.judge_prompt_version,
      recommendation: run.computed_recommendation,
      risk_events_count: riskEvents(run.risk_summary_json).length,
      high_risk_count: riskEvents(run.risk_summary_json).filter(
        (event) => event.severity === "high",
      ).length,
      created_at: run.created_at,
    })),
    review_queue: openQueue.slice(0, 25),
  });
}

function countBy<T extends Record<string, unknown>>(rows: T[], key: keyof T) {
  const result: Record<string, number> = {};
  for (const row of rows) {
    const value = row[key];
    const label = typeof value === "string" && value ? value : "unknown";
    result[label] = (result[label] ?? 0) + 1;
  }
  return result;
}

function countRiskEvents(rows: EvaluationRunRow[]) {
  const counts = { total: 0, high: 0, medium: 0, low: 0 };
  for (const run of rows) {
    for (const event of riskEvents(run.risk_summary_json)) {
      counts.total += 1;
      if (event.severity === "high") counts.high += 1;
      if (event.severity === "medium") counts.medium += 1;
      if (event.severity === "low") counts.low += 1;
    }
  }
  return counts;
}

function riskEvents(value: unknown): Array<{ severity?: string }> {
  return Array.isArray(value) ? (value as Array<{ severity?: string }>) : [];
}
