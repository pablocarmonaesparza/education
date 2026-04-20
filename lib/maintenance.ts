/**
 * Maintenance mode check. Returns true when content routes should render
 * the MaintenancePage instead of their normal UI.
 *
 * Controlled via `NEXT_PUBLIC_MAINTENANCE_MODE` in `.env.local`:
 *   - unset or "false" → normal operation
 *   - "true"           → content routes show maintenance screen
 *
 * This is a soft block: auth still works, the user can log in, but
 * content pages early-return the maintenance screen. To work locally
 * during the migration, set the var to "false" in your shell or remove
 * it from .env.local temporarily.
 */
export function isMaintenanceMode(): boolean {
  return process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
}
