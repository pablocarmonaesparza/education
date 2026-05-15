-- ============================================================================
-- 20260515000115_move_vector_extension_to_extensions.sql
-- ----------------------------------------------------------------------------
-- Supabase security advisor cleanup:
--   extension_in_public_vector
--
-- The legacy education/RAG tables and RPCs were removed in prior migrations.
-- Remote preflight confirmed no user columns currently use the vector type, so
-- moving pgvector out of public does not rewrite data or break live objects.
-- Keeping the extension preserves future simulator/RAG optionality without
-- exposing the extension in the public schema.
-- ============================================================================

begin;

create schema if not exists extensions;

alter extension vector set schema extensions;

commit;
