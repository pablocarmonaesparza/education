/**
 * Helper compartido: ¿está habilitado el dev bypass de auth?
 *
 * El bypass existe para QA visual local y en Vercel preview. En producción real
 * (VERCEL_ENV === "production") está APAGADO INCONDICIONALMENTE: ni siquiera
 * NEXT_PUBLIC_DEV_BYPASS_ENABLED lo enciende (R-06 del RULES_LEDGER — la flag
 * encendida en prod exponía las APIs admin con PII vía service_role). La cookie
 * `itera_dev_bypass=1` solo tiene efecto cuando este helper devuelve true.
 */

export function isDevBypassEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_DEV_BYPASS_DISABLED === "1") return false;

  // Producción real: nunca, sin excepciones. La flag de opt-in solo aplica
  // fuera de producción (dev local, builds locales de prod, Vercel preview).
  const vercelEnv = process.env.VERCEL_ENV ?? process.env.NEXT_PUBLIC_VERCEL_ENV;
  if (process.env.NODE_ENV === "production" && vercelEnv === "production") {
    return false;
  }

  if (process.env.NEXT_PUBLIC_DEV_BYPASS_ENABLED === "1") return true;

  if (process.env.NODE_ENV !== "production") return true;

  return vercelEnv === "preview" || vercelEnv === "development";
}

/**
 * ¿El bypass está ACTIVO para este request, dado el valor de la cookie
 * `itera_dev_bypass`?
 *
 * - Producción real: nunca (isDevBypassEnabled() === false).
 * - Dev local (NODE_ENV !== "production"): ON por default — cualquier browser
 *   en localhost entra sin togglear nada. Opt-out con cookie `=0` (lo setea
 *   `/dev`) cuando quieras probar el login real. Esto resuelve que la cookie
 *   no cruce entre browsers: en local no hace falta cookie.
 * - Vercel preview: opt-in explícito con cookie `=1`.
 */
export function isDevBypassActive(cookieValue: string | undefined): boolean {
  if (!isDevBypassEnabled()) return false;
  if (process.env.NODE_ENV !== "production") return cookieValue !== "0";
  return cookieValue === "1";
}
