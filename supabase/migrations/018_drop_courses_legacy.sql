-- ============================================================================
-- 018_drop_courses_legacy.sql
-- ----------------------------------------------------------------------------
-- Limpieza del producto legacy "Itera Courses" (B2C, cursos personalizados con
-- AI tutor) que fue reemplazado por el Simulador (B2B, namespace `simulador`).
--
-- Estrategia: DROP IF EXISTS con CASCADE para tablas y views. No se intenta
-- backup porque las tablas están vacías o tienen solo datos sintéticos de seed.
--
-- Mantenido (NO se borra):
--   - auth.users           (Supabase auth core)
--   - public.users         (extensión de auth.users con tier/stripe — usado por billing y bridge a simulador.users)
--   - public.payments      (recibos Stripe)
--   - public.stripe_webhook_events       (dedup webhooks)
--   - public.stripe_webhook_event_logs   (audit hardened)
--   - public.enterprise_leads            (lead capture form, sigue activo)
--
-- Borrado:
--   - Curso content: sections, lectures, slides
--   - Progreso usuario: user_progress, intake_responses
--   - AI Tutor: tutor_conversations, tutor_messages
--   - Telegram integration: telegram_link_codes, telegram_links, telegram_sessions
--   - Analítica derivada: views (section_analytics, lecture_funnel, etc.)
--   - Gamification: badges_catalog, user_badges (no aplica a Simulador B2B)
--   - Slide reports: slide_flags
--   - Histórico n8n: n8n_chat_histories
-- ============================================================================

begin;

-- Views derivadas primero (dependen de tablas base).
drop view if exists public.section_analytics cascade;
drop view if exists public.lecture_funnel cascade;
drop view if exists public.user_current_section cascade;
drop view if exists public.section_dropoffs cascade;
drop view if exists public.global_engagement cascade;

-- Tablas de contenido de curso.
drop table if exists public.user_progress cascade;
drop table if exists public.lecture_embeddings cascade;  -- vector embeddings de lectures
drop table if exists public.slides cascade;
drop table if exists public.lectures cascade;
drop table if exists public.sections cascade;

-- Tablas de onboarding/intake legacy.
drop table if exists public.intake_responses cascade;

-- AI Tutor (chat con AI sobre lecciones).
drop table if exists public.tutor_messages cascade;
drop table if exists public.tutor_conversations cascade;

-- Integración con Telegram bot.
drop table if exists public.telegram_daily_sends cascade;  -- log de envíos diarios
drop table if exists public.telegram_sessions cascade;
drop table if exists public.telegram_links cascade;
drop table if exists public.telegram_link_codes cascade;

-- Histórico n8n (legacy workflow).
drop table if exists public.n8n_chat_histories cascade;

-- User reports en slides.
drop table if exists public.slide_flags cascade;

-- Gamification (badges, XP, user_stats).
drop table if exists public.user_stats cascade;
drop table if exists public.user_badges cascade;
drop table if exists public.badges cascade;            -- catálogo (nombre real, no badges_catalog)
drop table if exists public.badges_catalog cascade;   -- por si quedó del esquema viejo

-- Funciones auxiliares de Itera Courses (si existen).
drop function if exists public.calculate_user_xp(uuid) cascade;
drop function if exists public.update_section_progress(uuid, uuid) cascade;
drop function if exists public.handle_lecture_completion() cascade;
drop function if exists public.refresh_section_analytics() cascade;

commit;

-- ============================================================================
-- Verificación post-aplicación (correr manualmente después):
--
-- select table_schema, table_name
--   from information_schema.tables
--  where table_schema = 'public'
--    and table_name in (
--      'sections','lectures','slides','user_progress','intake_responses',
--      'tutor_conversations','tutor_messages','telegram_link_codes',
--      'telegram_links','telegram_sessions','n8n_chat_histories',
--      'slide_flags','badges_catalog','user_badges'
--    );
-- -- Expected: 0 rows.
--
-- select table_schema, table_name
--   from information_schema.tables
--  where table_schema = 'public'
-- order by table_name;
-- -- Expected: solo users, payments, stripe_webhook_events,
-- --   stripe_webhook_event_logs, enterprise_leads.
-- ============================================================================
