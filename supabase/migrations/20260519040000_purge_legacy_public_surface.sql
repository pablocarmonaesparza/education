-- Purga final del producto legacy Itera Courses.
--
-- Objetivo:
--   - Ninguna tabla de producto viva en `public`.
--   - Stripe webhook dedup vive en `simulador.stripe_webhook_events`.
--   - Auth/billing/runtime usan `simulador.users` y `simulador.subscriptions`.
--
-- Idempotente: se puede correr varias veces.

begin;

create schema if not exists simulador;

create table if not exists simulador.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

create index if not exists simulador_stripe_webhook_events_processed_at_idx
  on simulador.stripe_webhook_events(processed_at desc);

alter table simulador.stripe_webhook_events enable row level security;
revoke all on table simulador.stripe_webhook_events from anon, authenticated;
grant select, insert, update, delete on table simulador.stripe_webhook_events to service_role;

do $$
begin
  if to_regclass('public.stripe_webhook_events') is not null then
    insert into simulador.stripe_webhook_events (event_id, event_type, processed_at)
    select event_id, event_type, processed_at
      from public.stripe_webhook_events
    on conflict (event_id) do nothing;
  end if;
end;
$$;

-- Auth trigger viejo del LMS: insertaba auth.users -> public.users.
drop trigger if exists on_auth_user_created on auth.users;

do $$
begin
  if to_regclass('public.users') is not null then
    execute 'drop trigger if exists update_users_updated_at on public.users';
  end if;
  if to_regclass('public.intake_responses') is not null then
    execute 'drop trigger if exists update_intake_responses_updated_at on public.intake_responses';
  end if;
  if to_regclass('public.payments') is not null then
    execute 'drop trigger if exists update_payments_updated_at on public.payments';
  end if;
  if to_regclass('public.user_progress') is not null then
    execute 'drop trigger if exists user_progress_complete_stats on public.user_progress';
    execute 'drop trigger if exists user_progress_badges on public.user_progress';
  end if;
end;
$$;

-- Vistas derivadas del producto de cursos.
drop view if exists public.section_analytics cascade;
drop view if exists public.lecture_funnel cascade;
drop view if exists public.dropoff_analysis cascade;
drop view if exists public.global_engagement cascade;
drop view if exists public.slide_flags_admin cascade;
drop view if exists public.slide_flags_admin_v2 cascade;

-- Funciones/RPCs del LMS, tutor, gamification y Telegram.
drop function if exists public.handle_new_user() cascade;
drop function if exists public.update_updated_at_column() cascade;
drop function if exists public.award_lecture_xp(uuid, uuid) cascade;
drop function if exists public.recalculate_user_stats(uuid) cascade;
drop function if exists public.handle_user_progress_complete() cascade;
drop function if exists public.evaluate_user_badges(uuid) cascade;
drop function if exists public.get_next_lesson_for_user(uuid) cascade;

-- Tablas del producto anterior. Cascade intencional: queremos cortar
-- constraints, triggers y policies colgadas de esta superficie.
drop table if exists public.enterprise_leads cascade;
drop table if exists public.payments cascade;
drop table if exists public.stripe_webhook_events cascade;
drop table if exists public.users cascade;
drop table if exists public.intake_responses cascade;
drop table if exists public.user_progress cascade;
drop table if exists public.user_stats cascade;
drop table if exists public.user_badges cascade;
drop table if exists public.badges_catalog cascade;
drop table if exists public.slide_flags cascade;
drop table if exists public.telegram_daily_sends cascade;
drop table if exists public.telegram_link_codes cascade;
drop table if exists public.telegram_links cascade;
drop table if exists public.telegram_sessions cascade;
drop table if exists public.tutor_conversations cascade;
drop table if exists public.tutor_messages cascade;
drop table if exists public.video_favorites cascade;
drop table if exists public.slides cascade;
drop table if exists public.lectures cascade;
drop table if exists public.sections cascade;

notify pgrst, 'reload schema';
notify pgrst, 'reload config';

commit;
