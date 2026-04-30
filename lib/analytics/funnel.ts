import type { SupabaseClient } from '@supabase/supabase-js';
import type { AnalyticsResult, LectureFunnelRow } from './types';

/**
 * Wrapper de la view `lecture_funnel` (migration 003).
 *
 * Devuelve, por cada lección, cuántos usuarios la empezaron, cuántos la
 * completaron, cuántos abandonaron y el % de completion. Ordenado por
 * sección + display_order de la lección, listo para renderizar.
 *
 * Devuelve `{ data, error }` (ver `AnalyticsResult` en types.ts) para
 * distinguir falla de empty en admin UI.
 */

export async function getLectureFunnel(
  supabase: SupabaseClient,
  opts: { sectionId?: number } = {},
): Promise<AnalyticsResult<LectureFunnelRow[]>> {
  let query = supabase.from('lecture_funnel').select('*');
  if (opts.sectionId !== undefined) {
    query = query.eq('section_id', opts.sectionId);
  }
  const { data, error } = await query
    .order('section_id', { ascending: true })
    .order('lecture_order', { ascending: true })
    .returns<LectureFunnelRow[]>();

  if (error) console.error('[analytics] lecture_funnel query failed:', error);
  return { data: data ?? [], error };
}

/**
 * Lecciones con peor completion rate. Solo cuenta lecciones con al menos
 * `minStarts` usuarios que la empezaron, para evitar ruido de lecciones
 * con n=1.
 */
export async function getWorstCompletionLectures(
  supabase: SupabaseClient,
  opts: { minStarts?: number; limit?: number } = {},
): Promise<AnalyticsResult<LectureFunnelRow[]>> {
  const minStarts = opts.minStarts ?? 5;
  const limit = opts.limit ?? 10;

  const { data, error } = await supabase
    .from('lecture_funnel')
    .select('*')
    .gte('users_started', minStarts)
    .not('completion_rate_pct', 'is', null)
    .order('completion_rate_pct', { ascending: true })
    .limit(limit)
    .returns<LectureFunnelRow[]>();

  if (error) console.error('[analytics] worst completion query failed:', error);
  return { data: data ?? [], error };
}
