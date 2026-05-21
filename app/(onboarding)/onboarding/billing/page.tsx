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
      <main className="surface-canvas h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto w-full max-w-[720px] px-6 pt-8 sm:pt-10 flex-1 flex flex-col"
        >
          {/* ============ HEADER ============ */}
          <div>
            <div className="eyebrow mb-2">Paso 4 de 5</div>
            <h1 className="display display-tight text-[var(--text-primary)] text-[28px] sm:text-[32px]">
              {copy.headline}
            </h1>
          </div>

          {/* ============ STEPPER + INPUT ============ */}
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
                  // Si quedó vacío después de borrar, restablecer al mínimo.
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
          </section>

          {/* ============ CARRUSEL DE TIERS ============ */}
          <section className="mt-6 relative overflow-hidden" style={{ height: 280 }}>
            <motion.div
              className="absolute top-0 bottom-0 flex items-center"
              animate={{
                x: -activeTierIndex * CARD_STRIDE,
              }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              style={{
                left: `calc(50% - ${CARD_WIDTH / 2}px)`,
              }}
            >
              {SIMULADOR_TIERS.map((tier, i) => {
                const isActive = i === activeTierIndex;
                return (
                  <motion.div
                    key={tier.id}
                    animate={{
                      scale: isActive ? 1 : 0.86,
                      opacity: isActive ? 1 : 0.42,
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                    style={{ width: CARD_WIDTH, marginLeft: 8, marginRight: 8 }}
                    className="flex-none"
                  >
                    <TierCard
                      tier={tier}
                      seats={computed.seats}
                      isActive={isActive}
                      total={computed.amountUsd}
                      pricePerSeat={computed.pricePerSeatUsd}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </section>

          {/* ============ ERROR + CTA + SKIP ============ */}
          <div className="mt-auto pb-6 pt-4">
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
              <span>·</span>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="underline hover:text-[var(--text-primary)] transition-colors"
              >
                continuar sin pagar
              </button>
            </div>
          </div>
        </motion.div>
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
  total,
  pricePerSeat,
}: {
  tier: SimuladorTier;
  seats: number;
  isActive: boolean;
  total: number;
  pricePerSeat: number;
}) {
  const range =
    tier.maxSeats === null
      ? `${tier.minSeats}+ personas`
      : `${tier.minSeats}–${tier.maxSeats} personas`;

  return (
    <div
      className={`h-[268px] rounded-[var(--radius-lg)] border p-5 transition-colors ${
        isActive
          ? "border-[var(--accent)]/30 bg-[var(--accent-soft)]"
          : "border-[var(--hairline)] bg-[var(--surface)]"
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
            <div className="mt-1 text-[12px] text-[var(--text-tertiary)]">por persona</div>
          </div>

          <AnimatePresence mode="wait">
            {isActive && (
              <motion.div
                key="active-breakdown"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mt-5 border-t border-[var(--accent)]/20 pt-4"
              >
                <div className="flex items-baseline justify-between text-[12px] text-[var(--text-secondary)]">
                  <span>
                    {pricePerSeat} × {seats}
                  </span>
                  <span className="text-[18px] font-semibold tracking-tight text-[var(--text-primary)] tabular-nums">
                    {formatUsd(total)}
                  </span>
                </div>
                <div className="mt-3 space-y-1.5 text-[11px] leading-[1.5] text-[var(--text-secondary)]">
                  {SIMULADOR_PRODUCT.features.slice(0, 3).map((f) => (
                    <div key={f} className="flex gap-1.5">
                      <span className="text-[var(--accent)]">·</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
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
              desde USD {tier.pricePerSeatUsd}/persona
            </div>
          </div>
          {isActive && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-5 border-t border-[var(--accent)]/20 pt-4 text-[12px] leading-[1.5] text-[var(--text-secondary)]"
            >
              Para equipos grandes ajustamos por volumen y término. Cuéntanos cuántas personas son.
            </motion.p>
          )}
        </>
      )}
    </div>
  );
}
