-- ============================================================================
-- Migration 010 — Telegram daily-send idempotency + RPC hardening
-- ----------------------------------------------------------------------------
-- Aplicada en Supabase el 2026-04-23 vía MCP apply_migration.
--
-- Fixes post-codex review de migration 009b:
--   1. Revocar ejecución de get_next_lesson_for_user() a anon/authenticated
--      (dejar solo service_role, que es quien realmente la llama desde las
--      edge functions).
--   2. Tabla telegram_daily_sends con PK compuesta (user_id, send_date) para
--      que si pg_cron se dispara 2 veces en un día (retry, network blip) el
--      segundo intento no re-envíe el mensaje. tg-daily-send hace INSERT con
--      ON CONFLICT DO NOTHING y trata 23505 como "duplicado, saltar".
-- ============================================================================

-- 1. Restringir el RPC
revoke execute on function get_next_lesson_for_user(uuid) from anon, authenticated;

-- 2. Tabla de idempotencia de envíos diarios
create table if not exists telegram_daily_sends (
  user_id           uuid not null references auth.users(id) on delete cascade,
  send_date         date not null default current_date,
  lecture_id        uuid references lectures(id) on delete set null,
  telegram_user_id  bigint,
  sent_at           timestamptz not null default now(),
  primary key (user_id, send_date)
);

create index if not exists telegram_daily_sends_date_idx
  on telegram_daily_sends(send_date);

alter table telegram_daily_sends enable row level security;
-- Sin policies: service_role escribe desde la edge function, nadie más lee.
