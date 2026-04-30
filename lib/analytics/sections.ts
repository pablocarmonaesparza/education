import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AnalyticsResult,
  SectionAnalytics,
  SectionDropoff,
} from './types';

/**
 * Wrappers de las views `section_analytics` y `section_dropoffs`.
 *
 * Cada función devuelve `{ data, error }` (ver `AnalyticsResult` en
 * types.ts) para que el caller distinga "no hay datos todavía" de "la
 * query falló" — crítico en dashboards admin donde un permiso roto se ve
 * igual que un dataset vacío.
 *
 * Las views ya existen (migration 003); aquí solo exponemos helpers
 * tipados para consumo desde server components o API routes.
 */

export async function getSectionAnalytics(
  supabase: SupabaseClient,
): Promise<AnalyticsResult<SectionAnalytics[]>> {
  const { data, error } = await supabase
    .from('section_analytics')
    .select('*')
    .order('display_order', { ascending: true })
    .returns<SectionAnalytics[]>();

  if (error) console.error('[analytics] section_analytics query failed:', error);
  return { data: data ?? [], error };
}

export async function getSectionDropoffs(
  supabase: SupabaseClient,
): Promise<AnalyticsResult<SectionDropoff[]>> {
  const { data, error } = await supabase
    .from('section_dropoffs')
    .select('*')
    .returns<SectionDropoff[]>();

  if (error) console.error('[analytics] section_dropoffs query failed:', error);
  return { data: data ?? [], error };
}

/**
 * Resumen de una sola sección. Útil para dashboards admin por sección.
 */
export async function getSectionAnalyticsById(
  supabase: SupabaseClient,
  sectionId: number,
): Promise<AnalyticsResult<SectionAnalytics | null>> {
  const { data, error } = await supabase
    .from('section_analytics')
    .select('*')
    .eq('section_id', sectionId)
    .maybeSingle<SectionAnalytics>();

  if (error)
    console.error('[analytics] section_analytics by id failed:', error);
  return { data: data ?? null, error };
}
