/**
 * Helper de admin gate — sirve para páginas internas (`/dashboard/admin/*`).
 *
 * Hoy la regla es simple y hardcoded:
 *   - Email termina en `@itera.la` (dominio del equipo), o
 *   - User id está en `ADMIN_USER_IDS` (whitelist manual).
 *
 * Cuando crezca el equipo, migrar a una columna `users.role` y un check de
 * RLS sobre las tablas internas. Por ahora overkill.
 */

import type { User } from '@supabase/supabase-js';

const ADMIN_USER_IDS: ReadonlySet<string> = new Set([
  // Pablo Carmona (founder, pablocarmonaesparza@gmail.com).
  // Resuelto el 2026-04-23 vía `select id from auth.users where email = ...`.
  '2bd9be26-6876-4b06-91bd-95fcd5c8842f',
]);

const ADMIN_EMAIL_DOMAIN = '@itera.la';

export function isAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  if (ADMIN_USER_IDS.has(user.id)) return true;
  const email = user.email?.toLowerCase().trim();
  if (!email) return false;
  return email.endsWith(ADMIN_EMAIL_DOMAIN);
}
