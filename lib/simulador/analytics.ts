export const SIMULADOR_ANALYTICS_EVENTS = [
  "public_landing_viewed",
  "public_cta_clicked",
  "signup_started",
  "signup_completed",
  "login_completed",
  "consent_accepted",
  "onboarding_step_viewed",
  "onboarding_step_completed",
  "invitation_sent",
  "invitation_accepted",
  "case_started",
  "section_started",
  "section_completed",
  "response_saved",
  "llm_prompt_submitted",
  "llm_response_received",
  "case_submitted",
  "judge_started",
  "judge_completed",
  "judge_failed",
  "report_viewed",
  "report_exported",
  "report_share_link_generated",
  "report_share_link_viewed",
  "practice_unlocked",
  "practice_started",
  "practice_completed",
  "resim_assigned",
  "resim_completed",
  "transfer_delta_computed",
  "manager_alert_triggered",
  "manager_alert_sent",
  "field_test_started",
  "field_test_abandoned",
  "field_test_submitted",
  "reaction_survey_submitted",
  "lead_captured",
  "billing_checkout_started",
  "billing_checkout_completed",
  "admin_review_assigned",
  "admin_review_signature_added",
  "admin_review_report_published",
  "admin_review_completed",
  // Frente C — eventos por bloque canónico (exercise_block_id del YAML).
  // Disparados por cada renderer extraído a app/exercise-lab/blocks/*
  // cuando el usuario interactúa. Payload de cada evento:
  //   { block_id: ExerciseBlockId, slide_id: string, session_id: string,
  //     time_ms?: number, payload_bytes?: number, validation_error?: string }
  "exercise_block_started",
  "exercise_block_completed",
  "exercise_block_validation_failed",
  "exercise_block_abandoned",
] as const;

export type SimuladorAnalyticsEvent =
  (typeof SIMULADOR_ANALYTICS_EVENTS)[number];

const EVENT_SET = new Set<string>(SIMULADOR_ANALYTICS_EVENTS);

export function isSimuladorAnalyticsEvent(
  eventName: string,
): eventName is SimuladorAnalyticsEvent {
  return EVENT_SET.has(eventName);
}

export function assertSimuladorAnalyticsEvent(
  eventName: string,
): asserts eventName is SimuladorAnalyticsEvent {
  if (isSimuladorAnalyticsEvent(eventName)) return;

  const message = `[simulador analytics] event "${eventName}" is not declared in simulador.analytics_events_catalog`;

  if (process.env.NODE_ENV !== "production") {
    throw new Error(message);
  }

  console.warn(message);
}

export function defineSimuladorAnalyticsEvent<TPayload extends object>(
  eventName: string,
  payload: TPayload,
): { event_name: SimuladorAnalyticsEvent; payload: TPayload } {
  assertSimuladorAnalyticsEvent(eventName);
  return { event_name: eventName, payload };
}
