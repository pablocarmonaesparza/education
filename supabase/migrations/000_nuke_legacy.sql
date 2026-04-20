-- ============================================================================
-- Migration 000 — Drop de tablas de contenido legacy
-- ----------------------------------------------------------------------------
-- Borra las 8 tablas viejas de contenido del curso para dejar la DB limpia
-- antes de crear el nuevo schema (ver 001_init_content_schema.sql).
--
-- Qué se borra (contenido del curso):
--   lectures                        → lecciones actuales (10 demo)
--   lecture_slides                  → slides de esas lecciones
--   education_system                → tabla plana legacy del outline
--   education_system_vectorized     → embeddings de education_system
--   user_exercises                  → ejercicios por usuario
--   exercise_progress               → progreso en ejercicios
--   checkpoint_submissions          → entregas de checkpoints
--   video_progress                  → progreso de videos
--
-- Qué se preserva (auth / billing / integraciones):
--   users, payments, intake_responses
--   tutor_conversations, tutor_messages, education_chats
--   telegram_link_codes, telegram_links
--   n8n_chat_histories, n8n_chat_history
--
-- CASCADE: por si alguna de las tablas "preservadas" tiene FKs
-- referenciando contenido legacy (tutor_messages podría tener lecture_id
-- como FK). CASCADE dropea esas constraints sin borrar las filas de las
-- tablas preservadas — solo rompe el vínculo muerto.
-- ============================================================================

-- Orden: primero las dependientes, luego las padres.
-- Si alguna no existe, IF EXISTS evita error.

drop table if exists lecture_slides              cascade;
drop table if exists exercise_progress           cascade;
drop table if exists checkpoint_submissions      cascade;
drop table if exists video_progress              cascade;
drop table if exists user_exercises              cascade;
drop table if exists education_system_vectorized cascade;
drop table if exists education_system            cascade;
drop table if exists lectures                    cascade;

-- ============================================================================
-- FIN DE MIGRATION 000
-- ----------------------------------------------------------------------------
-- Verificación post-ejecución esperada:
--   select table_name from information_schema.tables
--   where table_schema = 'public'
--     and table_name in (
--       'lectures','lecture_slides','education_system',
--       'education_system_vectorized','user_exercises',
--       'exercise_progress','checkpoint_submissions','video_progress'
--     );
--   → debe retornar 0 filas.
-- ============================================================================
