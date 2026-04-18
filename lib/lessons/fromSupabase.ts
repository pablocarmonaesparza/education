import { createClient } from '@/lib/supabase/client';
import type { Step } from '@/components/experiment/ExperimentLesson';

export interface LectureRow {
  id: string;
  slug: string;
  section_id: number;
  section_name: string;
  concept_id: string;
  concept_name: string;
  order_in_section: number;
  title: string;
  narrative_arc: string | null;
  scenario: string | null;
  has_exercises: boolean;
  difficulty: number;
  estimated_minutes: number;
  status: string;
}

export interface SlideRow {
  id: string;
  lecture_id: string;
  order_in_lecture: number;
  kind: string;
  content: Record<string, unknown>;
  is_scoreable: boolean;
  xp: number;
}

/**
 * Fetch all published lectures ordered by section then order_in_section.
 */
export async function fetchPublishedLectures(): Promise<LectureRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('lectures')
    .select('*')
    .eq('status', 'published')
    .order('section_id', { ascending: true })
    .order('order_in_section', { ascending: true });

  if (error) {
    console.error('[lessons] failed to fetch lectures', error);
    return [];
  }
  return (data ?? []) as LectureRow[];
}

/**
 * Fetch slides for a given lecture, ordered. Returns empty array if none found.
 */
export async function fetchLectureSlides(lectureId: string): Promise<SlideRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('lecture_slides')
    .select('*')
    .eq('lecture_id', lectureId)
    .eq('status', 'published')
    .order('order_in_lecture', { ascending: true });

  if (error) {
    console.error('[lessons] failed to fetch slides', error);
    return [];
  }
  return (data ?? []) as SlideRow[];
}

/**
 * Transform a SlideRow (kind + JSONB content) into the Step shape that
 * ExperimentLesson renders. The content shape is validated by the sum of:
 *   - DB CHECK constraint on `kind`
 *   - This function's spread of `content` into the Step
 *   - ExperimentLesson's runtime assumptions per kind
 *
 * If a slide's content is malformed, the frontend renders a fallback. See
 * ExperimentLesson error boundary.
 */
export function slideRowToStep(row: SlideRow): Step {
  const kind = row.kind as Step['kind'];
  const content = row.content ?? {};
  return { kind, ...(content as Record<string, unknown>) } as Step;
}

export async function fetchLectureAsSteps(lectureId: string): Promise<Step[]> {
  const rows = await fetchLectureSlides(lectureId);
  return rows.map(slideRowToStep);
}
