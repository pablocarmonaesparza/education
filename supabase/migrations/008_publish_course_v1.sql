-- ============================================================================
-- Migration 008 — Publicar curso v1 completo
-- ----------------------------------------------------------------------------
-- Las 100 lectures estaban en 'planned' y los 1000 slides en 'drafted' desde
-- el upload inicial (commit 84e812a, "100 lecciones × 10 slides del curso").
-- El commit c251e58 ("curso completo ya en prod") removió el maintenance gate
-- pero nunca se actualizó el status. El frontend seguía sirviendo el contenido
-- con filtro NEQ archived, pero analíticas y cualquier query que filtre por
-- 'published' estaban ciegas al curso.
--
-- Con el curso live y pagos de Stripe configurados, tiene sentido marcar
-- todo como published. Futuras ediciones con preview pueden usar un status
-- intermedio si se requiere (archived queda disponible para retiros).
--
-- El filtro del trigger de gamification (migration 007, status != 'archived')
-- no requiere cambio — con todo publicado produce el mismo resultado y
-- queda como defensa en profundidad contra archivados futuros.
-- ============================================================================

-- 1. Lectures: planned → published
UPDATE public.lectures
   SET status = 'published',
       published_at = COALESCE(published_at, now()),
       updated_at = now()
 WHERE status = 'planned';

-- 2. Slides: drafted → published
UPDATE public.slides
   SET status = 'published',
       published_at = COALESCE(published_at, now()),
       updated_at = now()
 WHERE status = 'drafted';

-- 3. Sections: planned → published
UPDATE public.sections
   SET status = 'published',
       published_at = COALESCE(published_at, now()),
       updated_at = now()
 WHERE status = 'planned';

-- Verificación (no fail — solo para log):
DO $$
DECLARE
  v_sections_pub int;
  v_lectures_pub int;
  v_slides_pub int;
BEGIN
  SELECT COUNT(*) INTO v_sections_pub FROM public.sections WHERE status = 'published';
  SELECT COUNT(*) INTO v_lectures_pub FROM public.lectures WHERE status = 'published';
  SELECT COUNT(*) INTO v_slides_pub FROM public.slides WHERE status = 'published';
  RAISE NOTICE 'Migration 008 done: % sections, % lectures, % slides published',
    v_sections_pub, v_lectures_pub, v_slides_pub;
END $$;
