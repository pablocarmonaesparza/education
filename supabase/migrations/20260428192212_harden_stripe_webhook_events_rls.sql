-- ============================================================================
-- Harden Stripe webhook idempotency table
-- ----------------------------------------------------------------------------
-- Internal-only table used by /api/stripe-webhook with the service-role key.
-- Browser clients should never read, insert, update, or delete these rows.
-- ============================================================================

alter table public.stripe_webhook_events enable row level security;

revoke all on table public.stripe_webhook_events from anon, authenticated;
grant select, insert, update, delete on table public.stripe_webhook_events to service_role;

-- SECURITY DEFINER functions run with owner privileges. These are internal
-- trigger/job helpers, not public browser RPCs.
revoke execute on function public.award_lecture_xp(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.recalculate_user_stats(uuid) from public, anon, authenticated;
revoke execute on function public.evaluate_user_badges(uuid) from public, anon, authenticated;
revoke execute on function public.handle_user_progress_complete() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Telegram edge functions call this one with the service-role key.
revoke execute on function public.get_next_lesson_for_user(uuid) from public, anon, authenticated;
grant execute on function public.get_next_lesson_for_user(uuid) to service_role;
