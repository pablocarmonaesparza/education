-- Migration 20260519033000 — Field-test L1 reaction survey
--
-- Adds the lightweight post-submit survey required by the Kirkpatrick L1
-- decision: one NPS score, one relevance score and one open response after
-- the participant sees the preliminary report.

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
      'lead_captured',
      'reaction_survey_submitted'
    )
  ) not valid;

alter table simulador.field_test_step_events
  validate constraint field_test_step_events_event_type_check;

insert into simulador.analytics_events_catalog
  (event_name, surface, payload_schema, description, owner)
values
  ('reaction_survey_submitted', 'field_test',
    '{"required":["field_test_session_id","nps","relevance_score"],"properties":{"field_test_session_id":{"type":"string"},"nps":{"type":"number"},"relevance_score":{"type":"number"},"open_response":{"type":"string"},"source":{"type":"string"}}}'::jsonb,
    'Kirkpatrick L1 reaction survey submitted after field-test report.',
    'codex')
on conflict (event_name) do update
  set surface = excluded.surface,
      payload_schema = excluded.payload_schema,
      description = excluded.description,
      owner = excluded.owner,
      deprecated_at = null;

create unique index if not exists idx_field_test_reaction_survey_once
  on simulador.field_test_step_events(field_test_session_id)
  where event_type = 'reaction_survey_submitted';

notify pgrst, 'reload schema';

commit;
