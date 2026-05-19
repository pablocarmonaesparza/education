-- Migration 20260519024000 — Align field-test analytics event vocabulary.
--
-- The public field-test lead endpoint emits `lead_captured`, matching the
-- analytics catalog introduced in migration 022. The original field-test table
-- still allowed only the older `email_captured` name, which could drop the
-- event while the commercial lead itself was saved. Keep `email_captured` for
-- historical compatibility, but allow `lead_captured` going forward.

begin;

alter table simulador.field_test_step_events
  drop constraint if exists field_test_step_events_event_type_check;

alter table simulador.field_test_step_events
  add constraint field_test_step_events_event_type_check
  check (
    event_type in (
      'field_test_started',
      'response_update',
      'llm_prompt_submitted',
      'llm_response_received',
      'section_completed',
      'abandoned',
      'submitted',
      'report_viewed',
      'email_captured',
      'lead_captured'
    )
  );

commit;
