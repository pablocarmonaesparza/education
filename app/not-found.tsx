/**
 * Global 404 page — Next.js fallback para cualquier ruta que no exista.
 * Estilo Apple/HIG: surface canvas + icon circle 64px + H1 sin punto + CTAs
 * con --radius-md. Hermana visual de /cancel, /success, /onboarding/done.
 *
 * Cubre también casos que antes mostraban el 404 default feo de Next.js:
 *   /auth/invitation/<token-no-existe>  → si el frontend cae al render del
 *                                          server (e.g. JS deshabilitado)
 *                                          aterriza aquí.
 *   /report/<session-no-existe>          → idem.
 *   /case/<case-id-no-existe>            → idem.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { AuthNav } from "@/components/simulador/AuthNav";
import "./(app)/simulador.css";

export const metadata: Metadata = {
  title: "Página no encontrada · Itera",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="simulador-root min-h-screen surface-canvas">
      <AuthNav mode="login" next="/" />
      <main className="surface-canvas min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6 py-12">
        <div className="max-w-[440px] w-full text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-[var(--surface-2)] border border-[var(--hairline)] grid place-items-center">
            <svg
              className="h-7 w-7 text-[var(--text-tertiary)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h1 className="display display-tight mt-7 text-[var(--text-primary)] text-[28px] sm:text-[32px]">
            No encontramos esta página
          </h1>
          <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-[1.55]">
            Quizás el enlace expiró o se movió. Si llegaste aquí desde un email
            de invitación, pídele a quien te invitó que reenvíe el link.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/"
              className="inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-md)] accent-bg px-6 text-[15px] font-medium text-white hover:opacity-95 transition-opacity"
            >
              Ir al inicio
            </Link>
            <Link
              href="mailto:soporte@itera.la"
              className="inline-flex h-11 w-full items-center justify-center text-[14px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Escribir a soporte
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
