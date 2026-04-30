import type { SupabaseClient } from '@supabase/supabase-js';
import type { AnalyticsResult, UserCurrentSection } from './types';

/**
 * Wrapper de la view `user_current_section` (migration 003).
 *
 * Base que Gamification extiende con queries user-facing (XP por sección,
 * racha, badges). Aquí solo lo mínimo: dada la sesión, devolver dónde está
 * el usuario actualmente en el curso.
 *
 * RLS: la view aplica el RLS de user_progress (security_invoker = true,
 * migration 005), así que un user authenticated solo verá su propia fila.
 *
 * Devuelve `{ data, error }` (ver `AnalyticsResult` en types.ts).
 */

export async function getCurrentSectionForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<AnalyticsResult<UserCurrentSection | null>> {
  const { data, error } = await supabase
    .from('user_current_section')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<UserCurrentSection>();

  if (error)
    console.error('[analytics] current_section_for_user query failed:', error);
  return { data: data ?? null, error };
}

/**
 * Admin: snapshot de qué sección está cursando cada usuario activo
 * (últimos 14 días). Requiere service_role para no quedar filtrado por RLS.
 */
export async function getAllActiveCurrentSections(
  supabase: SupabaseClient,
): Promise<AnalyticsResult<UserCurrentSection[]>> {
  const { data, error } = await supabase
    .from('user_current_section')
    .select('*')
    .order('last_active_at', { ascending: false })
    .returns<UserCurrentSection[]>();

  if (error)
    console.error('[analytics] all_active_current_sections query failed:', error);
  return { data: data ?? [], error };
}
