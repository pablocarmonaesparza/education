"use client";

/**
 * Passthrough — los providers reales viven en `app/providers.tsx` (root layout).
 *
 * Antes vivían acá con `forcedTheme="light"`, lo que impedía dark mode automático
 * y solo aplicaba al route group (app)/. Movidos a root para que TODAS las
 * surfaces (auth, public, onboarding, app, admin) compartan el mismo
 * NextThemesProvider con `defaultTheme="system"`.
 *
 * Este wrapper se mantiene para no romper imports existentes en
 * - app/page.tsx
 * - app/(app)/layout.tsx
 * - app/(onboarding)/layout.tsx
 * - app/field-test/layout.tsx
 *
 * Puede borrarse cuando se limpien esos imports.
 */

export function SimuladorProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
