import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client. Bypassa RLS — úsalo SOLO en server code,
 * después de validar que el caller es admin (`lib/auth/isAdmin.ts`).
 *
 * Usado por dashboards internos que necesitan agregar across users (funnel,
 * flags, completion rates, etc.). El cliente normal de `lib/supabase/server`
 * respeta RLS y solo ve las filas del user autenticado, lo cual genera
 * métricas falsamente bajas en pantallas admin.
 *
 * Throws si `SUPABASE_SERVICE_ROLE_KEY` no está definido — no caemos
 * silenciosamente al cliente con RLS.
 */
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL no está definido');
  if (!serviceKey)
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY no está definido — no se puede inicializar el cliente admin',
    );

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
