import Link from "next/link";
import type { ReactNode } from "react";
import { SurfaceNav } from "@/components/simulador/SurfaceNav";
import { onboardingCopy } from "@/lib/simulador/copy/onboarding";
import {
  findSimuladorSubscriptionByCheckoutSession,
  syncSimuladorPaymentFromSession,
} from "@/lib/stripe/simuladorBilling";
import { ClearOnboardingStorage } from "./ClearOnboardingStorage";

interface DonePageProps {
  searchParams: Promise<{ session_id?: string }>;
}

function CtaLink({
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
      ? "accent-bg inline-flex h-12 items-center justify-center rounded-full px-7 text-[15px] font-medium text-white"
      : "inline-flex h-12 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-7 text-[15px] font-medium text-[var(--text-primary)]";

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
      <SurfaceNav />
      {isSynced && <ClearOnboardingStorage />}
      <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-6 py-12">
        <section className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="eyebrow mb-4">
              {isSynced
                ? `Paso 5 de 5 · ${copy.eyebrow_context}`
                : isPaymentPending
                  ? returnCopy.success_eyebrow
                  : returnCopy.failed_eyebrow}
            </div>
            <h1 className="display display-tight text-[32px] text-[var(--text-primary)] sm:text-[42px]">
              {isSynced
                ? copy.headline
                : isPaymentPending
                  ? returnCopy.success_headline
                  : returnCopy.failed_headline}
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-[1.55] text-[var(--text-secondary)]">
              {isSynced
                ? copy.body
                : isPaymentPending
                  ? returnCopy.success_body
                  : returnCopy.failed_body}
            </p>

            {isSynced ? (
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {copy.next_steps.map((step, index) => (
                  <div key={step} className="card-apple bg-[var(--surface)] p-5">
                    <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[14px] font-semibold text-[var(--accent)]">
                      {index + 1}
                    </div>
                    <p className="text-[14px] leading-[1.55] text-[var(--text-secondary)]">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-2xl bg-[var(--surface-3)] p-5 text-[14px] leading-[1.55] text-[var(--text-secondary)]">
                {isPaymentPending
                  ? returnCopy.success_polling_note
                  : "Si el cobro sí aparece en Stripe, no repitas el pago; escríbenos y lo reconciliamos."}
              </div>
            )}

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              {isSynced ? (
                <CtaLink href="/dashboard">{copy.dashboard_cta}</CtaLink>
              ) : isPaymentPending && sessionId ? (
                <CtaLink href={`/onboarding/done?session_id=${sessionId}`}>
                  Volver a verificar
                </CtaLink>
              ) : (
                <>
                  <CtaLink href="/onboarding/billing">
                    {returnCopy.failed_retry_cta}
                  </CtaLink>
                  <CtaLink href="mailto:ventas@itera.la" variant="secondary">
                    {returnCopy.failed_contact_cta}
                  </CtaLink>
                </>
              )}
            </div>
          </div>

          <aside className="card-apple h-fit bg-[var(--surface)] p-6">
            <div className="eyebrow mb-3">{copy.timing_eyebrow}</div>
            <p className="text-[14px] leading-[1.55] text-[var(--text-secondary)]">
              {copy.timing_body}
            </p>
            <div className="mt-6 rounded-2xl bg-[var(--surface-3)] p-4">
              <div className="eyebrow mb-2">{copy.contact_help_eyebrow}</div>
              <p className="text-[13px] leading-[1.5] text-[var(--text-secondary)]">
                {copy.contact_help_body}
              </p>
            </div>
            {sessionId && (
              <p className="mt-5 break-all text-[12px] leading-[1.5] text-[var(--text-tertiary)]">
                Stripe session: {sessionId}
              </p>
            )}
          </aside>
        </section>
      </main>
    </>
  );
}
