"use client";

/**
 * Botón flotante chico en la esquina bottom-right que vuelve al hub /dev.
 * Visible en:
 *   - npm run dev local (NODE_ENV=development)
 *   - Vercel preview deploys (NEXT_PUBLIC_VERCEL_ENV=preview)
 * Oculto en producción real (Vercel production o stand-alone production).
 *
 * Además requiere cookie `itera_dev_bypass=1` activa.
 *
 * Se monta globalmente en app/layout.tsx para estar disponible en todas
 * las surfaces sin tener que importarlo en cada page.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isDevBypassEnabled } from "@/lib/dev/devBypass";

export function DevReturnButton() {
  const pathname = usePathname();

  // Hide on /dev itself (we're already there)
  if (!isDevBypassEnabled() || pathname === "/dev") return null;

  return (
    <Link
      href="/dev"
      className="simulador-root fixed bottom-4 right-4 z-50 inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface)]/95 px-3 py-2 text-[length:var(--text-footnote)] font-medium text-[var(--text-secondary)] shadow-[var(--shadow-md)] backdrop-blur-sm transition-[transform,background-color,color,box-shadow] duration-[var(--motion-fast)] ease-[var(--motion-ease)] hover:-translate-y-0.5 hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] hover:shadow-[var(--shadow-lg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] active:scale-[0.98]"
      aria-label="Regresar a dev"
    >
      <span aria-hidden>←</span>
      <span>Regresar a dev</span>
    </Link>
  );
}
