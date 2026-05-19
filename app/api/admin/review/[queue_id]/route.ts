/**
 * POST /api/admin/review/[queue_id]
 *
 * Firma un item de la cola. Para risk high se requieren dos firmas de staff
 * distintas antes de publicar el report. La primera firma mantiene el report
 * en pending_review; la segunda publica.
 *
 * Body (todos opcionales):
 *   {
 *     decision?: "approve"|"override"|"escalate",
 *     override_recommendation?: "pilotar"|"entrenar"|"pausar"|"escalar",
 *     override_dimension_scores?: [{id, band, rationale, confidence}],
 *     resolver_notes?: string
 *   }
 *
 * Si no se mandan overrides → firma con el output del judge tal cual.
 *
 * Acceso: solo staff de Itera (isStaffEmail).
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaffEmail } from "@/lib/simulador/is-staff";

export const runtime = "nodejs";

interface OverrideDimension {
  id: string;
  band: "A" | "M" | "B";
  rationale?: string;
  confidence?: number;
}

interface ResolveBody {
  decision?: "approve" | "override" | "escalate";
  override_recommendation?: "pilotar" | "entrenar" | "pausar" | "escalar";
  override_dimension_scores?: OverrideDimension[];
  resolver_notes?: string;
}

interface ReviewDecisionRow {
  id: string;
  reviewer_user_id: string;
  decision: "approve" | "override" | "escalate";
  reviewer_notes: string | null;
  override_dimension_scores_json: OverrideDimension[] | null;
  override_recommendation: "pilotar" | "entrenar" | "pausar" | "escalar" | null;
  created_at: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ queue_id: string }> },
) {
  const { queue_id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  if (!isStaffEmail(user.email)) {
    return NextResponse.json(
      { error: "Acceso restringido a staff de Itera." },
      { status: 403 },
    );
  }

  let body: ResolveBody;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const admin = createAdminClient();
  const { data: staffBridgeUserId, error: staffErr } = await admin
    .schema("simulador")
    .rpc("ensure_bridge_user", { p_auth_user_id: user.id });

  if (staffErr || !staffBridgeUserId) {
    console.error("[admin/review/resolve] staff bridge failed", staffErr);
    return NextResponse.json(
      { error: "No se pudo inicializar el usuario staff." },
      { status: 500 },
    );
  }

  // Cargar el item + run + report.
  const { data: item } = await admin
    .schema("simulador")
    .from("human_review_queue")
    .select(
      "id, evaluation_run_id, status, required_review_count, completed_review_count",
    )
    .eq("id", queue_id)
    .maybeSingle();

  if (!item) {
    return NextResponse.json(
      { error: "Item de queue no encontrado." },
      { status: 404 },
    );
  }
  if (item.status !== "queued" && item.status !== "in_review") {
    return NextResponse.json(
      { error: `Item ya está en status=${item.status}.` },
      { status: 400 },
    );
  }

  const { data: existingDecision } = await admin
    .schema("simulador")
    .from("human_review_decisions")
    .select("id")
    .eq("queue_id", queue_id)
    .eq("reviewer_user_id", staffBridgeUserId)
    .maybeSingle();

  if (existingDecision) {
    return NextResponse.json(
      {
        error:
          "Este item requiere firmas de personas distintas. Tú ya firmaste esta revisión.",
      },
      { status: 409 },
    );
  }

  const { data: previousDecisions } = await admin
    .schema("simulador")
    .from("human_review_decisions")
    .select(
      "id, reviewer_user_id, decision, reviewer_notes, override_dimension_scores_json, override_recommendation, created_at",
    )
    .eq("queue_id", queue_id)
    .order("created_at", { ascending: false });

  const requestedDecision: ResolveBody["decision"] =
    body.decision ??
    (body.override_recommendation || body.override_dimension_scores
      ? "override"
      : "approve");

  const { data: newDecision, error: decisionErr } = await admin
    .schema("simulador")
    .from("human_review_decisions")
    .insert({
      queue_id,
      reviewer_user_id: staffBridgeUserId,
      decision: requestedDecision,
      reviewer_notes: body.resolver_notes ?? null,
      override_dimension_scores_json: body.override_dimension_scores ?? null,
      override_recommendation: body.override_recommendation ?? null,
      report_payload_patch_json: {},
    })
    .select(
      "id, reviewer_user_id, decision, reviewer_notes, override_dimension_scores_json, override_recommendation, created_at",
    )
    .single();

  if (decisionErr || !newDecision) {
    console.error("[admin/review/resolve] decision insert failed", decisionErr);
    return NextResponse.json(
      { error: "No se pudo guardar la firma de revisión." },
      { status: 500 },
    );
  }

  const allDecisions = [
    newDecision as ReviewDecisionRow,
    ...((previousDecisions ?? []) as ReviewDecisionRow[]),
  ];
  const completedCount = allDecisions.length;
  const requiredCount = item.required_review_count ?? 1;
  const decisionSummary = allDecisions.map((decision) => ({
    decision_id: decision.id,
    reviewer_user_id: decision.reviewer_user_id,
    decision: decision.decision,
    has_override: Boolean(
      decision.override_recommendation ||
        decision.override_dimension_scores_json,
    ),
    created_at: decision.created_at,
  }));

  const { data: evalRun } = await admin
    .schema("simulador")
    .from("evaluation_runs")
    .select("id, simulation_session_id")
    .eq("id", item.evaluation_run_id)
    .maybeSingle();

  if (!evalRun) {
    return NextResponse.json(
      { error: "evaluation_run no encontrado." },
      { status: 500 },
    );
  }

  if (requestedDecision === "escalate") {
    const { error: qEscErr } = await admin
      .schema("simulador")
      .from("human_review_queue")
      .update({
        status: "escalated",
        completed_review_count: completedCount,
        last_reviewed_at: new Date().toISOString(),
        resolver_notes: body.resolver_notes ?? null,
        decision_summary_json: decisionSummary,
      })
      .eq("id", queue_id);

    if (qEscErr) {
      console.error("[admin/review/resolve] queue escalate failed", qEscErr);
      return NextResponse.json(
        { error: "No se pudo escalar el item." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      status: "escalated",
      signatures: {
        completed: completedCount,
        required: requiredCount,
      },
    });
  }

  if (completedCount < requiredCount) {
    const { error: qPartialErr } = await admin
      .schema("simulador")
      .from("human_review_queue")
      .update({
        status: "in_review",
        assigned_to: staffBridgeUserId,
        completed_review_count: completedCount,
        last_reviewed_at: new Date().toISOString(),
        resolver_notes: body.resolver_notes ?? null,
        decision_summary_json: decisionSummary,
      })
      .eq("id", queue_id);

    if (qPartialErr) {
      console.error("[admin/review/resolve] queue partial failed", qPartialErr);
      return NextResponse.json(
        { error: "No se pudo actualizar la revisión." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      status: "in_review",
      report_status: "pending_review",
      signatures: {
        completed: completedCount,
        required: requiredCount,
      },
    });
  }

  const { data: report } = await admin
    .schema("simulador")
    .from("reports")
    .select("id, payload_json")
    .eq("simulation_session_id", evalRun.simulation_session_id)
    .eq("report_type", "participant_mirror")
    .maybeSingle();

  if (!report) {
    return NextResponse.json(
      { error: "Report no encontrado para esta sesión." },
      { status: 500 },
    );
  }

  // Aplicar overrides al payload si vinieron.
  const payload =
    (report.payload_json as Record<string, unknown>) ?? {};

  const priorDimensionOverride = allDecisions.find(
    (decision) => decision.override_dimension_scores_json,
  )?.override_dimension_scores_json;
  const finalDimensionOverride =
    body.override_dimension_scores ?? priorDimensionOverride ?? null;

  const priorRecommendationOverride = allDecisions.find(
    (decision) => decision.override_recommendation,
  )?.override_recommendation;
  const finalRecommendationOverride =
    body.override_recommendation ?? priorRecommendationOverride ?? null;

  if (finalDimensionOverride) {
    payload.dimensions = finalDimensionOverride.map((d) => ({
      id: d.id,
      band: d.band,
      rationale: d.rationale ?? "(override staff)",
      confidence: d.confidence ?? 1.0,
    }));
  }
  if (finalRecommendationOverride) {
    const rec =
      (payload.recommendation as Record<string, unknown>) ?? {};
    payload.recommendation = { ...rec, action: finalRecommendationOverride };
  }

  // Update report → published.
  const now = new Date().toISOString();
  const { error: rUpdErr } = await admin
    .schema("simulador")
    .from("reports")
    .update({
      status: "published",
      payload_json: payload,
      generated_at: now,
    })
    .eq("id", report.id);

  if (rUpdErr) {
    console.error("[admin/review/resolve] report update failed", rUpdErr);
    return NextResponse.json(
      { error: "No se pudo publicar el report." },
      { status: 500 },
    );
  }

  // Marcar queue item resuelto.
  const { error: qUpdErr } = await admin
    .schema("simulador")
    .from("human_review_queue")
    .update({
      status: "resolved",
      resolved_at: now,
      published_at: now,
      completed_review_count: completedCount,
      last_reviewed_at: now,
      resolver_notes: body.resolver_notes ?? null,
      override_dimension_scores_json: finalDimensionOverride,
      override_recommendation: finalRecommendationOverride,
      decision_summary_json: decisionSummary,
    })
    .eq("id", queue_id);

  if (qUpdErr) {
    console.warn(
      "[admin/review/resolve] queue update failed (report ya publicado)",
      qUpdErr,
    );
  }

  return NextResponse.json({
    ok: true,
    report_id: report.id,
    status: "published",
    signatures: {
      completed: completedCount,
      required: requiredCount,
    },
  });
}
