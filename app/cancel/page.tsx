/**
 * /cancel — landing post-Stripe Checkout cuando el usuario abandona el flujo.
 *
 * Mensaje neutral (no es error): nada se cobró, retomar cuando quiera.
 * Estilo Apple/HIG, hermana visual de /success.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { AuthNav } from "@/components/simulador/AuthNav";
import "../(app)/simulador.css";

export const metadata: Metadata = {
  title: "Pago cancelado · Itera",
  robots: { index: false, follow: false },
};

export default function CancelPage() {
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
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="display display-tight mt-7 text-[var(--text-primary)] text-[28px] sm:text-[32px]">
            Pago cancelado
          </h1>
          <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-[1.55]">
            No se cobró nada. Puedes reintentar cuando estés listo.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/onboarding/billing"
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] accent-bg px-6 text-[15px] font-medium text-white hover:opacity-95 transition-opacity"
            >
              Reintentar el pago
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center text-[14px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Ir al inicio
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
