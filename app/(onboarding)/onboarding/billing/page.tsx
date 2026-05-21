"use client";

/**
 * /onboarding/billing — paso 4 del flow buyer B2B.
 *
 * Layout 1-columna sin scroll vertical:
 *   - Stepper + input editable de seats (acepta tipeo directo)
 *   - Carrusel horizontal de los 4 tiers (Team/Business/Business+/Enterprise)
 *     El tier que aplica a `seats` se centra y crece; los otros quedan a
 *     los lados en gris, peek visual del 30%. Motivacional: el user ve
 *     visualmente el descuento por volumen.
 *   - CTA grande "Continuar a Stripe" debajo del carrusel.
 *
 * Enterprise (100+) corta el self-serve y abre mailto a ventas.
 */

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { SurfaceNav } from "@/components/simulador/SurfaceNav";
import {
  computeSimuladorAmount,
  formatUsd,
  SIMULADOR_PRODUCT,
  SIMULADOR_TIERS,
  YEARLY_DISCOUNT_PCT,
  type BillingInterval,
  type SimuladorTier,
} from "@/lib/simulador/billing";
import { onboardingCopy } from "@/lib/simulador/copy/onboarding";

const CARD_WIDTH = 320; // px, debe matchear className w-[320px] abajo
const CARD_GAP = 16; // mx-2 = 8px each side
const CARD_STRIDE = CARD_WIDTH + CARD_GAP;

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
  const [interval, setInterval] = useState<BillingInterval>("yearly");
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

  const computed = useMemo(
    () => computeSimuladorAmount(seats, interval),
    [seats, interval],
  );
  const copy = onboardingCopy.step4_billing;
  const activeTierIndex = SIMULADOR_TIERS.findIndex((t) => t.id === computed.tier.id);

  function setSeatsClamped(n: number) {
    if (!Number.isFinite(n)) return;
    const clamped = Math.max(
      SIMULADOR_PRODUCT.minSeats,
      Math.min(150, Math.trunc(n)),
    );
    setSeats(clamped);
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
          interval: computed.interval,
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
      <main className="surface-canvas h-[calc(100vh-3.5rem)] overflow-x-hidden overflow-y-hidden flex flex-col">
        {/* ============ HEADER + STEPPER (max-w container) ============ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto w-full max-w-[720px] px-6 pt-8 sm:pt-10"
        >
          <div>
            <div className="eyebrow mb-2">Paso 4 de 5</div>
            <h1 className="display display-tight text-[var(--text-primary)] text-[28px] sm:text-[32px]">
              {copy.headline}
            </h1>
          </div>

          <section className="mt-7 flex flex-col items-center text-center">
            <h2 className="text-[14px] font-medium text-[var(--text-primary)]">
              {copy.seats_question}
            </h2>

            <div className="mt-4 inline-flex items-stretch rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface)]">
              <button
                type="button"
                onClick={() => setSeatsClamped(seats - 1)}
                disabled={seats <= SIMULADOR_PRODUCT.minSeats}
                aria-label="Quitar una persona"
                className="flex h-12 w-12 items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <input
                type="number"
                inputMode="numeric"
                min={SIMULADOR_PRODUCT.minSeats}
                max={150}
                value={seats}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    setSeats(SIMULADOR_PRODUCT.minSeats);
                    return;
                  }
                  setSeatsClamped(Number(raw));
                }}
                onBlur={(e) => {
                  if (e.target.value === "") setSeats(SIMULADOR_PRODUCT.minSeats);
                }}
                aria-label="Número de personas"
                className="h-12 w-16 border-x border-[var(--hairline)] bg-transparent text-center text-[18px] font-semibold tabular-nums tracking-tight text-[var(--text-primary)] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => setSeatsClamped(seats + 1)}
                aria-label="Añadir una persona"
                className="flex h-12 w-12 items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-[11px] text-[var(--text-tertiary)]">
              {seats === 1 ? "1 persona" : `${seats} personas`} · escribe o usa los botones
            </p>

            {/* ============ TOGGLE Mensual / Anual ============ */}
            <div
              role="radiogroup"
              aria-label="Facturación"
              className="mt-5 inline-flex items-center rounded-full border border-[var(--hairline)] bg-[var(--surface)] p-1 text-[13px]"
            >
              <button
                type="button"
                role="radio"
                aria-checked={interval === "monthly"}
                onClick={() => setInterval("monthly")}
                className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
                  interval === "monthly"
                    ? "bg-[var(--text-primary)] text-[var(--surface)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Mensual
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={interval === "yearly"}
                onClick={() => setInterval("yearly")}
                className={`relative rounded-full px-4 py-1.5 font-medium transition-colors ${
                  interval === "yearly"
                    ? "bg-[var(--text-primary)] text-[var(--surface)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Anual
                <span
                  className={`ml-1.5 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    interval === "yearly"
                      ? "bg-[var(--surface)] text-[var(--accent)]"
                      : "bg-[var(--accent-soft)] text-[var(--accent)]"
                  }`}
                >
                  −{YEARLY_DISCOUNT_PCT}%
                </span>
              </button>
            </div>
          </section>
        </motion.div>

        {/* ============ CARRUSEL DE TIERS (full viewport width) ============
            Sale del max-w-[720px] del header/footer. El único clip horizontal
            es <main> con overflow-x-hidden (= ancho del viewport). Las cards
            adjacent se ven enteras dentro de ese ancho. */}
        <section
          className="relative mt-6 flex-none w-full"
          style={{ height: 300 }}
        >
          <motion.div
            className="absolute top-0 bottom-0 flex items-center"
            animate={{ x: -activeTierIndex * CARD_STRIDE }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            style={{ left: `calc(50% - ${CARD_WIDTH / 2}px)` }}
          >
            {SIMULADOR_TIERS.map((tier, i) => {
              const isActive = i === activeTierIndex;
              // Wrapper: layout box fijo 320px + gap fijo → spacing equidistante.
              // El scale + opacity se aplica al hijo interno para que el footprint
              // visual cambie SIN alterar el layout. Antes el scale iba en el
              // wrapper → la card scaleada conservaba su layout box de 320px
              // pero su visible footprint era 275px, creando "aire" desigual
              // entre activa-inactiva (22.4px) vs inactiva-inactiva (44.8px).
              return (
                <div
                  key={tier.id}
                  style={{ width: CARD_WIDTH, marginLeft: 8, marginRight: 8 }}
                  className="flex-none flex items-center justify-center"
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1 : 0.86,
                      opacity: isActive ? 1 : 0.4,
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                    style={{ width: CARD_WIDTH }}
                  >
                    <TierCard
                      tier={tier}
                      seats={computed.seats}
                      isActive={isActive}
                      interval={computed.interval}
                      periodTotal={computed.periodTotalUsd}
                      savingsUsd={computed.savingsUsd}
                      pricePerSeat={computed.pricePerSeatUsd}
                    />
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </section>

        {/* ============ ERROR + CTA + FOOTER (max-w container) ============ */}
        <div className="mx-auto w-full max-w-[720px] px-6 pb-6 mt-auto">
          {error && (
            <div className="mb-4 rounded-[var(--radius-md)] bg-[var(--band-b-bg)] px-4 py-2.5 text-[12px] text-[var(--band-b-text)] text-center">
              {error}
            </div>
          )}

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
          <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-[var(--text-tertiary)]">
            <Link href="/terms" className="underline hover:opacity-70 transition-opacity">
              términos
            </Link>
            <span>·</span>
            <Link href="/privacy" className="underline hover:opacity-70 transition-opacity">
              privacidad
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

// ============================================================================
// TierCard — card individual del carrusel.
// Cuando es activa muestra el cálculo real (precio × seats = total).
// Cuando es inactiva muestra solo el price/seat como teaser para que el user
// vea visualmente que si llega a ese rango, baja el precio por persona.
// ============================================================================

function TierCard({
  tier,
  seats,
  isActive,
  interval,
  periodTotal,
  savingsUsd,
  pricePerSeat,
}: {
  tier: SimuladorTier;
  seats: number;
  isActive: boolean;
  interval: BillingInterval;
  periodTotal: number;
  savingsUsd: number;
  pricePerSeat: number;
}) {
  const range =
    tier.maxSeats === null
      ? `${tier.minSeats}+ personas`
      : `${tier.minSeats}–${tier.maxSeats} personas`;
  const periodLabel = interval === "yearly" ? "/año" : "/mes";
  const perSeatPeriodLabel = interval === "yearly" ? "al año" : "al mes";

  return (
    <div
      className={`h-[284px] rounded-[var(--radius-lg)] border p-5 transition-all bg-[var(--surface)] ${
        isActive
          ? "border-[var(--accent)] shadow-[0_8px_24px_var(--shadow)]"
          : "border-[var(--hairline)]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
            isActive
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--surface-2)] text-[var(--text-secondary)]"
          }`}
        >
          {tier.label}
        </span>
        <span className="text-[11px] text-[var(--text-tertiary)]">{range}</span>
      </div>

      {tier.selfServe ? (
        <>
          <div className="mt-5">
            <div className="text-[34px] font-semibold tracking-tight text-[var(--text-primary)] leading-none tabular-nums">
              {formatUsd(tier.pricePerSeatUsd)}
            </div>
            <div className="mt-1 text-[12px] text-[var(--text-tertiary)]">
              por persona / mes
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isActive && (
              <motion.div
                key={`active-breakdown-${interval}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mt-5 border-t border-[var(--hairline)] pt-4"
              >
                <div className="flex items-baseline justify-between text-[12px] text-[var(--text-secondary)]">
                  <span>
                    {pricePerSeat} × {seats} {perSeatPeriodLabel}
                  </span>
                  <span className="text-[18px] font-semibold tracking-tight text-[var(--text-primary)] tabular-nums">
                    {formatUsd(periodTotal)}
                    <span className="ml-0.5 text-[11px] font-normal text-[var(--text-tertiary)]">
                      {periodLabel}
                    </span>
                  </span>
                </div>
                {interval === "yearly" && savingsUsd > 0 && (
                  <div className="mt-2 rounded-md bg-[var(--accent-soft)] px-2 py-1 text-[11px] text-[var(--accent)]">
                    Ahorras {formatUsd(savingsUsd)} al año · 2 meses gratis
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <>
          <div className="mt-5">
            <div className="text-[28px] font-semibold tracking-tight text-[var(--text-primary)] leading-tight">
              Negociable
            </div>
            <div className="mt-1 text-[12px] text-[var(--text-tertiary)]">
              desde USD {tier.pricePerSeatUsd}/persona/mes
            </div>
          </div>
          {isActive && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-5 border-t border-[var(--hairline)] pt-4 text-[12px] leading-[1.5] text-[var(--text-secondary)]"
            >
              Para equipos grandes ajustamos por volumen y término. Cuéntanos cuántas personas son.
            </motion.p>
          )}
        </>
      )}
    </div>
  );
}
