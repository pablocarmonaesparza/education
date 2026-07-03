/**
 * Mock output del judge para development sin ANTHROPIC_API_KEY.
 *
 * Devuelve un payload con shape válido (6 dimensions, 1-2 risk events,
 * gaps + strengths + recommendation) basado heurísticamente en lo que
 * el participante escribió. No es un evaluador real — sirve solo para
 * que el flow E2E (submit → report) funcione localmente sin gastar
 * tokens de Anthropic ni configurar la key.
 *
 * En producción (NODE_ENV='production') runJudge sigue exigiendo la
 * key real y lanza error si falta.
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
  const piiFields = ["name", "email", "company"];
  const keptPii = piiFields.some(
    (f) => dataScope?.[f] === "Usar tal cual",
  );

  const promptOk = (llmBeat?.user_prompt?.length ?? 0) > 80;
  const followupOk = (llmBeat?.followup?.length ?? 0) > 40;

  const dimensions: JudgeOutput["dimensions"] = [
    {
      id: "contexto",
      band: promptOk ? "A" : "M",
      rationale: promptOk
        ? "El prompt enviado al modelo incluyó audiencia, tono y restricciones."
        : "El prompt fue corto y sin contexto explícito.",
      confidence: 0.75,
    },
    {
      id: "datos",
      band: keptPii ? "B" : "A",
      rationale: keptPii
        ? "Mantuvo campos name/email/company sin transformación al pasarlos al modelo."
        : "Anonimizó o descartó los campos sensibles antes de la llamada.",
      confidence: 0.85,
    },
    {
      id: "ejecucion_ia",
      band: promptOk && followupOk ? "A" : promptOk ? "M" : "B",
      rationale:
        promptOk && followupOk
          ? "Formuló el prompt con contexto e iteró con un follow-up útil."
          : promptOk
            ? "Formuló un prompt razonable pero no iteró ni acotó el output."
            : "Ejecución con IA débil: prompt corto y sin iteración.",
      confidence: 0.7,
    },
    {
      id: "validacion",
      band: followupOk ? "M" : "B",
      rationale: followupOk
        ? "Mencionó qué validar pero no especificó cómo."
        : "Aceptó el output del modelo sin validación explícita.",
      confidence: 0.7,
    },
    {
      id: "juicio",
      band:
        decisionSelect === "option_c" ||
        /revisi[oó]n|control|legal/i.test(decisionLabel ?? "")
          ? "A"
          : "M",
      rationale:
        decisionSelect === "option_c" ||
        /revisi[oó]n|control|legal/i.test(decisionLabel ?? "")
          ? "Identificó la necesidad de escalar a Legal antes de lanzar."
          : "Decidió sin escalamiento explícito.",
      confidence: 0.65,
    },
    {
      id: "impacto",
      band:
        decisionSelect === "option_b" ||
        decisionSelect === "option_c" ||
        /supuestos|pendientes|revisi[oó]n|control/i.test(decisionLabel ?? "")
          ? "A"
          : "M",
      rationale:
        "La decisión final se tradujo en una acción para la stakeholder, aunque podría cerrar con métrica y owner explícitos.",
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
        "El participante decidió pasar campos identificadores (name/email/company) al modelo sin transformación.",
      jurisdiction: "MX",
      transfer_basis_documented: false,
    });
  }
  if (decisionSelect === "option_d") {
    risk_events.push({
      type: "over_relied_on_output",
      severity: "medium",
      step_ordinal: 4,
      evidence_text:
        "Entregó el output crudo del modelo sin validación previa.",
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
        "Al preparar los datos, mantuvo identificadores personales sin transformación antes de pasarlos al modelo corporativo.",
      why_matters:
        "Exposición de PII sin consentimiento → riesgo regulatorio (LFPDPPP MX, Ley 1581 CO).",
    });
  }
  if (!followupOk) {
    gaps.push({
      id: "weak_validation",
      severity: "medium",
      observed:
        "El follow-up del paso 2 fue corto y no mencionó qué validaría del output.",
      why_matters:
        "Publicar output de IA sin validación cruzada daña credibilidad si hay cifras inventadas.",
    });
  }

  const strengths: string[] = [];
  if (promptOk) {
    strengths.push(
      "Encuadró el prompt con audiencia y restricciones de longitud.",
    );
  }
  if (decisionSelect === "option_b") {
    strengths.push(
      "Optó por entregar contexto del proceso a la stakeholder, no sólo el output.",
    );
  }
  if (strengths.length === 0) {
    strengths.push(
      "Completó el flujo en tiempo, demostrando familiaridad con la herramienta.",
    );
  }

  const recommendation: JudgeOutput["recommendation"] = keptPii
    ? {
        action: "pausar",
        applies_to:
          "Al participante; revisar si el equipo comparte flujos similares con datos de clientes.",
        next_week_actions: [
          "Revisar política PII para LLM corporativo + checklist de minimización de datos.",
          "Coordinar con IT/Legal clarificación antes de usar IA en flujos con datos sensibles.",
          "Re-simular el caso con la rúbrica visible para identificar el gap específico.",
        ],
        reason:
          "Gap material en datos: PII pasado al modelo sin transformación. Requiere remediación antes de operar autónomo en flujos sensibles.",
      }
    : {
        action: "entrenar",
        applies_to:
          "Al participante; tiene criterio parcial, requiere micro-práctica enfocada.",
        next_week_actions: [
          "Practicar validación de outputs LLM con 2 casos similares.",
          "Documentar 1 ejemplo reciente para revisión cruzada con el manager.",
          "Repetir el diagnóstico en 4 semanas para medir progreso.",
        ],
        reason:
          "Criterio sólido en contexto y manejo de datos. Gap principal en validación de outputs y escalamiento responsable.",
      };

  return {
    dimensions,
    risk_events,
    gaps,
    strengths,
    recommendation,
  };
}
