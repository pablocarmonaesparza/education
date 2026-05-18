import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Persist a lesson completion to `user_progress`.
 *
 * Mirrors the inline logic in `app/dashboard/page.tsx:handleLessonComplete`
 * so the standalone lesson page (`/lecture/[slug]`) writes the same shape
 * the dashboard reads. The duplication is intentional for now — the
 * dashboard handler also does optimistic UI updates against React state,
 * so factoring the whole thing out would couple this lib to React. This
 * function is just the database half.
 *
 * Schema (post-pivot v1): `user_progress` PK is (user_id, lecture_id).
 * Several columns are NOT NULL with no defaults (`started_at`,
 * `last_active_at`, `slides_completed`, `xp_earned`, `attempts`), so we
 * have to provide them on INSERT.
 *
 * Strategy:
 *   1. Count slides for the lecture so `slides_completed` is consistent
 *      with `is_completed=true` (avoids the `is_completed=true` +
 *      `slides_completed=0` analytics inconsistency the dashboard fix
 *      already addressed). Read failure is fatal — we return early
 *      instead of writing a bogus 0.
 *   2. Look up existing row. If present, UPDATE only the completion
 *      fields, preserving `started_at` and `xp_earned`, incrementing
 *      `attempts`. If absent, INSERT with all NOT NULL fields.
 *   3. Caller decides what to do with success/error (refresh state,
 *      navigate, toast, etc).
 *
 * KNOWN GAP: on first INSERT via this path, `started_at = completed_at`
 * because nothing tracks the moment the lesson opened. Same gap as the
 * dashboard handler — flagged for a later "lesson start" hook.
 */
export interface PersistCompletionResult {
  ok: boolean;
  error?: string;
}

export async function persistLessonCompletion(
  supabase: SupabaseClient,
  userId: string,
  lectureId: string,
): Promise<PersistCompletionResult> {
  const now = new Date().toISOString();

  const { count: slideCount, error: slideCountError } = await supabase
    .from('slides')
    .select('id', { count: 'exact', head: true })
    .eq('lecture_id', lectureId)
    .neq('status', 'archived');

  if (slideCountError || slideCount == null) {
    return {
      ok: false,
      error: `Could not count slides: ${slideCountError?.message ?? 'no count returned'}`,
    };
  }
  const terminalSlideCount = slideCount;

  const { data: existing, error: existingError } = await supabase
    .from('user_progress')
    .select('started_at, attempts, xp_earned, slides_completed')
    .eq('user_id', userId)
    .eq('lecture_id', lectureId)
    .maybeSingle();
  if (existingError) {
    return {
      ok: false,
      error: `Could not read existing user_progress: ${existingError.message}`,
    };
  }

  if (existing) {
    const { error } = await supabase
      .from('user_progress')
      .update({
        last_active_at: now,
        completed_at: now,
        is_completed: true,
        slides_completed: Math.max(
          existing.slides_completed ?? 0,
          terminalSlideCount,
        ),
        attempts: (existing.attempts ?? 0) + 1,
      })
      .eq('user_id', userId)
      .eq('lecture_id', lectureId);
    if (error) {
      return { ok: false, error: `UPDATE failed: ${error.message}` };
    }
  } else {
    const { error } = await supabase.from('user_progress').insert({
      user_id: userId,
      lecture_id: lectureId,
      started_at: now,
      last_active_at: now,
      completed_at: now,
      is_completed: true,
      slides_completed: terminalSlideCount,
      xp_earned: 0,
      attempts: 1,
    });
    if (error) {
      return { ok: false, error: `INSERT failed: ${error.message}` };
    }
  }

  return { ok: true };
}
