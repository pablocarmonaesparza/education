/**
 * Construye el system + user prompt para el judge.
 *
 * El system prompt es estable entre sesiones y sólo bumpea cuando cambia
 * la definición de bandas/severidades/recomendaciones. El user prompt
 * inyecta el caso + rúbrica + transcript específicos.
 *
 * Versión: si modificas el system prompt o el shape del schema, sube
 * `JUDGE_PROMPT_VERSION` (se persiste en evaluation_runs.judge_prompt_version
 * para reproducibilidad).
 */

import type { JudgeInputContext } from "./types";

// v3 = prompt en inglés (pivot EEUU 2026-07-15). REGLA VIVA del RULES_LEDGER:
// cambio de prompt post-calibración obliga a re-correr la calibración contra el
// judge real ANTES de evaluar sesiones de clientes. El set dorado v3 está en
// español y quedó invalidado por este cambio — hay que re-autorarlo en inglés.
export const JUDGE_PROMPT_VERSION = "v3";

export function buildSystemPrompt(): string {
  return [
    "You evaluate operational judgment in AI use. You read a participant's decisions",
    "in a simulated case and produce a rigorous evaluation against a fixed rubric.",
    "",
    "Rules:",
    "1. You are conservative. Bands: A=High (clear judgment), M=Medium (partial or",
    "   inconsistent), B=Low (material gap).",
    "2. You only emit a risk_event when you have concrete textual evidence in the",
    "   transcript. Do not invent events to inflate the case.",
    "3. Your rationales cite the step_ordinal and, where it applies, the",
    "   participant's literal text (in quotes).",
    "4. Write every free-text field in US business English: rationale,",
    "   evidence_text, observed, why_matters, strengths, reason, next_week_actions.",
    "   Short sentences. Plain and direct. Write in English even when the case,",
    "   the rubric, or the participant's transcript is in another language.",
    "5. You do not reveal the rubric to the participant — you are an internal tool",
    "   for the manager.",
    "",
    "risk_events severity:",
    "  • high: real exposure of PII/sensitive data, or an action that needs",
    "    immediate remediation.",
    "  • medium: a process or communication gap the team must close before",
    "    expanding AI use.",
    "  • low: a signal worth improving that does not block the operation.",
    "",
    "risk_events jurisdiction: the jurisdiction of the data subject when the event",
    "touches PII, otherwise null. Use US for a US data subject (CCPA/CPRA), MX, CO",
    "or BR for those countries, and other only when the case gives you no basis to",
    "tell. Do not default to other for a US case.",
    "",
    "Recommendation.action (for the manager). These are fixed system values: emit",
    "them exactly as written on the left, in lowercase Spanish. The English gloss",
    "is for your understanding only — never emit the English word.",
    "  • pilotar (Pilot): works on their own with weekly check-ins in their usual",
    "    scope.",
    "  • entrenar (Coach): partial judgment; targeted practice before autonomy,",
    "    4-6 weeks of close supervision.",
    "  • pausar (Pause): should not use AI on sensitive flows until the gap is",
    "    remediated.",
    "  • escalar (Escalate): the problem is not individual; it needs process, legal",
    "    or IT work before re-assessing the person.",
    "",
    "You return your evaluation EXCLUSIVELY by calling the `submit_evaluation` tool",
    "with every required field. Send no additional text.",
  ].join("\n");
}

export function buildUserPrompt(ctx: JudgeInputContext): string {
  const dims = ctx.rubric.dimensions
    .sort((a, b) => a.display_order - b.display_order)
    .map(
      (d, i) =>
        `${i + 1}. ${d.dimension_key} — ${d.public_definition.trim()}`,
    )
    .join("\n");

  const steps = ctx.steps
    .sort((a, b) => a.ordinal - b.ordinal)
    .map((s) => {
      const evals = s.evaluates_dimensions?.length
        ? ` (evaluates: ${s.evaluates_dimensions.join(", ")})`
        : "";
      const prompt = s.prompt_template ? `\n   prompt: ${s.prompt_template.trim()}` : "";
      return `Step ${s.ordinal} — ${s.step_key} [${s.step_type}]${evals}${prompt}`;
    })
    .join("\n");

  const transcript = ctx.steps
    .sort((a, b) => a.ordinal - b.ordinal)
    .map((s) => {
      // Frente A: si el step trae evidencia validada por bloque (payload tipado
      // por Zod + metrics), esa es la fuente PRIMARIA. Las respuestas crudas de
      // `responses` quedan solo como fallback para steps legacy sin block_id.
      const ev = ctx.exerciseEvidence?.[s.step_key];
      if (ev) {
        const metrics =
          ev.metrics && Object.keys(ev.metrics).length
            ? `\nmetrics: ${JSON.stringify(ev.metrics)}`
            : "";
        return (
          `─── Step ${s.ordinal} (${s.step_key}) · block ${ev.block_id} · validated evidence ───\n` +
          `${JSON.stringify(ev.payload, null, 2)}${metrics}`
        );
      }
      const resp = ctx.responses[s.step_key];
      const respJson = resp === undefined ? "(no response)" : JSON.stringify(resp, null, 2);
      return `─── Step ${s.ordinal} (${s.step_key}) · legacy ───\n${respJson}`;
    })
    .join("\n\n");

  const variantBrief = JSON.stringify(ctx.variantInputs, null, 2);

  return [
    `# Case`,
    `${ctx.caseTitle} (slug: ${ctx.caseSlug}, version: ${ctx.caseVersion})`,
    `Variant: ${ctx.variantSlug}`,
    ``,
    `# Case inputs (brief, dataset sample, expected AI output)`,
    "```json",
    variantBrief,
    "```",
    ``,
    `# Rubric (${ctx.rubric.slug} ${ctx.rubric.version})`,
    dims,
    ``,
    `# Case steps`,
    steps,
    ``,
    `# Participant transcript (block-validated evidence where it exists; raw on legacy steps)`,
    transcript,
    ``,
    `# Instruction`,
    `Evaluate the 6 rubric dimensions (band A/M/B with rationale + confidence).`,
    `Prefer block-validated evidence over raw responses.`,
    `Identify risk_events from the transcript (only with textual evidence).`,
    `List gaps (actionable operational issues) + strengths (what they did well).`,
    `Emit a final recommendation with action + applies_to + 2-3 concrete next_week_actions.`,
    `Write every free-text field in US business English.`,
    `Call the submit_evaluation tool with the complete output.`,
  ].join("\n");
}

/**
 * JSON Schema del tool_use que el modelo debe invocar. El SDK de Anthropic
 * lo valida server-side, así que un output mal formado vuelve como error.
 */
export const JUDGE_TOOL_SCHEMA = {
  name: "submit_evaluation",
  description:
    "Submit the participant's final evaluation as strict JSON. All free-text fields in US business English.",
  input_schema: {
    type: "object",
    required: ["dimensions", "risk_events", "gaps", "strengths", "recommendation"],
    properties: {
      dimensions: {
        type: "array",
        minItems: 6,
        maxItems: 6,
        items: {
          type: "object",
          required: ["id", "band", "rationale", "confidence"],
          properties: {
            id: {
              type: "string",
              enum: ["contexto", "datos", "ejecucion_ia", "validacion", "juicio", "impacto"],
            },
            band: { type: "string", enum: ["A", "M", "B"] },
            rationale: { type: "string", minLength: 10 },
            confidence: { type: "number", minimum: 0, maximum: 1 },
          },
          additionalProperties: false,
        },
      },
      risk_events: {
        type: "array",
        items: {
          type: "object",
          required: [
            "type",
            "severity",
            "step_ordinal",
            "evidence_text",
            "jurisdiction",
            "transfer_basis_documented",
          ],
          properties: {
            type: {
              type: "string",
              enum: [
                "exposed_pii_to_model",
                "hidden_pii_usage_from_authority",
                "accepted_unverified_claim",
                "accepted_hallucinated_figures",
                "used_sensitive_commercial_data",
                "shared_third_party_confidential",
                "used_unapproved_vendor",
                "prompt_injection_unawareness",
                "over_relied_on_output",
                "overblocked_without_discrimination",
                "ignored_escalation_path",
              ],
            },
            severity: { type: "string", enum: ["low", "medium", "high"] },
            step_ordinal: { type: "integer", minimum: 1 },
            evidence_text: { type: "string" },
            jurisdiction: {
              type: ["string", "null"],
              enum: ["MX", "CO", "BR", "US", "other", null],
            },
            transfer_basis_documented: { type: ["boolean", "null"] },
          },
          additionalProperties: false,
        },
      },
      gaps: {
        type: "array",
        items: {
          type: "object",
          required: ["id", "severity", "observed", "why_matters"],
          properties: {
            id: { type: "string" },
            severity: { type: "string", enum: ["low", "medium", "high"] },
            observed: { type: "string" },
            why_matters: { type: "string" },
          },
          additionalProperties: false,
        },
      },
      strengths: {
        type: "array",
        items: { type: "string" },
      },
      recommendation: {
        type: "object",
        required: ["action", "applies_to", "next_week_actions", "reason"],
        properties: {
          action: {
            type: "string",
            enum: ["pilotar", "entrenar", "pausar", "escalar"],
          },
          applies_to: { type: "string" },
          next_week_actions: {
            type: "array",
            minItems: 1,
            items: { type: "string" },
          },
          reason: { type: "string" },
        },
        additionalProperties: false,
      },
    },
    additionalProperties: false,
  },
} as const;
