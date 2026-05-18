import type { SupabaseClient } from '@supabase/supabase-js';
import type { AnalyticsResult } from './types';

/**
 * Wrapper de la view `global_engagement` (migration 010).
 *
 * Devuelve KPIs agregados across users vía count(distinct user_id) sobre
 * user_progress. Necesario porque calcular totales globales sumando o
 * tomando max sobre `section_analytics` per-section da resultado incorrecto:
 * una usuaria activa en sección 1 y sección 2 cuenta dos veces si se suma
 * y se sub-cuenta si se toma max.
 */

export type GlobalEngagement = {
  total_users_ever: number;
  active_last_30d: number;
  active_last_7d: number;
  users_completed_any_lecture: number;
  total_xp_awarded: number;
};

const ZERO_ENGAGEMENT: GlobalEngagement = {
  total_users_ever: 0,
  active_last_30d: 0,
  active_last_7d: 0,
  users_completed_any_lecture: 0,
  total_xp_awarded: 0,
};

export async function getGlobalEngagement(
  supabase: SupabaseClient,
): Promise<AnalyticsResult<GlobalEngagement>> {
  const { data, error } = await supabase
    .from('global_engagement')
    .select('*')
    .maybeSingle<GlobalEngagement>();

  if (error) {
    console.error('[analytics] global_engagement query failed:', error);
    return { data: ZERO_ENGAGEMENT, error };
  }
  return { data: data ?? ZERO_ENGAGEMENT, error: null };
}
