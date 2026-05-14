-- ============================================================================
-- 20260514225425_cleanup_legacy_courses_surface.sql
-- ----------------------------------------------------------------------------
-- Post-pivot cleanup for the B2B Simulador.
--
-- Migration 018 dropped the legacy course/gamification/Telegram tables. This
-- follow-up removes the remaining callable surface around that deleted product:
-- orphan SQL functions, stale anon policies, and one mutable-search-path
-- trigger function reported by Supabase advisors.
--
-- Kept intentionally:
--   - public.users                  Auth/Stripe bridge + welcome-email state
--   - public.payments               Stripe receipts
--   - public.stripe_webhook_events  Stripe webhook idempotency
--   - public.enterprise_leads       B2B public lead form storage
--   - simulador.*                   Current product schema
-- ============================================================================

begin;

-- --------------------------------------------------------------------------
-- 1. Remove orphan legacy course/gamification/RAG functions.
-- --------------------------------------------------------------------------
drop function if exists public.award_lecture_xp(uuid, uuid) cascade;
drop function if exists public.recalculate_user_stats(uuid) cascade;
drop function if exists public.evaluate_user_badges(uuid) cascade;
drop function if exists public.handle_user_progress_complete() cascade;
drop function if exists public.get_next_lesson_for_user(uuid) cascade;

-- These two were created out-of-band in the legacy RAG path and depend on the
-- removed education/course corpus. Use exact remote signatures.
drop function if exists public.match_documents(public.vector, integer, jsonb) cascade;
drop function if exists public.search_videos_hybrid(
  public.vector,
  text[],
  text[],
  text,
  double precision,
  integer
) cascade;

-- --------------------------------------------------------------------------
-- 2. Harden enterprise_leads updated_at trigger function.
-- --------------------------------------------------------------------------
create or replace function public.tg_enterprise_leads_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function public.tg_enterprise_leads_set_updated_at()
  from public, anon, authenticated;

-- --------------------------------------------------------------------------
-- 3. Drop stale anon policies.
-- --------------------------------------------------------------------------
-- WhatsApp/phone anonymous lookup belonged to the old channel-routing system.
drop policy if exists "anon can select user by phone or whatsapp_id"
  on public.users;

-- /api/empresas-lead writes through service_role, so direct anon inserts are
-- unnecessary and flagged by Supabase advisors as overly permissive.
drop policy if exists "anyone can insert enterprise_leads"
  on public.enterprise_leads;

commit;
