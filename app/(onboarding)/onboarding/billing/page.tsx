"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Radio, RadioGroup } from "@heroui/react";
import { motion } from "framer-motion";
import { SurfaceNav } from "@/components/simulador/SurfaceNav";
import { AppleButton, AppleInput } from "@/components/simulador/apple";
import {
  computePlanAmountUsd,
  formatUsd,
  planIds,
  SIMULADOR_PLANS,
  type SimuladorBillingPlan,
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
  const [plan, setPlan] = useState<SimuladorBillingPlan>("diagnostico");
  const [seatsText, setSeatsText] = useState("5");
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
    () => computePlanAmountUsd(plan, Number(seatsText)),
    [plan, seatsText],
  );
  const copy = onboardingCopy.step4_billing;

  async function onCheckout() {
    if (!orgId || !teamId) return;
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
          plan,
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
          className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_360px]"
        >
          <section>
            <div className="eyebrow mb-4">Paso 4 de 5 · {copy.eyebrow_context}</div>
            <h1 className="display display-tight text-[var(--text-primary)] text-[32px] sm:text-[40px]">
              {copy.headline}
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] text-[var(--text-secondary)] leading-[1.55]">
              {copy.body}
            </p>

            <div className="mt-8 max-w-xs">
              <AppleInput
                label={copy.seats_label}
                type="number"
                min={computed.plan.minSeats}
                max={computed.plan.maxSeats}
                value={seatsText}
                onValueChange={setSeatsText}
                radius="lg"
                size="lg"
                description={copy.seats_help}
              />
            </div>

            <RadioGroup
              className="mt-8"
              value={plan}
              onValueChange={(value) => setPlan(value as SimuladorBillingPlan)}
              label={copy.plan_eyebrow}
            >
              <div className="grid gap-4 md:grid-cols-3">
                {planIds().map((id) => {
                  const item = SIMULADOR_PLANS[id];
                  const price = computePlanAmountUsd(id, seatsText);
                  return (
                    <label
                      key={id}
                      className={`card-apple cursor-pointer p-5 transition ${
                        plan === id
                          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                          : "bg-[var(--surface)]"
                      }`}
                    >
                      <Radio value={id} className="sr-only" />
                      <div className="text-[15px] font-semibold text-[var(--text-primary)]">
                        {item.label}
                      </div>
                      <div className="mt-2 text-[26px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                        {formatUsd(price.amountUsd)}
                      </div>
                      <p className="mt-3 min-h-[72px] text-[14px] leading-[1.5] text-[var(--text-secondary)]">
                        {item.description}
                      </p>
                      <ul className="mt-4 space-y-2 text-[13px] text-[var(--text-secondary)]">
                        {item.featureBullets.map((feature) => (
                          <li key={feature}>· {feature}</li>
                        ))}
                      </ul>
                    </label>
                  );
                })}
              </div>
            </RadioGroup>
          </section>

          <aside className="card-apple h-fit bg-[var(--surface)] p-6">
            <div className="eyebrow mb-3">{copy.payment_method_eyebrow}</div>
            <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
              {formatUsd(computed.amountUsd)}
            </h2>
            <p className="mt-2 text-[14px] text-[var(--text-secondary)]">
              {copy.pricing_total_template(computed.amountUsd, computed.seats)}
            </p>
            <p className="mt-1 text-[13px] text-[var(--text-tertiary)]">
              {copy.pricing_per_seat_template(
                Math.round(computed.amountUsd / computed.seats),
              )}
            </p>
            <div className="mt-5 rounded-2xl bg-[var(--surface-3)] p-4 text-[13px] leading-[1.5] text-[var(--text-secondary)]">
              {teamName ? `Equipo: ${teamName}. ` : ""}
              {copy.pricing_disclaimer}
            </div>
            {error && (
              <div className="mt-4 rounded-xl bg-[var(--band-b-bg)] px-3 py-2 text-[13px] text-[var(--band-b-text)]">
                {error}
              </div>
            )}
            <AppleButton
              onPress={onCheckout}
              isLoading={submitting}
              isDisabled={submitting}
              radius="full"
              size="lg"
              className="accent-bg mt-6 h-12 w-full px-7 text-[15px] font-medium text-white shadow-none"
            >
              {copy.submit_cta}
            </AppleButton>
            <AppleButton
              onPress={() => router.push("/dashboard")}
              tone="ghost"
              variant="light"
              radius="full"
              size="sm"
              className="mt-3 w-full text-[var(--text-secondary)]"
            >
              Ir al dashboard sin pagar todavía
            </AppleButton>
            <p className="mt-4 text-[12px] leading-[1.5] text-[var(--text-tertiary)]">
              {copy.terms_required}
            </p>
          </aside>
        </motion.div>
      </main>
    </>
  );
}
