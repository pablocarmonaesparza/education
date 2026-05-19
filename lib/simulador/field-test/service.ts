import { createAdminClient } from "@/lib/supabase/admin";
import { chat } from "@/lib/llm/client";
import { scoreSubmission } from "@/lib/simulador/judge";
import type {
  JudgeInputContext,
  JudgeRunResult,
} from "@/lib/simulador/judge/types";
import {
  assertFieldTestLlmConfigured,
  hashToken,
} from "./security";

export const FIELD_TEST_CASE_SLUG = "marketing_urgent_campaign_pii";

export const FIELD_TEST_STEP_KEYS = [
  "data_scope",
  "llm_beat",
  "artifact_review",
  "decision_select",
  "decision_open_short",
] as const;

export type FieldTestStepKey = (typeof FIELD_TEST_STEP_KEYS)[number];

export const FIELD_TEST_ANALYTICS_EVENTS = [
  "field_test_started",
  "section_completed",
  "abandoned",
  "submitted",
  "report_viewed",
  "email_captured",
  "lead_captured",
] as const;

export type FieldTestAnalyticsEvent =
  (typeof FIELD_TEST_ANALYTICS_EVENTS)[number];

export function isFieldTestStepKey(value: string): value is FieldTestStepKey {
  return FIELD_TEST_STEP_KEYS.includes(value as FieldTestStepKey);
}

export function isFieldTestAnalyticsEvent(
  value: string,
): value is FieldTestAnalyticsEvent {
  return FIELD_TEST_ANALYTICS_EVENTS.includes(
    value as FieldTestAnalyticsEvent,
  );
}

export function sanitizeText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function getFieldTestSession(input: {
  sessionId: string;
  token: string;
}) {
  const admin = createAdminClient();
  const tokenHash = hashToken(input.token);
  const { data } = await admin
    .schema("simulador")
    .from("field_test_sessions")
    .select(
      "id, case_slug, case_template_id, case_variant_id, status, report_status, expires_at",
    )
    .eq("id", input.sessionId)
    .eq("public_token_hash", tokenHash)
    .maybeSingle();

  if (!data) return null;
  if (new Date(String(data.expires_at)).getTime() < Date.now()) return null;
  return data;
}

export async function insertFieldTestEvent(input: {
  sessionId: string;
  stepKey?: string | null;
  eventType: string;
  payload?: Record<string, unknown>;
  metrics?: Record<string, unknown>;
}) {
  const admin = createAdminClient();
  const { error: insertError } = await admin
    .schema("simulador")
    .from("field_test_step_events")
    .insert({
      field_test_session_id: input.sessionId,
      step_key: input.stepKey ?? null,
      event_type: input.eventType,
      payload_json: input.payload ?? {},
      metrics_json: input.metrics ?? {},
    });

  if (insertError) {
    console.warn("[field-test] analytics insert failed", {
      sessionId: input.sessionId,
      eventType: input.eventType,
      error: insertError,
    });
    return;
  }

  const { error: sessionError } = await admin
    .schema("simulador")
    .from("field_test_sessions")
    .update({ last_event_at: new Date().toISOString() })
    .eq("id", input.sessionId);

  if (sessionError) {
    console.warn("[field-test] last_event_at update failed", {
      sessionId: input.sessionId,
      eventType: input.eventType,
      error: sessionError,
    });
  }
}

export async function latestFieldTestResponses(sessionId: string) {
  const admin = createAdminClient();
  const { data: events } = await admin
    .schema("simulador")
    .from("field_test_step_events")
    .select("step_key, payload_json, captured_at")
    .eq("field_test_session_id", sessionId)
    .eq("event_type", "response_update")
    .order("captured_at", { ascending: true });

  const responses: Record<string, unknown> = {};
  for (const ev of events ?? []) {
    const stepKey = ev.step_key as string | null;
    if (!stepKey) continue;
    const payload = (ev.payload_json as { response?: unknown })?.response;
    if (payload !== undefined) responses[stepKey] = payload;
  }
  return responses;
}

export async function generateFieldTestModelResponse(input: {
  sessionId: string;
  userPrompt: string;
}): Promise<{ text: string; model: string; durationMs: number; mock: boolean }> {
  assertFieldTestLlmConfigured();

  const started = Date.now();
  if (!process.env.DEEPSEEK_API_KEY) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DEEPSEEK_API_KEY no configurada.");
    }
    return {
      text: FIELD_TEST_DEV_MODEL_RESPONSE,
      model: "mock_llm_dev",
      durationMs: Date.now() - started,
      mock: true,
    };
  }

  const completion = await chat({
    temperature: 0,
    max_tokens: 900,
    messages: [
      {
        role: "system",
        content:
          "Eres el modelo corporativo dentro de un caso simulado de marketing B2B. Devuelve una respuesta útil, breve y realista para campaña. No evalúes al usuario, no menciones rúbricas y no des consejos de privacidad; solo responde a su prompt como modelo de trabajo.",
      },
      {
        role: "user",
        content: [
          "Contexto: Loop es una SaaS B2B LATAM de atención al cliente con IA. Camila, VP of Growth, pidió 3 ángulos de LinkedIn Ads y 1 email para mañana 9 AM.",
          "Dataset sintético disponible: feedback de clientes con columnas name, email, company, complaint_or_praise, revenue_potential_usd, signed_at.",
          "Prompt del participante:",
          input.userPrompt,
        ].join("\n\n"),
      },
    ],
  });

  const text =
    "choices" in completion
      ? (completion.choices[0]?.message?.content ?? "").trim()
      : "";

  if (!text) throw new Error("El modelo no devolvió contenido.");

  return {
    text,
    model: "model" in completion ? completion.model : "deepseek-chat",
    durationMs: Date.now() - started,
    mock: false,
  };
}

export async function buildFieldTestJudgeContext(
  fieldTestSessionId: string,
): Promise<JudgeInputContext> {
  const admin = createAdminClient();

  const { data: session } = await admin
    .schema("simulador")
    .from("field_test_sessions")
    .select("id, case_variant_id")
    .eq("id", fieldTestSessionId)
    .single();
  if (!session) throw new Error("field_test_session no encontrada.");

  const { data: variant } = await admin
    .schema("simulador")
    .from("case_variants")
    .select("id, slug, case_template_id, inputs_resolved_json")
    .eq("id", session.case_variant_id)
    .single();
  if (!variant) throw new Error("case_variant no encontrado.");

  const { data: template } = await admin
    .schema("simulador")
    .from("case_templates")
    .select("id, slug, version, title, rubric_id")
    .eq("id", variant.case_template_id)
    .single();
  if (!template) throw new Error("case_template no encontrado.");

  const { data: stepsRaw } = await admin
    .schema("simulador")
    .from("case_steps")
    .select("id, ordinal, step_key, step_type, prompt_template, evaluates_dimensions")
    .eq("case_template_id", template.id)
    .order("ordinal", { ascending: true });

  const { data: rubric } = await admin
    .schema("simulador")
    .from("rubrics")
    .select("id, slug, version, title")
    .eq("id", template.rubric_id)
    .single();
  if (!rubric) throw new Error("rubric no encontrada.");

  const { data: dimsRaw } = await admin
    .schema("simulador")
    .from("rubric_dimensions")
    .select("dimension_key, public_definition, display_order")
    .eq("rubric_id", rubric.id)
    .order("display_order", { ascending: true });

  const responses = await latestFieldTestResponses(fieldTestSessionId);

  return {
    caseTitle: template.title as string,
    caseSlug: template.slug as string,
    caseVersion: template.version as number,
    variantSlug: variant.slug as string,
    variantInputs: (variant.inputs_resolved_json ?? {}) as Record<
      string,
      unknown
    >,
    steps: (stepsRaw ?? []).map((s) => ({
      ordinal: s.ordinal as number,
      step_key: s.step_key as string,
      step_type: s.step_type as string,
      prompt_template: (s.prompt_template ?? null) as string | null,
      evaluates_dimensions: (s.evaluates_dimensions ?? null) as
        | string[]
        | null,
    })),
    responses,
    rubric: {
      slug: rubric.slug as string,
      version: rubric.version as string,
      title: rubric.title as string,
      dimensions: (dimsRaw ?? []).map((d) => ({
        dimension_key: d.dimension_key as string,
        public_definition: d.public_definition as string,
        display_order: d.display_order as number,
      })),
    },
  };
}

export async function evaluateFieldTestSession(
  fieldTestSessionId: string,
): Promise<JudgeRunResult> {
  const admin = createAdminClient();
  assertFieldTestLlmConfigured();

  const ctx = await buildFieldTestJudgeContext(fieldTestSessionId);
  const result = await scoreSubmission(ctx);
  const hasHighRisk = result.final.risk_events.some(
    (event) => event.severity === "high",
  );

  const payload = {
    rubric_version: result.meta.rubricVersion,
    case_version: `${ctx.caseSlug}_v${ctx.caseVersion}`,
    variant: ctx.variantSlug,
    judge_model: result.meta.model,
    duration_ms: result.meta.durationMs,
    dimensions: result.final.dimensions,
    risk_events: result.final.risk_events,
    gaps: result.final.gaps,
    strengths: result.final.strengths,
    recommendation: result.final.recommendation,
    overrides_applied: result.overridesApplied,
    preliminary: true,
    participant_note:
      "Reporte preliminar del caso de muestra. En diagnóstico pagado, los riesgos altos se revisan con humano antes del reporte ejecutivo.",
    review_required: hasHighRisk,
  };

  const { data: existing } = await admin
    .schema("simulador")
    .from("field_test_reports")
    .select("id")
    .eq("field_test_session_id", fieldTestSessionId)
    .maybeSingle();

  if (existing) {
    await admin
      .schema("simulador")
      .from("field_test_reports")
      .update({
        status: "published",
        payload_json: payload,
        generated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await admin
      .schema("simulador")
      .from("field_test_reports")
      .insert({
        field_test_session_id: fieldTestSessionId,
        status: "published",
        payload_json: payload,
      });
  }

  await admin
    .schema("simulador")
    .from("field_test_sessions")
    .update({
      status: "published",
      report_status: "published",
    })
    .eq("id", fieldTestSessionId);

  return result;
}

const FIELD_TEST_DEV_MODEL_RESPONSE = `Basado en el feedback de clientes, propondría estos ángulos:

1. "El reporte que no se rompe justo cuando creces"
Para equipos que ya pasaron de operación manual a cartera activa, el dolor no es tener más datos: es poder confiar en ellos cuando sube la carga.

2. "Tu canal principal no debería vivir fuera de tu operación"
WhatsApp Business aparece como una necesidad operativa para varios clientes LATAM. El ángulo debe conectar integración con velocidad de atención.

3. "Onboarding difícil, adopción real"
Hay señales mixtas: fricción inicial alta, pero uso recurrente después de la curva. Conviene tratarlo como promesa de acompañamiento, no como claim absoluto.`;
