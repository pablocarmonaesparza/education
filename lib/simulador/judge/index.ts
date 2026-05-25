/**
 * Pipeline completo del judge: load context → runJudge → applyOverrides.
 *
 * `evaluate(simulationSessionId)` lee desde BD todo lo necesario, llama al
 * LLM, aplica overrides, y retorna el resultado listo para persistir.
 * No persiste en BD (eso lo hace el route handler).
 *
 * Usa el admin client porque corre en background (`after()`) sin contexto
 * de auth del user — el route handler ya validó autorización antes.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { applyOverrides } from "./apply-overrides";
import { runJudge } from "./run";
import type { JudgeInputContext, JudgeRunResult } from "./types";

interface CaseStepRow {
  ordinal: number;
  step_key: string;
  step_type: string;
  prompt_template: string | null;
  evaluates_dimensions: string[] | null;
}

interface CaseTemplateRow {
  id: string;
  slug: string;
  version: number;
  title: string;
  rubric_id: string;
}

interface CaseVariantRow {
  id: string;
  slug: string;
  case_template_id: string;
  inputs_resolved_json: Record<string, unknown>;
}

interface SimulationSessionRow {
  id: string;
  case_variant_id: string;
}

interface RubricRow {
  id: string;
  slug: string;
  version: string;
  title: string;
}

interface RubricDimensionRow {
  dimension_key: string;
  public_definition: string;
  display_order: number;
}

interface StepEventRow {
  case_step_id: string;
  payload_json: { response?: unknown };
  captured_at: string;
}

export async function buildJudgeContext(
  simulationSessionId: string,
): Promise<JudgeInputContext> {
  const admin = createAdminClient();

  // Session → case_variant_id
  const { data: session, error: sessErr } = await admin
    .schema("simulador")
    .from("simulation_sessions")
    .select("id, case_variant_id")
    .eq("id", simulationSessionId)
    .single<SimulationSessionRow>();
  if (sessErr || !session) {
    throw new Error(`session no encontrada: ${simulationSessionId}`);
  }

  // Variant → case_template_id + inputs
  const { data: variant, error: varErr } = await admin
    .schema("simulador")
    .from("case_variants")
    .select("id, slug, case_template_id, inputs_resolved_json")
    .eq("id", session.case_variant_id)
    .single<CaseVariantRow>();
  if (varErr || !variant) {
    throw new Error("case_variant no encontrado.");
  }

  // Template + rubric_id
  const { data: template, error: tmplErr } = await admin
    .schema("simulador")
    .from("case_templates")
    .select("id, slug, version, title, rubric_id")
    .eq("id", variant.case_template_id)
    .single<CaseTemplateRow>();
  if (tmplErr || !template) {
    throw new Error("case_template no encontrado.");
  }

  // Steps
  const { data: stepsRaw } = await admin
    .schema("simulador")
    .from("case_steps")
    .select("id, ordinal, step_key, step_type, prompt_template, evaluates_dimensions")
    .eq("case_template_id", template.id)
    .order("ordinal", { ascending: true });

  const steps: CaseStepRow[] = (stepsRaw ?? []).map((s) => ({
    ordinal: s.ordinal as number,
    step_key: s.step_key as string,
    step_type: s.step_type as string,
    prompt_template: (s.prompt_template ?? null) as string | null,
    evaluates_dimensions: (s.evaluates_dimensions ?? null) as string[] | null,
  }));

  // Rubric + dimensions
  const { data: rubric, error: rubErr } = await admin
    .schema("simulador")
    .from("rubrics")
    .select("id, slug, version, title")
    .eq("id", template.rubric_id)
    .single<RubricRow>();
  if (rubErr || !rubric) {
    throw new Error("rubric no encontrada.");
  }

  const { data: dimsRaw } = await admin
    .schema("simulador")
    .from("rubric_dimensions")
    .select("dimension_key, public_definition, display_order")
    .eq("rubric_id", rubric.id)
    .order("display_order", { ascending: true });

  const dimensions: RubricDimensionRow[] = (dimsRaw ?? []).map((d) => ({
    dimension_key: d.dimension_key as string,
    public_definition: d.public_definition as string,
    display_order: d.display_order as number,
  }));

  // Events → reduce a último payload por step_key.
  const { data: events } = await admin
    .schema("simulador")
    .from("simulation_step_events")
    .select("case_step_id, payload_json, captured_at")
    .eq("simulation_session_id", simulationSessionId)
    .eq("event_type", "response_update")
    .order("captured_at", { ascending: true });

  // Map case_step_id → step_key
  const stepKeyById: Record<string, string> = {};
  for (const s of stepsRaw ?? []) {
    stepKeyById[s.id as string] = s.step_key as string;
  }

  const responses: Record<string, unknown> = {};
  const exerciseEvidence: Record<
    string,
    import("../exercise-registry").EvidenceForJudge
  > = {};
  for (const ev of (events ?? []) as StepEventRow[]) {
    const key = stepKeyById[ev.case_step_id];
    if (!key) continue;
    const r = ev.payload_json?.response;
    if (r !== undefined) {
      responses[key] = r;
      // Frente A — si el payload tiene block_id, construir EvidenceForJudge
      // tipado para que el prompt-builder pueda emitir prompts deterministas.
      if (typeof r === "object" && r !== null && "block_id" in r) {
        const blockId = (r as { block_id: string }).block_id;
        // Cast es seguro: la API route ya validó shape con Zod antes de
        // persistir. Si llegó hasta aquí, el shape es válido.
        exerciseEvidence[key] = {
          block_id: blockId as import("../exercise-registry").EvidenceForJudge["block_id"],
          payload: r as import("../exercise-registry").ExerciseResponsePayload,
          metrics:
            (ev.payload_json?.metrics as Record<string, unknown> | undefined) ??
            {},
          submitted_at:
            (ev.created_at as string | undefined) ?? new Date().toISOString(),
        };
      }
    }
  }

  return {
    caseTitle: template.title,
    caseSlug: template.slug,
    caseVersion: template.version,
    variantSlug: variant.slug,
    variantInputs: variant.inputs_resolved_json ?? {},
    steps,
    responses,
    exerciseEvidence:
      Object.keys(exerciseEvidence).length > 0 ? exerciseEvidence : undefined,
    rubric: {
      slug: rubric.slug,
      version: rubric.version,
      title: rubric.title,
      dimensions,
    },
  };
}

export interface EvaluateResult extends JudgeRunResult {
  context: JudgeInputContext;
}

export async function scoreSubmission(
  ctx: JudgeInputContext,
): Promise<JudgeRunResult> {
  const run = await runJudge(ctx);
  const { final, applied } = applyOverrides(run.output);

  return {
    raw: run.output,
    final,
    overridesApplied: applied,
    meta: {
      model: run.model,
      promptVersion: run.promptVersion,
      rubricVersion: ctx.rubric.version,
      durationMs: run.durationMs,
    },
  };
}

export async function evaluate(
  simulationSessionId: string,
): Promise<EvaluateResult> {
  const ctx = await buildJudgeContext(simulationSessionId);
  const scored = await scoreSubmission(ctx);

  return {
    context: ctx,
    ...scored,
  };
}

export type { JudgeOutput, JudgeInputContext, JudgeRunResult } from "./types";
