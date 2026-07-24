"use client";

/**
 * /onboarding/billing — paso 4 del flow buyer B2B (5 pasos).
 *
 * Layout 1-columna compacto:
 *   - Stepper + input editable de seats (acepta tipeo directo)
 *   - Carrusel horizontal de los 4 tiers (Team/Business/Business+/Enterprise)
 *     El tier que aplica a `seats` se centra y crece; los otros quedan a
 *     los lados en gris, peek visual del 30%. Motivacional: el user ve
 *     visualmente el descuento por volumen.
 *   - CTA compacto "Continuar a Stripe" debajo del carrusel.
 *
 * Enterprise (100+) corta el self-serve y abre mailto a ventas.
 */

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { OnboardingNav } from "@/components/simulador/OnboardingNav";
import { AppleSlideButton } from "@/components/simulador/apple";
import {
  ONBOARDING_ORG_ID_KEY,
  ONBOARDING_TEAM_ID_KEY,
} from "@/lib/simulador/onboarding-progress";
import {
  computeSimuladorAmount,
  formatUsd,
  SIMULADOR_PRODUCT,
  SIMULADOR_TIERS,
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
  // seatsInput es el string que el <input> muestra. Puede quedar vacío
  // temporalmente mientras el user borra para escribir un número nuevo.
  // `seats` se deriva de él (con clamp). Esta separación evita el bug
  // "no me deja borrar el 1": si seats es number controlled, al borrar
  // todo el input se restablece inmediatamente.
  const [seatsInput, setSeatsInput] = useState<string>("20");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("canceled") ? "Checkout canceled. You weren't charged." : null,
  );

  useEffect(() => {
    const oid = sessionStorage.getItem(ONBOARDING_ORG_ID_KEY);
    const tid = sessionStorage.getItem(ONBOARDING_TEAM_ID_KEY);
    if (!oid || !tid) {
      router.push("/onboarding/org");
      return;
    }
    setOrgId(oid);
    setTeamId(tid);
  }, [router]);

  // Derivar el `seats` number desde el string visible. Si el string está
  // vacío o no es número, caemos al mínimo (1) — el precio sigue calculando,
  // pero el input visualmente queda vacío hasta que el user escribe.
  const seats = useMemo(() => {
    const n = parseInt(seatsInput, 10);
    if (!Number.isFinite(n) || n < SIMULADOR_PRODUCT.minSeats) {
      return SIMULADOR_PRODUCT.minSeats;
    }
    return Math.min(150, n);
  }, [seatsInput]);

  const computed = useMemo(() => computeSimuladorAmount(seats), [seats]);
  const copy = onboardingCopy.step4_billing;
  const activeTierIndex = SIMULADOR_TIERS.findIndex((t) => t.id === computed.tier.id);

  function adjustSeats(delta: number) {
    const next = Math.max(
      SIMULADOR_PRODUCT.minSeats,
      Math.min(150, seats + delta),
    );
    setSeatsInput(String(next));
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
      <OnboardingNav
        progress={{
          total: 5,
          current: 3,
          ariaLabel: "Step 4 of 5",
        }}
      />
      <main className="surface-canvas h-[calc(100vh-5rem)] overflow-x-hidden overflow-y-auto flex flex-col">
        <div className="flex min-h-full w-full flex-col items-center justify-center py-6 sm:py-8">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex w-full max-w-[720px] flex-col items-center px-6 text-center"
          >
            <h1 className="display display-tight text-[var(--text-primary)] ts-title-1 sm:ts-display">
              {copy.headline}
            </h1>

            {/* ============ STEPPER + INPUT EDITABLE ============ */}
            <div className="mt-5 inline-flex items-stretch rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface)]">
              <button
                type="button"
                onClick={() => adjustSeats(-1)}
                disabled={seats <= SIMULADOR_PRODUCT.minSeats}
                aria-label="Remove one person"
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
                value={seatsInput}
                onChange={(e) => setSeatsInput(e.target.value)}
                onBlur={(e) => {
                  // Al salir, si quedó vacío o inválido, restablecer al mínimo
                  // visible. Sin esto el input mostraría "" pero el state
                  // computado ya está en 1 (silently).
                  const n = parseInt(e.target.value, 10);
                  if (!Number.isFinite(n) || n < SIMULADOR_PRODUCT.minSeats) {
                    setSeatsInput(String(SIMULADOR_PRODUCT.minSeats));
                  } else if (n > 150) {
                    setSeatsInput("150");
                  }
                }}
                aria-label="Number of people"
                className="h-12 w-16 border-x border-[var(--hairline)] bg-transparent text-center ts-headline font-semibold tabular-nums tracking-tight text-[var(--text-primary)] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => adjustSeats(1)}
                aria-label="Add one person"
                className="flex h-12 w-12 items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          </motion.section>

          {/* ============ CARRUSEL DE TIERS (full viewport width) ============
              Sale del max-w-[720px] del stepper/CTA. El único clip horizontal
              es <main> con overflow-x-hidden (= ancho del viewport). Las
              cards adjacent se ven enteras dentro de ese ancho. */}
          <section
            className="relative mt-7 flex-none w-full"
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
                // Sin scale → todas las cards tienen el mismo footprint visual.
                // La distinción activa/inactiva la dan: border accent, shadow y
                // opacity 1 vs 0.4. El spacing entre cards es perfectamente
                // equidistante (gap 16) en cualquier configuración.
                return (
                  <motion.div
                    key={tier.id}
                    animate={{ opacity: isActive ? 1 : 0.4 }}
                    transition={{ duration: 0.25 }}
                    style={{ width: CARD_WIDTH, marginLeft: 8, marginRight: 8 }}
                    className="flex-none"
                  >
                    <TierCard
                      tier={tier}
                      seats={computed.seats}
                      isActive={isActive}
                      monthlyTotal={computed.monthlyTotalUsd}
                      pricePerSeat={computed.pricePerSeatUsd}
                      onSelect={() => setSeatsInput(String(tier.minSeats))}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </section>

          {/* ============ ERROR + CTA + FOOTER (max-w container) ============ */}
          <div className="mt-7 flex w-full max-w-[720px] flex-col items-center px-6">
            {error && (
              <div className="mb-4 w-full max-w-[420px] rounded-[var(--radius-md)] bg-[var(--band-b-bg)] px-4 py-2.5 text-center ts-footnote text-[var(--band-b-text)]">
                {error}
              </div>
            )}

            {computed.isEnterprise ? (
              <AppleSlideButton
                href={`mailto:${SIMULADOR_PRODUCT.salesEmail}?subject=Itera%20%C2%B7%20${computed.seats}%20people`}
                className="min-w-[220px] text-center"
              >
                {copy.submit_enterprise_cta}
              </AppleSlideButton>
            ) : (
              <AppleSlideButton
                onClick={onCheckout}
                isLoading={submitting}
                isDisabled={submitting}
                className="min-w-[220px] text-center"
              >
                {copy.submit_cta}
              </AppleSlideButton>
            )}
            <div className="mt-4 flex items-center justify-center gap-3 ts-caption-1 text-[var(--text-tertiary)]">
              <Link href="/terms" className="underline hover:opacity-70 transition-opacity">
                Terms
              </Link>
              <span>·</span>
              <Link href="/privacy" className="underline hover:opacity-70 transition-opacity">
                Privacy
              </Link>
            </div>
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
  monthlyTotal,
  pricePerSeat,
  onSelect,
}: {
  tier: SimuladorTier;
  seats: number;
  isActive: boolean;
  monthlyTotal: number;
  pricePerSeat: number;
  onSelect: () => void;
}) {
  const range =
    tier.maxSeats === null
      ? `${tier.minSeats}+ people`
      : `${tier.minSeats}–${tier.maxSeats} people`;
  // Enterprise no es self-serve: en lugar de "USD 89/persona" mostramos
  // "Negociable / desde USD 89". El resto del layout (header, divider,
  // features) es idéntico a los tiers self-serve para mantener simetría
  // visual entre las 4 cards del carrusel.
  const priceLabel = tier.selfServe
    ? formatUsd(tier.pricePerSeatUsd)
    : "Negotiable";
  const priceCaption = tier.selfServe
    ? "per person"
    : `from $${tier.pricePerSeatUsd} USD / person`;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Select ${tier.label} tier`}
      aria-pressed={isActive}
      className={`h-[280px] w-full text-left rounded-[var(--radius-lg)] border p-5 transition-all bg-[var(--surface)] flex flex-col cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
        isActive
          ? "border-[var(--accent)] shadow-[0_8px_24px_var(--shadow)]"
          : "border-[var(--hairline)] hover:border-[var(--border-strong)]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 ts-caption-1 font-medium ${
            isActive
              ? "bg-[var(--accent-strong)] text-white"
              : "bg-[var(--surface-2)] text-[var(--text-secondary)]"
          }`}
        >
          {tier.label}
        </span>
        <span className="ts-caption-1 text-[var(--text-tertiary)]">{range}</span>
      </div>

      <div className="mt-4">
        <div
          className={`font-semibold tracking-tight text-[var(--text-primary)] leading-none tabular-nums ${
            tier.selfServe ? "ts-title-1" : "ts-title-2"
          }`}
        >
          {priceLabel}
        </div>
        <div className="mt-1 ts-caption-1 text-[var(--text-tertiary)]">
          {priceCaption}
        </div>
      </div>

      {isActive && tier.selfServe ? (
        <motion.div
          key={`active-${seats}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-4 border-t border-[var(--hairline)] pt-3"
        >
          <div className="flex items-baseline justify-between ts-caption-1 text-[var(--text-secondary)]">
            <span>
              {pricePerSeat} × {seats}
            </span>
            <span className="ts-body font-semibold tracking-tight text-[var(--text-primary)] tabular-nums">
              {formatUsd(monthlyTotal)}
            </span>
          </div>
        </motion.div>
      ) : (
        <div className="mt-4 border-t border-[var(--hairline)] pt-3" />
      )}

      <ul className="mt-3 space-y-1.5 ts-caption-1 leading-[1.4] text-[var(--text-secondary)]">
        {SIMULADOR_PRODUCT.features.map((f) => (
          <li key={f} className="flex items-start gap-1.5">
            <svg
              className={`mt-[3px] h-2.5 w-2.5 flex-none ${
                isActive ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"
              }`}
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
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}
