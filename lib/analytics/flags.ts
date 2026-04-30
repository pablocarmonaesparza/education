import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AnalyticsResult,
  OpenFlagsBySection,
  SlideFlagAdminRow,
} from './types';

/**
 * Queries admin sobre las views `slide_flags_admin` (migration 009 + 012)
 * y `open_flags_by_section` (migration 012).
 *
 * IMPORTANTE: estas queries están diseñadas para ejecutarse con
 * service_role (admin dashboard). Con el cliente normal de un user
 * autenticado, RLS sobre `slide_flags` filtra solo sus propios reports —
 * la view agrega across users, lo cual no es lo que un user no-admin
 * debe ver.
 *
 * Devuelven `{ data, error }` (ver `AnalyticsResult` en types.ts) para
 * que la admin UI distinga falla de empty.
 */

export async function getTopFlaggedSlides(
  supabase: SupabaseClient,
  opts: { onlyOpen?: boolean; limit?: number } = {},
): Promise<AnalyticsResult<SlideFlagAdminRow[]>> {
  const limit = opts.limit ?? 20;
  let query = supabase.from('slide_flags_admin').select('*');

  if (opts.onlyOpen) {
    query = query.gt('open_count', 0);
  }

  const { data, error } = await query
    .order('open_count', { ascending: false })
    .order('flag_count', { ascending: false })
    .limit(limit)
    .returns<SlideFlagAdminRow[]>();

  if (error)
    console.error('[analytics] top_flagged_slides query failed:', error);
  return { data: data ?? [], error };
}

export async function getFlagsForLecture(
  supabase: SupabaseClient,
  lectureId: string,
): Promise<AnalyticsResult<SlideFlagAdminRow[]>> {
  const { data, error } = await supabase
    .from('slide_flags_admin')
    .select('*')
    .eq('lecture_id', lectureId)
    .order('slide_order', { ascending: true })
    .returns<SlideFlagAdminRow[]>();

  if (error)
    console.error('[analytics] flags_for_lecture query failed:', error);
  return { data: data ?? [], error };
}

/**
 * Open flags agregados por sección. Lee de la view
 * `open_flags_by_section` (migration 012) que ya hace el `count + group by`
 * en SQL — no más reduce en JS, no más riesgo de under-count cuando los
 * slides flageados pasen el row-cap de PostgREST (1000 default).
 *
 * La view solo devuelve filas con `open_flags > 0`; si el resultado viene
 * vacío significa cero flags abiertos org-wide y la admin UI debe
 * renderizar el empty state genuino.
 */
export async function getOpenFlagsBySection(
  supabase: SupabaseClient,
): Promise<AnalyticsResult<OpenFlagsBySection[]>> {
  const { data, error } = await supabase
    .from('open_flags_by_section')
    .select('*')
    .order('open_flags', { ascending: false })
    .returns<OpenFlagsBySection[]>();

  if (error)
    console.error('[analytics] open_flags_by_section query failed:', error);
  return { data: data ?? [], error };
}
