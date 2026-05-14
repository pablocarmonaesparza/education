/**
 * Determina si el user autenticado es staff de Itera para operaciones
 * privilegiadas (human review queue, override de reports, ver eval logs).
 *
 * MVP: allowlist por email vía env var `SIMULADOR_STAFF_EMAILS`
 * (comma-separated). Pre-IPO esto se reemplazará con un role en
 * `simulador.users.role = 'itera_staff'` o similar.
 *
 * Llamar desde route handlers después de `supabase.auth.getUser()`.
 *
 * Comodín en dev:
 *   - Si `NODE_ENV !== "production"` y `SIMULADOR_STAFF_EMAILS` está vacío,
 *     concede acceso a cualquier user autenticado (para no bloquear DX).
 *   - En producción, allowlist vacía = nadie tiene acceso (fail-closed).
 */

export function isStaffEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = (process.env.SIMULADOR_STAFF_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (list.length === 0) {
    return process.env.NODE_ENV !== "production";
  }
  return list.includes(email.toLowerCase());
}
