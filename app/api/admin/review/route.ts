/**
 * GET /api/admin/review
 *
 * Lista la cola de review humano (queued/in_review) con datos del
 * evaluation_run + report draft adjuntos. Sólo accesible para staff Itera
 * (allowlist por email — ver lib/simulador/is-staff.ts).
 *
 * Respuesta:
 *   200 { items: [{ queue_id, due_at, signatures, eval, report, session_id }] }
 *   401 / 403 según corresponda
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSimuladorStaff } from "@/lib/simulador/admin-auth";

export const runtime = "nodejs";

type RiskEvent = {
  type?: string;
  severity?: "low" | "medium" | "high";
  step_ordinal?: number;
  evidence_text?: string;
};

type EvaluationRunRow = {
  id: string;
  simulation_session_id: string | null;
  rubric_version: string;
  judge_model: string;
  computed_recommendation: string;
  dimension_scores_json: unknown;
  risk_summary_json: unknown;
  raw_judge_output_json: unknown;
  override_applied_json: unknown;
  created_at: string;
};

export async function GET() {
  const staff = await requireSimuladorStaff();
  if (!staff.ok) return staff.response;

  const admin = createAdminClient();
  let staffBridgeUserId: string | null = null;

  if (staff.user) {
    const { data: bridgeUserId, error: staffErr } = await admin
      .schema("simulador")
      .rpc("ensure_bridge_user", { p_auth_user_id: staff.user.id });

    if (staffErr || !bridgeUserId) {
      console.error("[admin/review] staff bridge failed", staffErr);
      return NextResponse.json(
        { error: "No se pudo inicializar el usuario staff." },
        { status: 500 },
      );
    }

    staffBridgeUserId = bridgeUserId;
  }

  const { data: items, error } = await admin
    .schema("simulador")
    .from("human_review_queue")
    .select(
      "id, evaluation_run_id, triggered_by, status, due_at, created_at, resolver_notes, override_recommendation, required_review_count, completed_review_count, review_policy, last_reviewed_at, published_at",
    )
    .in("status", ["queued", "in_review"])
    .order("due_at", { ascending: true });

  if (error) {
    console.error("[admin/review] list failed", error);
    return NextResponse.json(
      { error: "Error listando la cola." },
      { status: 500 },
    );
  }

  // Enriquecer con evaluation_run + report draft.
  const enriched: unknown[] = [];
  for (const it of items ?? []) {
    const { data: evalRun } = await admin
      .schema("simulador")
      .from("evaluation_runs")
      .select(
        "id, simulation_session_id, rubric_version, judge_model, computed_recommendation, dimension_scores_json, risk_summary_json, raw_judge_output_json, override_applied_json, created_at",
      )
      .eq("id", it.evaluation_run_id)
      .maybeSingle();

    let report = null;
    let decisions = null;
    const evalRunRow = evalRun as EvaluationRunRow | null;

    if (evalRunRow?.simulation_session_id) {
      const { data: r } = await admin
        .schema("simulador")
        .from("reports")
        .select("id, status, payload_json, generated_at")
        .eq("simulation_session_id", evalRunRow.simulation_session_id)
        .eq("report_type", "participant_mirror")
        .maybeSingle();
      report = r ?? null;
    }

    const { data: reviewDecisions } = await admin
      .schema("simulador")
      .from("human_review_decisions")
      .select(
        "id, reviewer_user_id, decision, reviewer_notes, override_recommendation, override_dimension_scores_json, created_at",
      )
      .eq("queue_id", it.id)
      .order("created_at", { ascending: true });
    decisions = reviewDecisions ?? [];

    enriched.push({
      queue_id: it.id,
      triggered_by: it.triggered_by,
      status: it.status,
      due_at: it.due_at,
      created_at: it.created_at,
      review_policy: it.review_policy,
      required_review_count: it.required_review_count,
      completed_review_count: it.completed_review_count,
      last_reviewed_at: it.last_reviewed_at,
      published_at: it.published_at,
      session_id: evalRunRow?.simulation_session_id ?? null,
      evaluation_run: evalRunRow
        ? {
            ...evalRunRow,
            dimension_scores_json: Array.isArray(evalRunRow.dimension_scores_json)
              ? evalRunRow.dimension_scores_json
              : [],
            risk_summary_json: normalizeRiskEvents(
              evalRunRow.risk_summary_json,
              evalRunRow.raw_judge_output_json,
            ),
          }
        : null,
      report,
      review_decisions: decisions,
    });
  }

  return NextResponse.json({ items: enriched, current_staff_user_id: staffBridgeUserId });
}

function normalizeRiskEvents(summary: unknown, rawOutput: unknown): RiskEvent[] {
  if (Array.isArray(summary)) return summary as RiskEvent[];
  if (
    rawOutput &&
    typeof rawOutput === "object" &&
    Array.isArray((rawOutput as { risk_events?: unknown }).risk_events)
  ) {
    return (rawOutput as { risk_events: RiskEvent[] }).risk_events;
  }
  return [];
}
