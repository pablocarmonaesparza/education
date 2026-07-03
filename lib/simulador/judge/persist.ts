/**
 * Persiste el resultado del judge en BD.
 *
 * Inserta en orden:
 *   1. evaluation_runs (snapshot del input + raw output + override log)
 *   2. risk_events (uno por entry, con session_id + step_id resuelto desde ordinal)
 *   3. reports (status='pending_review' si hay risk high, sino 'published')
 *   4. human_review_queue (si pending_review)
 *   5. practice_unlocks (gap → beat vía case_practice_beats; fallback por
 *      dimensión en banda B/M contra el catálogo activo de beats)
 *
 * Idempotencia: si ya existe un evaluation_run para la SESIÓN, la función
 * devuelve `{ skipped: true, reason }` sin tocar nada. Con `force: true` se
 * inserta un run nuevo y se actualiza el report existente; si la rúbrica
 * vigente difiere de la del run original, el re-run queda marcado en
 * input_snapshot_json.re_evaluation (R-14 — nunca re-evaluación silenciosa
 * de históricos con rúbrica nueva).
 *
 * Toda la persistencia usa admin client (corre desde `after()` sin auth ctx).
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { sendReportReadyEmailsForSession } from "@/lib/email/simulador-notifications";
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
  // Siempre leemos el run previo (si existe): sin force es el corte de
  // idempotencia; con force sirve para detectar re-evaluación con rúbrica
  // distinta (R-14 — la política dice "no re-evaluamos históricos": si la
  // rúbrica cambió, el re-run queda marcado como auditable, nunca silencioso).
  const { data: previousRun } = await admin
    .schema("simulador")
    .from("evaluation_runs")
    .select("id, rubric_version")
    .eq("simulation_session_id", simulationSessionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!options.force && previousRun) {
    return {
      skipped: true,
      reason: "evaluation_run ya existe para esta sesión",
      evaluation_run_id: previousRun.id,
    };
  }

  // ── Run judge ────────────────────────────────────────────────────────────
  const result = await evaluate(simulationSessionId);

  // R-14: re-evaluación forzada con una rúbrica distinta a la del run original.
  const rubricChangedOnForce = Boolean(
    options.force &&
      previousRun &&
      previousRun.rubric_version !== result.meta.rubricVersion,
  );
  if (rubricChangedOnForce) {
    console.warn(
      `[judge/persist] force re-eval de ${simulationSessionId} con rúbrica ` +
        `${result.meta.rubricVersion} (original: ${previousRun?.rubric_version}). ` +
        `Queda marcado en input_snapshot_json.re_evaluation.`,
    );
  }

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
        // R-14: auditoría de re-evaluación — solo presente cuando un force
        // re-corrió el judge con una rúbrica distinta a la del run original.
        ...(rubricChangedOnForce
          ? {
              re_evaluation: {
                previous_run_id: previousRun?.id ?? null,
                previous_rubric_version: previousRun?.rubric_version ?? null,
                forced_at: new Date().toISOString(),
              },
            }
          : {}),
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
  const isNewReport = !existingReport;
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
        due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        required_review_count: 2,
        completed_review_count: 0,
        review_policy: "double_high_risk",
      });
    if (hqErr) {
      console.warn("[judge/persist] human_review_queue insert warn", hqErr);
    }
  }

  // ── 5. Practice unlocks: gap → beat, fallback por dimensión débil ────────
  // Cierra el eslabón evaluación → remediación: cada gap con mapping en
  // case_practice_beats desbloquea su beat; las dimensiones en banda B/M sin
  // gap mapeado caen al catálogo activo por dimension_key. Nunca debe romper
  // la persistencia del reporte — solo warns.
  try {
    const { data: gapDefs } = await admin
      .schema("simulador")
      .from("gap_definitions")
      .select("id, gap_key, dimension_key")
      .eq("case_template_id", tmpl.id);
    const gapDefByKey = new Map(
      (gapDefs ?? []).map((g) => [g.gap_key as string, g]),
    );

    const { data: beatMappings } = await admin
      .schema("simulador")
      .from("case_practice_beats")
      .select("gap_definition_id, practice_beat_id")
      .eq("case_template_id", tmpl.id);
    const beatByGapDefId = new Map(
      (beatMappings ?? []).map((m) => [
        m.gap_definition_id as string,
        m.practice_beat_id as string,
      ]),
    );

    const dueAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const unlockRows: Array<{
      user_id: string;
      sprint_id: string | null;
      practice_beat_id: string;
      source_session_id: string;
      gap_key: string | null;
      dimension_key: string | null;
      unlock_reason: string;
      due_at: string;
    }> = [];
    const coveredDimensions = new Set<string>();

    for (const gap of result.final.gaps) {
      const def = gapDefByKey.get(gap.id);
      const beatId = def ? beatByGapDefId.get(def.id as string) : undefined;
      if (!def || !beatId) continue;
      unlockRows.push({
        user_id: session.user_id,
        sprint_id: session.sprint_id ?? null,
        practice_beat_id: beatId,
        source_session_id: simulationSessionId,
        gap_key: def.gap_key as string,
        dimension_key: def.dimension_key as string,
        unlock_reason: `gap:${def.gap_key}`,
        due_at: dueAt,
      });
      coveredDimensions.add(def.dimension_key as string);
    }

    const weakDims = result.final.dimensions
      .filter((d) => d.band === "B" || d.band === "M")
      .map((d) => d.id)
      .filter((d) => !coveredDimensions.has(d));
    if (weakDims.length > 0) {
      const { data: fallbackBeats } = await admin
        .schema("simulador")
        .from("practice_beats")
        .select("id, dimension_key, level")
        .eq("status", "active")
        .in("dimension_key", weakDims)
        .order("level", { ascending: true });
      const beatByDim = new Map<string, string>();
      for (const b of fallbackBeats ?? []) {
        const dim = b.dimension_key as string;
        if (!beatByDim.has(dim)) beatByDim.set(dim, b.id as string);
      }
      for (const dim of weakDims) {
        const beatId = beatByDim.get(dim);
        if (!beatId) continue;
        unlockRows.push({
          user_id: session.user_id,
          sprint_id: session.sprint_id ?? null,
          practice_beat_id: beatId,
          source_session_id: simulationSessionId,
          gap_key: null,
          dimension_key: dim,
          unlock_reason: `weak_dimension:${dim}`,
          due_at: dueAt,
        });
      }
    }

    // Dos gaps pueden mapear al mismo beat — un unlock por beat y sesión.
    const seenBeats = new Set<string>();
    const dedupedUnlocks = unlockRows.filter((row) => {
      if (seenBeats.has(row.practice_beat_id)) return false;
      seenBeats.add(row.practice_beat_id);
      return true;
    });

    if (dedupedUnlocks.length > 0) {
      const { error: puErr } = await admin
        .schema("simulador")
        .from("practice_unlocks")
        .upsert(dedupedUnlocks, {
          onConflict: "user_id,practice_beat_id,source_session_id",
          ignoreDuplicates: true,
        });
      if (puErr) {
        console.warn("[judge/persist] practice_unlocks upsert warn", puErr);
      }
    }
  } catch (puEx) {
    console.warn("[judge/persist] practice_unlocks step failed", puEx);
  }

  if (reportStatus === "published" && isNewReport) {
    await sendReportReadyEmailsForSession({
      simulationSessionId,
      reportId,
      payloadJson,
    });
  }

  return {
    skipped: false,
    evaluation_run_id: evalRun.id,
    report_id: reportId,
    report_status: reportStatus,
    result,
  };
}
