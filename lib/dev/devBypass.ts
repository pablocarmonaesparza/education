/**
 * Helper compartido: ¿está habilitado el dev bypass de auth?
 *
 * ⚠️ 2026-07-XX: R-06 (bloqueo incondicional en prod) fue REVERTIDO a pedido
 * explícito de Pablo, con el riesgo confirmado dos veces (expone /api/admin/*
 * con PII vía service_role sin cookie de por medio, porque esas rutas viven
 * fuera de `protectedRoutes` en proxy.ts). Revertir esto en cuanto termine
 * de revisar — volver a la versión con el bloqueo incondicional de abajo:
 *
 *   if (process.env.NODE_ENV === "production" && vercelEnv === "production") {
 *     return false;
 *   }
 */

export function isDevBypassEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_DEV_BYPASS_DISABLED === "1") return false;

  const vercelEnv = process.env.VERCEL_ENV ?? process.env.NEXT_PUBLIC_VERCEL_ENV;

  if (process.env.NEXT_PUBLIC_DEV_BYPASS_ENABLED === "1") return true;

  if (process.env.NODE_ENV !== "production") return true;

  return vercelEnv === "preview" || vercelEnv === "development" || vercelEnv === "production";
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
