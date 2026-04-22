-- 005_rls_policies_pre_launch.sql
-- Resuelve los advisors de seguridad pre-lanzamiento público:
--   - rls_disabled_in_public (5 tablas)
--   - security_definer_view (5 views)
--   - function_search_path_mutable (2 funciones)

-- =========================================================
-- 1. Content tables: public read, only service_role writes
-- =========================================================
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecture_embeddings ENABLE ROW LEVEL SECURITY;

-- Public read for anon + authenticated
DROP POLICY IF EXISTS "public_read_sections" ON public.sections;
CREATE POLICY "public_read_sections" ON public.sections
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "public_read_lectures" ON public.lectures;
CREATE POLICY "public_read_lectures" ON public.lectures
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "public_read_slides" ON public.slides;
CREATE POLICY "public_read_slides" ON public.slides
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "public_read_lecture_embeddings" ON public.lecture_embeddings;
CREATE POLICY "public_read_lecture_embeddings" ON public.lecture_embeddings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Writes via service_role only (service_role bypasses RLS by design).
-- No INSERT/UPDATE/DELETE policies are created here, so anon/authenticated
-- cannot modify content. Scripts that use SUPABASE_SERVICE_ROLE_KEY
-- (upload-slides.py, upload-embeddings.py, etc.) keep working unchanged.

-- =========================================================
-- 2. user_progress: strict per-user isolation
-- =========================================================
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_progress" ON public.user_progress;
CREATE POLICY "users_read_own_progress" ON public.user_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_insert_own_progress" ON public.user_progress;
CREATE POLICY "users_insert_own_progress" ON public.user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_update_own_progress" ON public.user_progress;
CREATE POLICY "users_update_own_progress" ON public.user_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_delete_own_progress" ON public.user_progress;
CREATE POLICY "users_delete_own_progress" ON public.user_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =========================================================
-- 3. Views: SECURITY DEFINER → SECURITY INVOKER
-- Respect RLS of the caller, not the creator.
-- =========================================================
ALTER VIEW public.section_analytics SET (security_invoker = true);
ALTER VIEW public.lecture_embedding_status SET (security_invoker = true);
ALTER VIEW public.section_dropoffs SET (security_invoker = true);
ALTER VIEW public.lecture_funnel SET (security_invoker = true);
ALTER VIEW public.user_current_section SET (security_invoker = true);

-- =========================================================
-- 4. Functions: fix mutable search_path
-- =========================================================
ALTER FUNCTION public.set_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.lecture_embeddings_set_updated_at() SET search_path = public, pg_temp;
