"use client";

/**
 * Botón flotante chico en la esquina bottom-right que vuelve al hub /dev.
 * Visible SOLO en:
 *   - npm run dev local (NODE_ENV !== "production")
 *   - Vercel preview deploys (NEXT_PUBLIC_VERCEL_ENV === "preview")
 *
 * En producción real NUNCA se monta (R-06): el guard es un allowlist de
 * entorno evaluado en build-time, independiente de NEXT_PUBLIC_DEV_BYPASS_ENABLED.
 * Esto importa porque en el bundle de cliente `process.env.VERCEL_ENV` no
 * existe — si solo dependiéramos de isDevBypassEnabled() y la flag quedara
 * encendida en Vercel, el chip aparecería en itera.la. Con el allowlist, un
 * build de producción que no sea preview compila esto a `return null` fijo.
 *
 * Además requiere isDevBypassEnabled() (respeta NEXT_PUBLIC_DEV_BYPASS_DISABLED
 * y el opt-in de preview).
 *
 * Se monta globalmente en app/providers.tsx para estar disponible en todas
 * las surfaces sin tener que importarlo en cada page.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isDevBypassEnabled } from "@/lib/dev/devBypass";

// Allowlist de entornos donde el chip puede existir: dev local o Vercel
// preview explícito. Cualquier otro build de producción (incluida producción
// real, o preview sin NEXT_PUBLIC_VERCEL_ENV expuesto) queda fuera.
const IS_DEV_SURFACE =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";

export function DevReturnButton() {
  const pathname = usePathname();

  // Guard duro de entorno primero; después la flag; y ocultar en /dev mismo.
  if (!IS_DEV_SURFACE || !isDevBypassEnabled() || pathname === "/dev") {
    return null;
  }

  return (
    <Link
      href="/dev"
      className="simulador-root fixed bottom-4 right-4 z-50 inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface)]/95 px-3 py-2 text-[length:var(--text-footnote)] font-medium text-[var(--text-secondary)] shadow-md backdrop-blur-sm transition-[transform,background-color,color,box-shadow] duration-[var(--motion-fast)] ease-[var(--motion-ease)] hover:-translate-y-0.5 hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] active:scale-[0.98]"
      aria-label="Back to dev"
    >
      <span aria-hidden>←</span>
      <span>Back to dev</span>
    </Link>
  );
}
