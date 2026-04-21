-- 004_cleanup_and_fks.sql
-- Limpieza de tablas legacy huérfanas (pre-pivote y n8n old flow).
--
-- Decisiones:
-- - education_chats: basura pre-pivote, ningún código del repo la usa.
--   El chatbot real vive en tutor_conversations + tutor_messages.
-- - n8n_chat_histories / n8n_chat_history: legacy n8n, confirmado safe drop.
--
-- Nota: user_progress ya tiene integridad completa:
--   - PK compuesto (user_id, lecture_id)
--   - FK user_id → auth.users(id) ON DELETE CASCADE
--   - FK lecture_id → lectures(id) ON DELETE CASCADE
-- (la FK de user_id apunta a auth.users, schema de Supabase Auth)

drop table if exists education_chats cascade;
drop table if exists n8n_chat_histories cascade;
drop table if exists n8n_chat_history cascade;
