"use client";

/**
 * /onboarding/billing — paso 4 del flow buyer B2B.
 *
 * Single product (Sprint Itera) con tier automático según seats.
 * Layout 1-column Apple HIG: question → stepper → tier badge →
 * breakdown → features → CTA grande. Sin sidebar derecho.
 *
 * Enterprise (100+ personas) corta el self-serve y redirige a ventas.
 */

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { SurfaceNav } from "@/components/simulador/SurfaceNav";
import {
  computeSimuladorAmount,
  formatUsd,
  SIMULADOR_PRODUCT,
} from "@/lib/simulador/billing";
import { onboardingCopy } from "@/lib/simulador/copy/onboarding";

export default function OnboardingBillingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingBillingContent />
    </Suspense>
  );
}

function OnboardingBillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState("");
  const [seats, setSeats] = useState<number>(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("canceled") ? "Checkout cancelado. No se cobró nada." : null,
  );

  useEffect(() => {
    const oid = sessionStorage.getItem("onboarding_org_id");
    const tid = sessionStorage.getItem("onboarding_team_id");
    const tn = sessionStorage.getItem("onboarding_team_name");
    if (!oid || !tid) {
      router.push("/onboarding/org");
      return;
    }
    setOrgId(oid);
    setTeamId(tid);
    setTeamName(tn ?? "");
  }, [router]);

  const computed = useMemo(() => computeSimuladorAmount(seats), [seats]);
  const copy = onboardingCopy.step4_billing;
  const tierRange =
    computed.tier.maxSeats === null
      ? `${computed.tier.minSeats}+ personas`
      : `${computed.tier.minSeats}–${computed.tier.maxSeats} personas`;

  function adjustSeats(delta: number) {
    setSeats((prev) => {
      const next = prev + delta;
      // Stepper UI: permite ir a 100+ visualmente pero el CTA cambia a
      // "Hablar con ventas" en ese rango.
      return Math.max(SIMULADOR_PRODUCT.minSeats, Math.min(150, next));
    });
  }

  async function onCheckout() {
    if (!orgId || !teamId) return;
    if (computed.isEnterprise) return; // CTA queda como mailto
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing_product: "simulador_b2b",
          organization_id: orgId,
          team_id: teamId,
          seats: computed.seats,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.sessionUrl) {
        throw new Error(data.error ?? copy.error_create_session);
      }
      window.location.href = data.sessionUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.error_stripe_redirect);
      setSubmitting(false);
    }
  }

  if (!orgId || !teamId) return null;

  return (
    <>
      <SurfaceNav />
      <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto w-full max-w-[560px]"
        >
          <div className="eyebrow mb-4">Paso 4 de 5</div>
          <h1 className="display display-tight text-[var(--text-primary)] text-[32px] sm:text-[40px]">
            {copy.headline}
          </h1>

          {/* ============ STEPPER ============ */}
          <section className="mt-12">
            <h2 className="text-[15px] font-medium text-[var(--text-primary)]">
              {copy.seats_question}
            </h2>
            <p className="mt-1 text-[13px] text-[var(--text-tertiary)]">
              {copy.seats_help}
            </p>

            <div className="mt-5 inline-flex items-stretch rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface)]">
              <button
                type="button"
                onClick={() => adjustSeats(-1)}
                disabled={seats <= SIMULADOR_PRODUCT.minSeats}
                aria-label="Quitar una persona"
                className="flex h-14 w-14 items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <div className="flex h-14 min-w-[120px] flex-col items-center justify-center border-x border-[var(--hairline)] px-4">
                <span className="text-[24px] font-semibold tabular-nums tracking-tight text-[var(--text-primary)] leading-none">
                  {seats}
                </span>
                <span className="mt-1 text-[11px] text-[var(--text-tertiary)]">
                  {seats === 1 ? "persona" : "personas"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => adjustSeats(1)}
                aria-label="Añadir una persona"
                className="flex h-14 w-14 items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          </section>

          {/* ============ TIER + BREAKDOWN ============ */}
          <section className="mt-12 rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-6">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--accent)]">
                {computed.tier.label}
              </span>
              <span className="text-[12px] text-[var(--text-tertiary)]">
                {tierRange}
              </span>
            </div>

            {computed.isEnterprise ? (
              // ============ ENTERPRISE: no precio, redirect a ventas ============
              <>
                <h3 className="mt-4 text-[20px] font-semibold tracking-tight text-[var(--text-primary)]">
                  {copy.enterprise_headline}
                </h3>
                <p className="mt-2 text-[14px] leading-[1.55] text-[var(--text-secondary)]">
                  {copy.enterprise_body}
                </p>
              </>
            ) : (
              // ============ SELF-SERVE: precio dinámico ============
              <>
                <p className="mt-4 text-[13px] text-[var(--text-secondary)]">
                  {copy.pricing_breakdown_template(
                    computed.pricePerSeatUsd,
                    computed.seats,
                    computed.amountUsd,
                  )}
                </p>
                <div className="mt-4 flex items-baseline justify-between border-t border-[var(--hairline)] pt-4">
                  <span className="text-[14px] text-[var(--text-secondary)]">
                    Total
                  </span>
                  <span className="text-[28px] font-semibold tracking-tight text-[var(--text-primary)] tabular-nums">
                    {formatUsd(computed.amountUsd)}
                  </span>
                </div>
              </>
            )}

            <ul className="mt-6 space-y-2 border-t border-[var(--hairline)] pt-5">
              {SIMULADOR_PRODUCT.features.map((feature) => (
                <li
                  key={feature}
                  className="flex gap-3 text-[13px] leading-[1.5] text-[var(--text-secondary)]"
                >
                  <svg
                    className="mt-1 h-3 w-3 flex-none text-[var(--accent)]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ============ ERROR + CTA ============ */}
          {error && (
            <div className="mt-6 rounded-[var(--radius-md)] bg-[var(--band-b-bg)] px-4 py-3 text-[13px] text-[var(--band-b-text)]">
              {error}
            </div>
          )}

          <div className="mt-8">
            {computed.isEnterprise ? (
              <a
                href={`mailto:${SIMULADOR_PRODUCT.salesEmail}?subject=Itera%20%C2%B7%20${computed.seats}%20personas`}
                className="inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-md)] accent-bg text-[15px] font-medium text-white hover:opacity-95 transition-opacity"
              >
                {copy.submit_enterprise_cta}
              </a>
            ) : (
              <Button
                onPress={onCheckout}
                isLoading={submitting}
                isDisabled={submitting}
                radius="md"
                size="lg"
                className="accent-bg h-12 w-full text-[15px] font-medium text-white shadow-none"
              >
                {copy.submit_cta}
              </Button>
            )}
            <p className="mt-3 text-center text-[12px] leading-[1.55] text-[var(--text-tertiary)]">
              {copy.terms_required}{" "}
              <Link href="/terms" className="underline hover:opacity-70 transition-opacity">
                términos
              </Link>{" "}
              ·{" "}
              <Link href="/privacy" className="underline hover:opacity-70 transition-opacity">
                privacidad
              </Link>
            </p>
          </div>

          {/* ============ SKIP ============ */}
          <div className="mt-10 border-t border-[var(--hairline)] pt-6 text-center">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="text-[14px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {copy.skip_cta} →
            </button>
            {teamName && (
              <p className="mt-2 text-[12px] text-[var(--text-tertiary)]">
                Tu equipo {teamName} ya está creado. Puedes invitar y pagar después.
              </p>
            )}
          </div>
        </motion.div>
      </main>
    </>
  );
}
