'use client';

import { useRouter } from 'next/navigation';
import ExperimentLesson, { type Step } from '@/components/experiment/ExperimentLesson';
import { createClient } from '@/lib/supabase/client';
import { persistLessonCompletion } from '@/lib/lessons/persist-completion';

/**
 * Client wrapper for the standalone /lecture/[slug] route.
 *
 * Why it exists: app/lecture/[slug]/page.tsx is a Server Component that
 * fetches the lesson and slides, then renders <ExperimentLesson>. Without
 * this wrapper, the lesson runs without any onComplete callback so
 * finishing a lesson via deep-link never persists progress to user_progress
 * — that's the bug we're fixing.
 *
 * What this does:
 *   - Receives the resolved lecture id + steps from the server page.
 *   - Wires onComplete → persistLessonCompletion (same shape the dashboard
 *     writes, so the standalone path doesn't drift from the dashboard
 *     path).
 *   - Wires onClose → navigates back to /dashboard. The standalone lesson
 *     page has no overlay to dismiss into; sending the user back to the
 *     dashboard is the natural exit (mirrors what handleCloseVideo does
 *     when the lesson is opened from the dashboard overlay).
 *
 * What this does NOT do:
 *   - daily streak (we don't have user_stats fetched here yet).
 *   - automatic next-lesson navigation (no onNext) — the user can pick
 *     from the dashboard. Adding "siguiente lección" here would require
 *     querying the next published lecture by display_order, which is
 *     scope creep for the bug fix. Flagged for a follow-up.
 */
export default function LectureRunner({
  lectureId,
  steps,
}: {
  lectureId: string;
  steps: Step[];
}) {
  const router = useRouter();
  const supabase = createClient();

  return (
    <ExperimentLesson
      steps={steps}
      lectureId={lectureId}
      onClose={() => {
        router.push('/dashboard');
      }}
      onComplete={async () => {
        // THROW on auth/persist failure. ExperimentLesson catches and
        // stays on the lesson (CTA re-enables) instead of silently
        // closing on a failed write — gives the user a retry instead of
        // losing the completion. console.warn alone would be
        // data-loss-by-default.
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error(
            `Sin sesión para guardar el progreso${authError ? `: ${authError.message}` : ''}`,
          );
        }
        const result = await persistLessonCompletion(supabase, user.id, lectureId);
        if (!result.ok) {
          throw new Error(
            `No se pudo guardar el progreso: ${result.error ?? 'error desconocido'}`,
          );
        }
      }}
    />
  );
}
