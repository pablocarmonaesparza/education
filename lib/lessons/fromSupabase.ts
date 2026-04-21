import { createClient } from '@/lib/supabase/client';
import type { Step } from '@/components/experiment/ExperimentLesson';

export interface LectureRow {
  id: string;
  slug: string;
  section_id: number;
  section_name: string;
  section_display_order: number;
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
 * Fetch all lectures visible to the dashboard, ordered by section then display_order.
 * Includes any lecture that isn't archived — published, in_progress, or planned —
 * so drafts-in-progress render during development. Production filtering by
 * `status = 'published'` can be re-added once the curriculum stabilizes.
 *
 * Joins with `sections` to get the display name, and maps post-pivot column
 * names (display_order, est_minutes) back to the shape expected by the
 * dashboard (`order_in_section`, `estimated_minutes`). Some legacy fields
 * (concept_id, has_exercises, difficulty) are stubbed since they no longer
 * exist in the schema.
 */
export async function fetchPublishedLectures(): Promise<LectureRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('lectures')
    .select(
      'id, slug, section_id, display_order, title, display_title, narrative_arc, concept_name, scenario_character, est_minutes, status, sections!inner(name, display_order)',
    )
    .neq('status', 'archived')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[lessons] failed to fetch lectures', error);
    return [];
  }

  type SectionEmbed = { name: string; display_order: number };
  type RawRow = {
    id: string;
    slug: string;
    section_id: number;
    display_order: number;
    title: string;
    display_title: string | null;
    narrative_arc: string | null;
    concept_name: string | null;
    scenario_character: string | null;
    est_minutes: number | null;
    status: string;
    sections: SectionEmbed | SectionEmbed[] | null;
  };

  // Map + sort by section.display_order, then lecture.display_order.
  // We can't rely on PG ordering by the embedded table nicely, so sort in JS.
  const mapped = ((data ?? []) as unknown as RawRow[]).map((r) => {
    const section = Array.isArray(r.sections) ? r.sections[0] : r.sections;
    return {
      id: r.id,
      slug: r.slug,
      section_id: r.section_id,
      section_name: section?.name ?? '',
      section_display_order: section?.display_order ?? r.section_id,
      concept_id: '',
      concept_name: r.concept_name ?? '',
      order_in_section: r.display_order,
      title: r.display_title ?? r.title,
      narrative_arc: r.narrative_arc,
      scenario: r.scenario_character,
      has_exercises: true,
      difficulty: 1,
      estimated_minutes: r.est_minutes ?? 10,
      status: r.status,
    };
  });

  mapped.sort((a, b) => {
    if (a.section_display_order !== b.section_display_order) {
      return a.section_display_order - b.section_display_order;
    }
    return a.order_in_section - b.order_in_section;
  });

  return mapped;
}

/**
 * Fetch slides for a given lecture, ordered. Returns empty array if none found.
 * Reads from the new `slides` table (post-pivot). Includes drafts so WIP
 * lessons render in dev; archived slides are filtered out.
 */
export async function fetchLectureSlides(lectureId: string): Promise<SlideRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('slides')
    .select('*')
    .eq('lecture_id', lectureId)
    .neq('status', 'archived')
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
