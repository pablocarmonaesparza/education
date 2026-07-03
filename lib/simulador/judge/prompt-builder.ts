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

export const JUDGE_PROMPT_VERSION = "v2";

export function buildSystemPrompt(): string {
  return [
    "Eres un evaluador de criterio operativo en uso de IA. Lees decisiones de un",
    "participante en un caso simulado y produces una evaluación rigurosa contra",
    "una rúbrica fija.",
    "",
    "Reglas:",
    "1. Eres conservador. Bandas: A=Alto (criterio claro), M=Medio (parcial o",
    "   inconsistente), B=Bajo (gap material).",
    "2. Sólo emites un risk_event si tienes evidencia textual concreta del",
    "   transcript. No inventes eventos para 'subir' el caso.",
    "3. Tus rationales citan el step_ordinal y, donde aplique, texto literal del",
    "   participante (entrecomillado).",
    "4. Idioma español neutro (LATAM corporate). Frases cortas.",
    "5. No revelas la rúbrica al participante — eres herramienta interna del manager.",
    "",
    "Severidad de risk_events:",
    "  • high: exposición real de PII/dato sensible o acción que requiere",
    "    remediación inmediata.",
    "  • medium: gap de proceso o comunicación que el equipo debe corregir antes",
    "    de escalar uso.",
    "  • low: señal de mejora pero no bloquea operación.",
    "",
    "Recommendation.action (para el manager):",
    "  • pilotar: opera autónomo con supervisión semanal en su scope típico.",
    "  • entrenar: criterio parcial; micro-práctica antes de autonomía,",
    "    supervisión 4-6 semanas.",
    "  • pausar: no debe usar IA en flujos sensibles hasta remediar gap.",
    "  • escalar: el problema no es individual; requiere proceso/legal/IT antes",
    "    de re-evaluar persona.",
    "",
    "Devuelves tu evaluación EXCLUSIVAMENTE invocando la tool `submit_evaluation`",
    "con todos los campos requeridos. No mandes texto adicional.",
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
        ? ` (evalúa: ${s.evaluates_dimensions.join(", ")})`
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
          `─── Step ${s.ordinal} (${s.step_key}) · bloque ${ev.block_id} · evidencia validada ───\n` +
          `${JSON.stringify(ev.payload, null, 2)}${metrics}`
        );
      }
      const resp = ctx.responses[s.step_key];
      const respJson = resp === undefined ? "(sin respuesta)" : JSON.stringify(resp, null, 2);
      return `─── Step ${s.ordinal} (${s.step_key}) · legacy ───\n${respJson}`;
    })
    .join("\n\n");

  const variantBrief = JSON.stringify(ctx.variantInputs, null, 2);

  return [
    `# Caso`,
    `${ctx.caseTitle} (slug: ${ctx.caseSlug}, version: ${ctx.caseVersion})`,
    `Variante: ${ctx.variantSlug}`,
    ``,
    `# Inputs del caso (brief, dataset sample, output de IA esperado)`,
    "```json",
    variantBrief,
    "```",
    ``,
    `# Rúbrica (${ctx.rubric.slug} ${ctx.rubric.version})`,
    dims,
    ``,
    `# Steps del caso`,
    steps,
    ``,
    `# Transcript del participante (evidencia validada por bloque cuando existe; cruda en steps legacy)`,
    transcript,
    ``,
    `# Instrucción`,
    `Evalúa las 6 dimensiones de la rúbrica (banda A/M/B con rationale + confidence).`,
    `Prioriza la evidencia validada por bloque sobre las respuestas crudas.`,
    `Identifica risk_events del transcript (sólo con evidencia textual).`,
    `Lista gaps (issues operativos accionables) + strengths (lo que hizo bien).`,
    `Emite recommendation final con action + applies_to + 2-3 next_week_actions concretos.`,
    `Invoca la tool submit_evaluation con el output completo.`,
  ].join("\n");
}

/**
 * JSON Schema del tool_use que el modelo debe invocar. El SDK de Anthropic
 * lo valida server-side, así que un output mal formado vuelve como error.
 */
export const JUDGE_TOOL_SCHEMA = {
  name: "submit_evaluation",
  description: "Emite la evaluación final del participante en JSON estricto.",
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
              enum: ["MX", "CO", "BR", "other", null],
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
