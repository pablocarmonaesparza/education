/**
 * GET /api/admin/review
 *
 * Lista la cola de review humano (status='pending') con datos del
 * evaluation_run + report draft adjuntos. Sólo accesible para staff Itera
 * (allowlist por email — ver lib/simulador/is-staff.ts).
 *
 * Respuesta:
 *   200 { items: [{ queue_id, due_at, eval, report, session_id }] }
 *   401 / 403 según corresponda
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaffEmail } from "@/lib/simulador/is-staff";

export const runtime = "nodejs";

export async function GET() {
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

  const admin = createAdminClient();
  const { data: items, error } = await admin
    .schema("simulador")
    .from("human_review_queue")
    .select(
      "id, evaluation_run_id, triggered_by, status, due_at, created_at, resolver_notes, override_recommendation",
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
    if (evalRun?.simulation_session_id) {
      const { data: r } = await admin
        .schema("simulador")
        .from("reports")
        .select("id, status, payload_json, generated_at")
        .eq("simulation_session_id", evalRun.simulation_session_id)
        .eq("report_type", "participant_mirror")
        .maybeSingle();
      report = r ?? null;
    }

    enriched.push({
      queue_id: it.id,
      triggered_by: it.triggered_by,
      due_at: it.due_at,
      created_at: it.created_at,
      session_id: evalRun?.simulation_session_id ?? null,
      evaluation_run: evalRun,
      report,
    });
  }

  return NextResponse.json({ items: enriched });
}
