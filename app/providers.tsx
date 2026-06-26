"use client";

/**
 * Providers globales del sistema (montados en root layout).
 *
 * - HeroUIProvider: enrutador react-aria conectado a Next router.
 * - NextThemesProvider: dark/light mode automático via
 *   `prefers-color-scheme` del sistema operativo. El user puede
 *   override-ear con un toggle (no implementado aún en UI), persistido
 *   en localStorage key `itera-theme`.
 *
 * `attribute="class"` mete `.dark` o `.light` en <html>, que es lo que
 * leen tanto Tailwind (dark variant) como nuestro simulador.css
 * (.dark .simulador-root { ... }).
 *
 * `defaultTheme="system"` + `enableSystem` = sigue el OS por defecto.
 * `suppressHydrationWarning` en <html> evita el flash de mismatch
 * server/client (NextThemes detecta el theme solo en client).
 */

import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import { DevReturnButton } from "@/components/simulador/DevReturnButton";
import { DesignOverridesInjector } from "@/components/simulador/DesignOverridesInjector";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        storageKey="itera-theme"
      >
        {/* Aplica overrides de /design en TODAS las surfaces. */}
        <DesignOverridesInjector />
        {children}
        <DevReturnButton />
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
