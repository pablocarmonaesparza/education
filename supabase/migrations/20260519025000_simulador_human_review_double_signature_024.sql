-- Migration 024 — Human review SLA + double signature for high-risk reports
--
-- Makes human-in-the-loop review a premium control, not a cosmetic queue:
--   1. High-risk queue items require two distinct staff signatures.
--   2. High-risk SLA is 24h from queue creation.
--   3. Each reviewer decision is stored append-only.
--   4. Reports remain pending_review until required signatures are complete.

begin;

do $$
begin
  if to_regclass('simulador.human_review_queue') is null then
    raise exception 'migration 024 requires simulador.human_review_queue';
  end if;
  if to_regclass('simulador.reports') is null then
    raise exception 'migration 024 requires simulador.reports';
  end if;
end;
$$;

alter table simulador.human_review_queue
  add column if not exists required_review_count int not null default 1
    check (required_review_count between 1 and 3),
  add column if not exists completed_review_count int not null default 0
    check (completed_review_count >= 0),
  add column if not exists review_policy text not null default 'single'
    check (review_policy in ('single', 'double_high_risk')),
  add column if not exists last_reviewed_at timestamptz,
  add column if not exists published_at timestamptz,
  add column if not exists decision_summary_json jsonb not null default '[]'::jsonb;

create table if not exists simulador.human_review_decisions (
  id uuid primary key default gen_random_uuid(),
  queue_id uuid not null references simulador.human_review_queue(id) on delete cascade,
  reviewer_user_id uuid not null references simulador.users(id) on delete restrict,
  decision text not null default 'approve' check (decision in ('approve', 'override', 'escalate')),
  reviewer_notes text,
  override_dimension_scores_json jsonb,
  override_recommendation text check (override_recommendation in ('pilotar', 'entrenar', 'pausar', 'escalar')),
  report_payload_patch_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (queue_id, reviewer_user_id)
);

create index if not exists idx_human_review_decisions_queue
  on simulador.human_review_decisions(queue_id, created_at);
create index if not exists idx_human_review_queue_signature_status
  on simulador.human_review_queue(status, required_review_count, completed_review_count, due_at);

alter table simulador.human_review_decisions enable row level security;

comment on table simulador.human_review_decisions is
  'Append-only staff signatures for premium human review. High-risk reports require two distinct reviewer_user_id rows before publication.';
comment on column simulador.human_review_queue.required_review_count is
  'Number of distinct staff signatures required before report publication.';
comment on column simulador.human_review_queue.review_policy is
  'single for normal audits; double_high_risk for reports held due to high severity risk_events.';

-- Backfill existing open high-risk items into the premium policy.
update simulador.human_review_queue
   set required_review_count = case when triggered_by = 'high_risk_event' then 2 else required_review_count end,
       review_policy = case when triggered_by = 'high_risk_event' then 'double_high_risk' else review_policy end,
       due_at = case
         when triggered_by = 'high_risk_event' then
           least(coalesce(due_at, created_at + interval '24 hours'), created_at + interval '24 hours')
         else due_at
       end
 where status in ('queued', 'in_review');

-- Keep completed_review_count aligned with already-recorded decisions.
update simulador.human_review_queue q
   set completed_review_count = coalesce(d.review_count, 0),
       last_reviewed_at = d.last_reviewed_at
  from (
    select queue_id, count(*)::int as review_count, max(created_at) as last_reviewed_at
      from simulador.human_review_decisions
     group by queue_id
  ) d
 where q.id = d.queue_id
   and q.status in ('queued', 'in_review');

do $$
begin
  if to_regclass('simulador.analytics_events_catalog') is not null then
    insert into simulador.analytics_events_catalog
      (event_name, surface, payload_schema, description, owner)
    values
      ('admin_review_signature_added', 'admin', '{"required":["queue_id","reviewer_user_id","completed_review_count","required_review_count"],"properties":{"queue_id":{"type":"string"},"reviewer_user_id":{"type":"string"},"completed_review_count":{"type":"number"},"required_review_count":{"type":"number"},"decision":{"type":"string"}}}'::jsonb, 'Staff reviewer signature added to a human review queue item.', 'codex'),
      ('admin_review_report_published', 'admin', '{"required":["queue_id","report_id"],"properties":{"queue_id":{"type":"string"},"report_id":{"type":"string"},"completed_review_count":{"type":"number"}}}'::jsonb, 'Human-reviewed report published after required signatures.', 'codex')
    on conflict (event_name) do update
      set surface = excluded.surface,
          payload_schema = excluded.payload_schema,
          description = excluded.description,
          owner = excluded.owner,
          deprecated_at = null;
  end if;
end;
$$;

grant all on simulador.human_review_decisions to service_role;
grant select, insert on simulador.human_review_decisions to authenticated;

notify pgrst, 'reload schema';

commit;
