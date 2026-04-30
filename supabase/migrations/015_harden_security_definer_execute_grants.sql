-- ============================================================================
-- Migration 015 — harden security definer RPC grants
-- ----------------------------------------------------------------------------
-- SECURITY DEFINER functions run with the owner privileges. These functions are
-- intended for DB triggers/internal jobs, not direct client RPC calls. Postgres
-- grants EXECUTE to PUBLIC by default unless revoked, so lock them down
-- explicitly.
-- ============================================================================

revoke execute on function award_lecture_xp(uuid, uuid) from public, anon, authenticated;
revoke execute on function recalculate_user_stats(uuid) from public, anon, authenticated;
revoke execute on function evaluate_user_badges(uuid) from public, anon, authenticated;
revoke execute on function handle_user_progress_complete() from public, anon, authenticated;

-- Edge functions call this one with the service-role key. Keep it unavailable
-- to browser clients, but explicit for service_role so clean environments work.
revoke execute on function get_next_lesson_for_user(uuid) from public, anon, authenticated;
grant execute on function get_next_lesson_for_user(uuid) to service_role;

