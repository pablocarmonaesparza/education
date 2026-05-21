/**
 * Helper compartido: ¿está habilitado el dev bypass de auth?
 *
 *   - NODE_ENV !== 'production' (npm run dev local) → sí
 *   - NEXT_PUBLIC_VERCEL_ENV === 'preview' (deploy preview de Vercel) → sí
 *   - production real (Vercel production o NODE_ENV=production sin Vercel env) → no
 *
 * Esto permite que Pablo + equipo revisen el preview de Vercel con el
 * bypass cookie + el botón flotante DevReturnButton sin que estén
 * accesibles en el deploy de producción.
 *
 * NEXT_PUBLIC_VERCEL_ENV es seteado automáticamente por Vercel:
 *   https://vercel.com/docs/projects/environment-variables/system-environment-variables
 * Su prefijo NEXT_PUBLIC_ asegura disponibilidad client-side.
 */

export function isDevBypassEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "preview") return true;
  return false;
}
