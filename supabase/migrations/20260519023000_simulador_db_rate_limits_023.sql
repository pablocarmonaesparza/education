-- Migration 023 — Supabase-backed rate limit fallback
--
-- Removes the hard dependency on an extra Redis/Upstash provider for the
-- simulator launch path. Upstash can still be used when configured, but
-- production field-test can now fail closed with Postgres-backed limits.

begin;

create table if not exists simulador.rate_limit_windows (
  key text primary key,
  count int not null default 0 check (count >= 0),
  reset_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_rate_limit_windows_reset_at
  on simulador.rate_limit_windows(reset_at);

alter table simulador.rate_limit_windows enable row level security;

comment on table simulador.rate_limit_windows is
  'Internal server-side rate limit buckets. RLS intentionally has no client policies; access through service-role RPC only.';

create or replace function simulador.consume_rate_limit(
  p_key text,
  p_limit int,
  p_window_seconds int
) returns table (
  success boolean,
  remaining int,
  reset_ms bigint,
  limit_value int
)
language plpgsql
security definer
set search_path = simulador, public, pg_temp
as $$
declare
  v_now timestamptz := now();
  v_reset_at timestamptz;
  v_count int;
begin
  if p_key is null or length(trim(p_key)) = 0 then
    raise exception 'rate limit key is required';
  end if;
  if p_limit is null or p_limit <= 0 then
    raise exception 'rate limit must be positive';
  end if;
  if p_window_seconds is null or p_window_seconds <= 0 then
    raise exception 'rate limit window must be positive';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_key, 0));

  select count, reset_at
    into v_count, v_reset_at
    from simulador.rate_limit_windows
   where key = p_key
   for update;

  if v_count is null or v_reset_at <= v_now then
    v_count := 1;
    v_reset_at := v_now + make_interval(secs => p_window_seconds);

    insert into simulador.rate_limit_windows (key, count, reset_at, updated_at)
         values (p_key, v_count, v_reset_at, v_now)
    on conflict (key) do update
          set count = excluded.count,
              reset_at = excluded.reset_at,
              updated_at = excluded.updated_at;

    return query select
      true,
      greatest(p_limit - v_count, 0),
      floor(extract(epoch from v_reset_at) * 1000)::bigint,
      p_limit;
    return;
  end if;

  if v_count < p_limit then
    v_count := v_count + 1;
    update simulador.rate_limit_windows
       set count = v_count,
           updated_at = v_now
     where key = p_key;

    return query select
      true,
      greatest(p_limit - v_count, 0),
      floor(extract(epoch from v_reset_at) * 1000)::bigint,
      p_limit;
    return;
  end if;

  return query select
    false,
    0,
    floor(extract(epoch from v_reset_at) * 1000)::bigint,
    p_limit;
end;
$$;

grant execute on function simulador.consume_rate_limit(text, int, int) to service_role;
grant all on simulador.rate_limit_windows to service_role;

notify pgrst, 'reload schema';

commit;
