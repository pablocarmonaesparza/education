/**
 * /onboarding/done — paso 5 del flow buyer B2B.
 *
 * Landing post-Stripe Checkout. Server component que verifica el
 * session_id contra Stripe y resuelve uno de 3 estados:
 *
 *   1. OK confirmado    → "Sprint activado" + next_steps + dashboard
 *   2. Payment pending  → spinner + "estamos procesando"
 *   3. Falló/canceló    → ícono error + "reintenta o escríbenos"
 *
 * Layout estilo Apple/HIG: 1 columna centrada, icon circle 64px con
 * color del estado, H1 display-tight sin punto, CTAs con --radius-md.
 * Sin sidebar derecha (era legacy del DS Itera Courses).
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { OnboardingNav } from "@/components/simulador/OnboardingNav";
import { onboardingCopy } from "@/lib/simulador/copy/onboarding";
import {
  findSimuladorSubscriptionByCheckoutSession,
  syncSimuladorPaymentFromSession,
} from "@/lib/stripe/simuladorBilling";
import { ClearOnboardingStorage } from "./ClearOnboardingStorage";

interface DonePageProps {
  searchParams: Promise<{ session_id?: string }>;
}

function Cta({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  const className =
    variant === "primary"
      ? "inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-md)] accent-bg px-6 text-[15px] font-medium text-white hover:opacity-95 transition-opacity"
      : "inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface)] px-6 text-[15px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors";
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default async function OnboardingDonePage({ searchParams }: DonePageProps) {
  const { session_id: sessionId } = await searchParams;
  const copy = onboardingCopy.step5_done;
  const returnCopy = onboardingCopy.return_from_stripe;

  const sync = sessionId
    ? await findSimuladorSubscriptionByCheckoutSession(sessionId).then((existing) =>
        existing.ok ? existing : syncSimuladorPaymentFromSession(sessionId),
      )
    : { ok: false as const, reason: "missing_session_id" };

  const isPaymentPending = !sync.ok && sync.reason === "payment_pending";
  const isSynced = sync.ok;

  return (
    <>
      <OnboardingNav />
      {isSynced && <ClearOnboardingStorage />}

      {/* ============ PAGO CONFIRMADO ============ */}
      {isSynced && (
        <main className="surface-canvas min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6 py-12">
          <div className="max-w-[560px] w-full text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-[var(--band-a-bg)] grid place-items-center">
              <svg
                className="h-7 w-7 text-[var(--band-a-text)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="display display-tight mt-7 text-[var(--text-primary)] text-[28px] sm:text-[32px]">
              Sprint activado
            </h1>
            <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-[1.55]">
              {copy.body}
            </p>

            <ul className="mt-8 space-y-3 text-left">
              {copy.next_steps.map((step, index) => (
                <li
                  key={step}
                  className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface)] px-4 py-3"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[var(--accent-soft)] text-[12px] font-semibold text-[var(--accent)]">
                    {index + 1}
                  </span>
                  <p className="text-[13.5px] leading-[1.55] text-[var(--text-secondary)]">
                    {step}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Cta href="/dashboard">{copy.dashboard_cta}</Cta>
            </div>
          </div>
        </main>
      )}

      {/* ============ PAYMENT PENDING ============ */}
      {!isSynced && isPaymentPending && (
        <main className="surface-canvas min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6 py-12">
          <div className="max-w-[440px] w-full text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-[var(--accent-soft)] grid place-items-center">
              <svg
                className="h-7 w-7 text-[var(--accent)] animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
                <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="display display-tight mt-7 text-[var(--text-primary)] text-[28px] sm:text-[32px]">
              {returnCopy.success_headline.replace(/\.$/, "")}
            </h1>
            <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-[1.55]">
              {returnCopy.success_body}
            </p>
            <p className="mt-2 text-[13.5px] text-[var(--text-tertiary)]">
              {returnCopy.success_polling_note}
            </p>
            {sessionId && (
              <div className="mt-8">
                <Cta href={`/onboarding/done?session_id=${sessionId}`}>
                  Volver a verificar
                </Cta>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ============ FAILED / CANCELED ============ */}
      {!isSynced && !isPaymentPending && (
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
              Pago no procesado
            </h1>
            <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-[1.55]">
              Stripe canceló o rechazó el cobro. No se generó ningún cargo. Puedes reintentar con otro método.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <Cta href="/onboarding/billing">{returnCopy.failed_retry_cta}</Cta>
              <Cta href="mailto:ventas@itera.la" variant="secondary">
                Escribir a ventas
              </Cta>
            </div>
          </div>
        </main>
      )}
    </>
  );
}
