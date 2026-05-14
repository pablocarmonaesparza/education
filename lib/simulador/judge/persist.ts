/**
 * Persiste el resultado del judge en BD.
 *
 * Inserta en orden:
 *   1. evaluation_runs (snapshot del input + raw output + override log)
 *   2. risk_events (uno por entry, con session_id + step_id resuelto desde ordinal)
 *   3. reports (status='pending_review' si hay risk high, sino 'published')
 *   4. human_review_queue (si pending_review)
 *
 * Idempotencia: si ya existe un evaluation_run para la sesión + rubric_version,
 * la función devuelve `{ skipped: true, reason }` sin tocar nada. Para
 * forzar re-evaluación, pasar `force: true` y la función inserta un nuevo
 * run + actualiza el report existente.
 *
 * Toda la persistencia usa admin client (corre desde `after()` sin auth ctx).
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { evaluate, type EvaluateResult } from "./index";
import type { JudgeRiskEvent } from "./types";

export interface PersistOptions {
  force?: boolean;
}

export interface PersistResult {
  skipped: boolean;
  reason?: string;
  evaluation_run_id?: string;
  report_id?: string;
  report_status?: "pending_review" | "published";
  result?: EvaluateResult;
}

const SERVICE_ACCOUNT_NULL = null;

export async function evaluateAndPersist(
  simulationSessionId: string,
  options: PersistOptions = {},
): Promise<PersistResult> {
  const admin = createAdminClient();

  // ── Idempotency check ────────────────────────────────────────────────────
  if (!options.force) {
    const { data: existing } = await admin
      .schema("simulador")
      .from("evaluation_runs")
      .select("id")
      .eq("simulation_session_id", simulationSessionId)
      .limit(1)
      .maybeSingle();
    if (existing) {
      return {
        skipped: true,
        reason: "evaluation_run ya existe para esta sesión",
        evaluation_run_id: existing.id,
      };
    }
  }

  // ── Run judge ────────────────────────────────────────────────────────────
  const result = await evaluate(simulationSessionId);

  // ── Resolver session + template/rubric ids ──────────────────────────────
  const { data: session } = await admin
    .schema("simulador")
    .from("simulation_sessions")
    .select("sprint_id, user_id, case_variant_id")
    .eq("id", simulationSessionId)
    .single();
  if (!session) throw new Error("session no encontrada al persistir");

  const { data: variant } = await admin
    .schema("simulador")
    .from("case_variants")
    .select("case_template_id")
    .eq("id", session.case_variant_id)
    .single();
  if (!variant) throw new Error("case_variant no encontrado al persistir");

  const { data: tmpl } = await admin
    .schema("simulador")
    .from("case_templates")
    .select("id, rubric_id")
    .eq("id", variant.case_template_id)
    .single();
  if (!tmpl) throw new Error("case_template no encontrado al persistir");

  // ── Resolver case_step_id por ordinal (para risk_events FK) ─────────────
  const { data: caseSteps } = await admin
    .schema("simulador")
    .from("case_steps")
    .select("id, ordinal")
    .eq("case_template_id", tmpl.id);

  const stepIdByOrdinal: Record<number, string> = {};
  for (const s of caseSteps ?? []) {
    stepIdByOrdinal[s.ordinal as number] = s.id as string;
  }

  // ── 1. Insert evaluation_run ────────────────────────────────────────────
  const { data: evalRun, error: erErr } = await admin
    .schema("simulador")
    .from("evaluation_runs")
    .insert({
      simulation_session_id: simulationSessionId,
      rubric_id: tmpl.rubric_id,
      rubric_version: result.meta.rubricVersion,
      judge_model: result.meta.model,
      judge_prompt_version: result.meta.promptVersion,
      input_snapshot_json: {
        system_prompt: result.context.rubric.title,
        steps: result.context.steps,
        responses: result.context.responses,
      },
      dimension_scores_json: result.final.dimensions,
      gap_tags_json: result.final.gaps,
      risk_summary_json: result.final.risk_events,
      raw_judge_output_json: result.raw,
      computed_recommendation: result.final.recommendation.action,
      override_applied_json: { applied: result.overridesApplied },
    })
    .select("id")
    .single();

  if (erErr || !evalRun) {
    console.error("[judge/persist] evaluation_runs insert failed", erErr);
    throw new Error(
      `No se pudo persistir evaluation_run: ${erErr?.message ?? "unknown"}`,
    );
  }

  // ── 2. Insert risk_events ───────────────────────────────────────────────
  // Filtramos events sin step_id válido (LLM podría devolver ordinal fuera
  // de rango). El loop deja en logs si pasa.
  const riskRows = result.final.risk_events
    .map((e: JudgeRiskEvent) => {
      const caseStepId = stepIdByOrdinal[e.step_ordinal];
      if (!caseStepId) {
        console.warn(
          `[judge/persist] risk_event con step_ordinal=${e.step_ordinal} sin case_step match`,
        );
        return null;
      }
      return {
        simulation_session_id: simulationSessionId,
        case_step_id: caseStepId,
        event_type: e.type,
        severity: e.severity,
        dimension_key: null,
        sensitive_data_type: null,
        evidence_text: e.evidence_text,
        jurisdiction_of_data_subject: e.jurisdiction,
        transfer_basis_documented: e.transfer_basis_documented,
        detected_by: "judge" as const,
        judge_confidence: null,
        payload_json: { source: "judge_v1" },
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (riskRows.length > 0) {
    const { error: reErr } = await admin
      .schema("simulador")
      .from("risk_events")
      .insert(riskRows);
    if (reErr) {
      console.warn("[judge/persist] risk_events insert warn", reErr);
    }
  }

  // ── 3. Insert/upsert report ─────────────────────────────────────────────
  const hasHighRisk = result.final.risk_events.some(
    (e) => e.severity === "high",
  );
  const reportStatus: "pending_review" | "published" = hasHighRisk
    ? "pending_review"
    : "published";

  const payloadJson = {
    rubric_version: result.meta.rubricVersion,
    case_version: `${result.context.caseSlug}_v${result.context.caseVersion}`,
    variant: result.context.variantSlug,
    judge_model: result.meta.model,
    duration_ms: result.meta.durationMs,
    dimensions: result.final.dimensions,
    risk_events: result.final.risk_events,
    gaps: result.final.gaps,
    strengths: result.final.strengths,
    recommendation: result.final.recommendation,
    overrides_applied: result.overridesApplied,
  };

  // Si existe un report previo para esta session, lo upserteamos.
  const { data: existingReport } = await admin
    .schema("simulador")
    .from("reports")
    .select("id")
    .eq("simulation_session_id", simulationSessionId)
    .eq("report_type", "participant_mirror")
    .maybeSingle();

  let reportId: string;
  if (existingReport) {
    const { error: rUpdErr } = await admin
      .schema("simulador")
      .from("reports")
      .update({
        status: reportStatus,
        payload_json: payloadJson,
        generated_at: new Date().toISOString(),
        generated_by: SERVICE_ACCOUNT_NULL,
      })
      .eq("id", existingReport.id);
    if (rUpdErr) {
      console.error("[judge/persist] report update failed", rUpdErr);
      throw new Error("No se pudo actualizar report.");
    }
    reportId = existingReport.id;
  } else {
    const { data: newReport, error: rInsErr } = await admin
      .schema("simulador")
      .from("reports")
      .insert({
        sprint_id: session.sprint_id,
        user_id: session.user_id,
        simulation_session_id: simulationSessionId,
        report_type: "participant_mirror",
        status: reportStatus,
        payload_json: payloadJson,
        generated_at: new Date().toISOString(),
        generated_by: SERVICE_ACCOUNT_NULL,
      })
      .select("id")
      .single();
    if (rInsErr || !newReport) {
      console.error("[judge/persist] report insert failed", rInsErr);
      throw new Error("No se pudo crear report.");
    }
    reportId = newReport.id;
  }

  // ── 4. Si pending_review, push a human_review_queue ─────────────────────
  if (reportStatus === "pending_review") {
    const { error: hqErr } = await admin
      .schema("simulador")
      .from("human_review_queue")
      .insert({
        evaluation_run_id: evalRun.id,
        triggered_by: "high_risk_event",
        status: "queued",
        due_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      });
    if (hqErr) {
      console.warn("[judge/persist] human_review_queue insert warn", hqErr);
    }
  }

  return {
    skipped: false,
    evaluation_run_id: evalRun.id,
    report_id: reportId,
    report_status: reportStatus,
    result,
  };
}

