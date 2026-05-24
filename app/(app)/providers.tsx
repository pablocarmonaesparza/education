"use client";

/**
 * Passthrough — los providers reales viven en `app/providers.tsx` (root layout).
 *
 * Antes este archivo montaba un NextThemesProvider duplicado con storageKey
 * distinta ("simulador-theme") que generaba dos sistemas de tema en paralelo:
 * el root quedaba sin provider para /design, /dev, /, /auth, /onboarding
 * (no se aplicaba dark mode en esas surfaces) y (app) tenía el suyo propio
 * desincronizado del root.
 *
 * 2026-05-24: colapsado a passthrough. El único theme provider vive en
 * app/providers.tsx (root) con storageKey="itera-theme", lo que garantiza
 * que TODA la app respete el toggle de dark mode y compartan el mismo
 * estado de tema.
 *
 * Este wrapper se mantiene para no romper imports existentes en
 *   app/(app)/layout.tsx
 *   app/(onboarding)/layout.tsx (si aplica)
 * Puede borrarse cuando se limpien esos imports.
 */

export function SimuladorProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
