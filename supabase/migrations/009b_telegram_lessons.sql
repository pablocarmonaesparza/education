-- ============================================================================
-- Migration 009b — Telegram lessons infrastructure (aplicada vía MCP)
-- ----------------------------------------------------------------------------
-- Nota: esta migration ya fue aplicada en Supabase el 2026-04-23 vía la herramienta
-- apply_migration (nombre `009_telegram_sessions_and_scheduling`). Se guarda aquí
-- como mirror para que el repo refleje la DB. Si volvés a correr `supabase db push`
-- en un entorno limpio, las cláusulas `IF NOT EXISTS` la hacen idempotente.
--
-- El nombre 009b evita colisión con `009_slide_flags.sql` planeado por Education.
--
-- Habilita:
--   1. pg_net (async HTTP) + pg_cron (job scheduler) para envío diario
--   2. telegram_sessions (state machine del bot por chat)
--   3. get_next_lesson_for_user() RPC que devuelve próxima lectura pendiente
-- ============================================================================

-- 1. Extensiones
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

-- 2. Tabla de estado del bot
create table if not exists telegram_sessions (
  chat_id              bigint primary key,
  user_id              uuid not null references auth.users(id) on delete cascade,
  current_lecture_id   uuid references lectures(id) on delete set null,
  current_slide_index  smallint not null default 0 check (current_slide_index >= 0),
  last_message_id      bigint,
  slide_state          jsonb not null default '{}'::jsonb,
  updated_at           timestamptz not null default now()
);

create index if not exists telegram_sessions_user_idx on telegram_sessions(user_id);

drop trigger if exists telegram_sessions_updated_at on telegram_sessions;
create trigger telegram_sessions_updated_at
  before update on telegram_sessions
  for each row execute function set_updated_at();

alter table telegram_sessions enable row level security;
-- Sin policies: sólo service_role escribe desde la edge function.

-- 3. RPC: próxima lectura pendiente para un user
create or replace function get_next_lesson_for_user(p_user_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select l.id
  from lectures l
  join sections s on s.id = l.section_id
  where l.status = 'published'
    and s.status = 'published'
    and not exists (
      select 1
      from user_progress up
      where up.user_id = p_user_id
        and up.lecture_id = l.id
        and up.is_completed = true
    )
  order by s.display_order asc, l.display_order asc
  limit 1;
$$;

grant execute on function get_next_lesson_for_user(uuid) to anon, authenticated, service_role;

-- 4. Cron job: envío diario 9am MX (15:00 UTC, sin DST)
-- Aplicado como:
--   select cron.schedule('telegram-daily-lesson', '0 15 * * *', $$
--     select net.http_post(
--       url := 'https://<project>.supabase.co/functions/v1/tg-daily-send',
--       headers := jsonb_build_object('Content-Type', 'application/json'),
--       body := '{}'::jsonb
--     );
--   $$);
