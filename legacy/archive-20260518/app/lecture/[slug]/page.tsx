import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LectureRunner from '@/components/lecture/LectureRunner';

/**
 * Dynamic lesson page.
 *
 * URL: /lecture/{slug} → carga la lectura con ese slug desde `lectures`,
 * levanta sus slides desde `slides` en orden, y los pasa al renderer
 * existente `<ExperimentLesson>` (vía LectureRunner client wrapper) como
 * prop `steps`.
 *
 * Autenticación: redirige a /auth/login si no hay sesión.
 *
 * Persistencia: LectureRunner cablea onComplete → persistLessonCompletion
 * (lib/lessons/persist-completion.ts) que escribe a `user_progress` con la
 * misma forma que el handler del dashboard, así abrir una lección por URL
 * directa ya guarda progreso (antes era TODO).
 */

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SlideRow = { id: string; kind: string; content: any; xp: number };

export default async function LecturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Auth gate — el renderer asume usuario logueado
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/auth/login?next=/lecture/${slug}`);

  // Resolve lecture by slug
  const { data: lecture } = await supabase
    .from('lectures')
    .select('id, title')
    .eq('slug', slug)
    .maybeSingle();

  if (!lecture) notFound();

  // Fetch slides in order
  const { data: rawSlides } = await supabase
    .from('slides')
    .select('id, kind, content, xp')
    .eq('lecture_id', lecture.id)
    .neq('status', 'archived')
    .order('order_in_lecture', { ascending: true })
    .returns<SlideRow[]>();

  if (!rawSlides || rawSlides.length === 0) notFound();

  // Adapt DB row → Step shape expected by <ExperimentLesson>.
  // content JSONB already matches the Step shape (minus `kind`, which is
  // promoted to a top-level column in DB). xp lives in content but also
  // in a DB column for query convenience — prefer content's value when
  // both are present, fall back to the column. `id` se propaga para que
  // SlideFlagButton pueda referenciar el slide al reportarlo.
  const steps = rawSlides.map((row) => ({
    id: row.id,
    kind: row.kind,
    ...row.content,
    xp: row.content?.xp ?? row.xp ?? undefined,
  }));

  return <LectureRunner lectureId={lecture.id} steps={steps} />;
}
