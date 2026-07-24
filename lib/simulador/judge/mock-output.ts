/**
 * Mock output del judge para development sin ANTHROPIC_API_KEY.
 *
 * Devuelve un payload con shape válido (6 dimensions, 1-2 risk events,
 * gaps + strengths + recommendation) basado heurísticamente en lo que
 * el participante escribió. No es un evaluador real — sirve solo para
 * que el flow E2E (submit → report) funcione localmente sin gastar
 * tokens de Anthropic ni configurar la key.
 *
 * En producción runJudge NO usa este mock: sin ANTHROPIC_API_KEY cae al
 * proveedor OpenAI-compatible (DeepSeek/Gemini) — ver run.ts:56-63. El mock
 * solo aplica en dev local sin keys.
 */

import type { JudgeInputContext, JudgeOutput } from "./types";

export function mockJudgeOutput(ctx: JudgeInputContext): JudgeOutput {
  const responses = ctx.responses as Record<string, Record<string, unknown>>;
  const dataScope = responses.data_scope?.field_actions as
    | Record<string, string>
    | undefined;
  const llmBeat = responses.llm_beat as
    | { user_prompt?: string; followup?: string }
    | undefined;
  const decisionSelect = responses.decision_select?.option as
    | string
    | undefined;
  const decisionLabel = responses.decision_select?.option_label as
    | string
    | undefined;

  // Heurística simple: si dejó PII sin transformar → datos B + risk high.
  //
  // OJO (2026-07-15, gate del pivot a inglés): esta heurística estaba ROTA y el
  // comentario anterior AFIRMABA que estaba arreglada. Los tres términos del set
  // eran incorrectos y `piiFields` no coincidía con ningún campo real, así que el
  // caso dorado `exposes_crm_pii_to_model` salía datos=A / recommendation=entrenar
  // / 0 risk events — un reporte VERDE para quien filtró PII, con un rationale que
  // afirmaba lo contrario de lo que hizo el participante.
  //
  // Valores canónicos verificados contra las fuentes (no inferidos):
  //   tests/simulador/judge/calibration_set.yaml → keep | drop | hash | bucketize | summarize
  //   casos/sales_agent_followup_pipeline_v1.yaml:101 → pii_fields: [contact_name, email, phone]
  //   ...:102 → confidential_fields incluye internal_notes
  //   practice_validacion_cifras_evidencia_v1.yaml:64 → { value: permitir, label: "Use as-is" }
  //
  // Matcheamos por VALUE (que es estable ante traducción). Los labels se aceptan
  // solo como red de seguridad para fixtures viejos — el fix de fondo es que el
  // bloque persista el value, no el label.
  const piiFields = ["contact_name", "email", "phone", "internal_notes"];
  const KEEP_AS_IS = new Set(["keep", "permitir", "Usar tal cual", "Use as-is"]);
  const keptPii = piiFields.some((f) => {
    const action = dataScope?.[f];
    return action !== undefined && KEEP_AS_IS.has(action);
  });

  const promptOk = (llmBeat?.user_prompt?.length ?? 0) > 80;
  const followupOk = (llmBeat?.followup?.length ?? 0) > 40;

  // Mismo caveat que arriba: `option_label` es copy del caso. Los regex aceptan
  // ES (casos legacy) + EN (casos ya relocalizados a EEUU).
  const escalatedToLegal =
    decisionSelect === "option_c" ||
    /revisi[oó]n|control|legal|review|sign-?off/i.test(decisionLabel ?? "");

  const dimensions: JudgeOutput["dimensions"] = [
    {
      id: "contexto",
      band: promptOk ? "A" : "M",
      rationale: promptOk
        ? "The prompt sent to the model included audience, tone, and constraints."
        : "The prompt was short and carried no explicit context.",
      confidence: 0.75,
    },
    {
      id: "datos",
      band: keptPii ? "B" : "A",
      rationale: keptPii
        ? "Passed contact name, email, phone or internal notes to the model without transforming them."
        : "Anonymized or dropped the sensitive fields before the call.",
      confidence: 0.85,
    },
    {
      id: "ejecucion_ia",
      band: promptOk && followupOk ? "A" : promptOk ? "M" : "B",
      rationale:
        promptOk && followupOk
          ? "Framed the prompt with context and iterated with a useful follow-up."
          : promptOk
            ? "Wrote a reasonable prompt but did not iterate or narrow the output."
            : "Weak AI execution: short prompt, no iteration.",
      confidence: 0.7,
    },
    {
      id: "validacion",
      band: followupOk ? "M" : "B",
      rationale: followupOk
        ? "Named what to verify but did not say how."
        : "Accepted the model's output with no explicit verification.",
      confidence: 0.7,
    },
    {
      id: "juicio",
      band: escalatedToLegal ? "A" : "M",
      rationale: escalatedToLegal
        ? "Spotted the need to escalate to Legal before launch."
        : "Decided without escalating.",
      confidence: 0.65,
    },
    {
      id: "impacto",
      band:
        decisionSelect === "option_b" ||
        decisionSelect === "option_c" ||
        /supuestos|pendientes|revisi[oó]n|control|assumptions|open items|review/i.test(
          decisionLabel ?? "",
        )
          ? "A"
          : "M",
      rationale:
        "The final decision turned into an action for the stakeholder, though it could close with an explicit metric and owner.",
      confidence: 0.7,
    },
  ];

  const risk_events: JudgeOutput["risk_events"] = [];
  if (keptPii) {
    risk_events.push({
      type: "exposed_pii_to_model",
      severity: "high",
      step_ordinal: 1,
      evidence_text:
        "The participant chose to pass identifying fields (contact name, email, phone) to the model without transforming them.",
      // 'US' habilitado por la migración 20260716120000 (CHECK ampliado a
      // MX/CO/BR/US/other). Antes del pivot esto decía 'MX'.
      jurisdiction: "US",
      transfer_basis_documented: false,
    });
  }
  if (decisionSelect === "option_d") {
    risk_events.push({
      type: "over_relied_on_output",
      severity: "medium",
      step_ordinal: 4,
      evidence_text:
        "Shipped the model's raw output with no verification first.",
      jurisdiction: null,
      transfer_basis_documented: null,
    });
  }

  const gaps: JudgeOutput["gaps"] = [];
  if (keptPii) {
    gaps.push({
      id: "expose_pii",
      severity: "high",
      observed:
        "While preparing the data, kept personal identifiers untransformed before passing them to the corporate model.",
      why_matters:
        "Exposing PII without consent is a regulatory risk (CCPA/CPRA in California).",
    });
  }
  if (!followupOk) {
    gaps.push({
      id: "weak_validation",
      severity: "medium",
      observed:
        "The step 2 follow-up was short and never named what they would verify in the output.",
      why_matters:
        "Publishing AI output without cross-checking it costs credibility when the figures are invented.",
    });
  }

  const strengths: string[] = [];
  if (promptOk) {
    strengths.push("Framed the prompt with an audience and length constraints.");
  }
  if (decisionSelect === "option_b") {
    strengths.push(
      "Chose to give the stakeholder context on the process, not just the output.",
    );
  }
  if (strengths.length === 0) {
    strengths.push(
      "Finished the flow on time, showing familiarity with the tool.",
    );
  }

  const recommendation: JudgeOutput["recommendation"] = keptPii
    ? {
        action: "pausar",
        applies_to:
          "The participant; check whether the team shares similar flows with customer data.",
        next_week_actions: [
          "Review the PII policy for the corporate LLM plus the data minimization checklist.",
          "Get clarification from IT/Legal before using AI on flows with sensitive data.",
          "Re-run the case with the rubric visible to pinpoint the specific gap.",
        ],
        reason:
          "Material gap in data handling: PII passed to the model untransformed. Needs remediation before working solo on sensitive flows.",
      }
    : {
        action: "entrenar",
        applies_to:
          "The participant; judgment is partial and needs focused practice.",
        next_week_actions: [
          "Practice verifying LLM outputs with 2 similar cases.",
          "Document 1 recent example for a cross-review with the manager.",
          "Retake the assessment in 4 weeks to measure progress.",
        ],
        reason:
          "Solid judgment on context and data handling. The main gap is verifying outputs and escalating responsibly.",
      };

  return {
    dimensions,
    risk_events,
    gaps,
    strengths,
    recommendation,
  };
}
