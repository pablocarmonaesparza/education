-- Migration 027 — Executive report share links
--
-- Adds revocable, expiring report links without exposing raw report ids.
-- Public access happens only through server routes that hash the opaque token
-- and use service role after validating expiry/revocation.

begin;

create table if not exists simulador.report_share_links (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references simulador.reports(id) on delete cascade,
  token_hash text not null unique,
  created_by_user_id uuid references simulador.users(id) on delete set null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  last_accessed_at timestamptz,
  check (expires_at > created_at)
);

create index if not exists idx_report_share_links_report
  on simulador.report_share_links(report_id, created_at desc);
create index if not exists idx_report_share_links_active_expiry
  on simulador.report_share_links(expires_at)
  where revoked_at is null;

alter table simulador.report_share_links enable row level security;

comment on table simulador.report_share_links is
  'Opaque-token, expiring links for executive report sharing. Tokens are only stored as SHA-256 hashes.';
comment on column simulador.report_share_links.expires_at is
  'Default product TTL is 30 days from generation.';
comment on column simulador.report_share_links.revoked_at is
  'When set, the public share route must treat the token as invalid.';

grant all on simulador.report_share_links to service_role;

do $$
begin
  if to_regclass('simulador.analytics_events_catalog') is not null then
    insert into simulador.analytics_events_catalog
      (event_name, surface, payload_schema, description, owner)
    values
      ('report_share_link_generated', 'report', '{"required":["report_id","session_id","expires_at"],"properties":{"report_id":{"type":"string"},"session_id":{"type":"string"},"expires_at":{"type":"string"}}}'::jsonb, 'Share link generated for an executive report.', 'codex'),
      ('report_share_link_viewed', 'report', '{"required":["report_id","share_link_id"],"properties":{"report_id":{"type":"string"},"share_link_id":{"type":"string"}}}'::jsonb, 'Public share link viewed.', 'codex')
    on conflict (event_name) do update
      set surface = excluded.surface,
          payload_schema = excluded.payload_schema,
          description = excluded.description,
          owner = excluded.owner,
          deprecated_at = null;
  end if;
end;
$$;

notify pgrst, 'reload schema';

commit;
