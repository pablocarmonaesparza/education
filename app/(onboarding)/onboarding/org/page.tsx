"use client";

/**
 * /onboarding/org — paso 1 del flow buyer B2B (5 pasos).
 *
 * Captura nombre de la organización, industria, región y tamaño. Crea la
 * row en simulador.organizations + asigna al user actual como org_admin
 * via POST /api/orgs. Las opciones de los selects viven en el copy versionado
 * (lib/simulador/copy/onboarding.ts) — keys en inglés, regiones US-first.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SelectItem } from "@heroui/react";
import { motion } from "framer-motion";
import { OnboardingNav } from "@/components/simulador/OnboardingNav";
import { AppleInput, AppleSelect, AppleSlideButton } from "@/components/simulador/apple";
import {
  markOnboardingStepUnlocked,
  ONBOARDING_ORG_ID_KEY,
  ONBOARDING_ORG_NAME_KEY,
} from "@/lib/simulador/onboarding-progress";
import { onboardingCopy } from "@/lib/simulador/copy/onboarding";
import { MARKET_STATS } from "@/lib/simulador/copy/market-stats";

const copy = onboardingCopy.step1_org;

export default function OnboardingOrgPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [userJobTitle, setUserJobTitle] = useState("");
  const [industry, setIndustry] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          industry,
          region,
          company_size_key: size,
          user_job_title: userJobTitle.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? copy.error_create);
      // Guardar org_id en sessionStorage para los siguientes steps del onboarding.
      sessionStorage.setItem(ONBOARDING_ORG_ID_KEY, data.id);
      sessionStorage.setItem(ONBOARDING_ORG_NAME_KEY, data.name);
      markOnboardingStepUnlocked(1);
      router.push("/onboarding/team");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <OnboardingNav progress={{ total: 5, current: 0, ariaLabel: "Step 1 of 5" }} />
      <main className="surface-canvas min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-[440px] w-full"
        >
          <h1 className="display display-tight ts-title-1 sm:ts-display leading-[1.1] text-[var(--text-primary)]">
            {copy.headline}
          </h1>
          <p className="mt-3 ts-body leading-[1.5] text-[var(--text-secondary)]">
            {copy.body_lead}{" "}
            {/* La stat viaja con su fuente como tooltip — regla de market-stats. */}
            <span
              title={MARKET_STATS.MCKINSEY_3X.source}
              className="cursor-help underline decoration-dotted underline-offset-2"
            >
              {copy.body_stat}
            </span>
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <AppleInput
              value={name}
              onValueChange={setName}
              placeholder={copy.fields.name_label}
              size="md"
              autoFocus
            />

            <AppleInput
              value={userJobTitle}
              onValueChange={setUserJobTitle}
              placeholder={copy.fields.job_title_placeholder}
              size="md"
            />

            <AppleSelect
              placeholder={copy.fields.industry_label}
              aria-label={copy.fields.industry_label}
              selectedKeys={industry ? [industry] : []}
              onSelectionChange={(keys) =>
                setIndustry(Array.from(keys)[0] as string)
              }
              size="md"
            >
              {copy.industry_options.map((i) => (
                <SelectItem key={i.key}>{i.label}</SelectItem>
              ))}
            </AppleSelect>

            <AppleSelect
              placeholder={copy.fields.region_label}
              aria-label={copy.fields.region_label}
              selectedKeys={region ? [region] : []}
              onSelectionChange={(keys) =>
                setRegion(Array.from(keys)[0] as string)
              }
              size="md"
            >
              {copy.region_options.map((r) => (
                <SelectItem key={r.key}>{r.label}</SelectItem>
              ))}
            </AppleSelect>

            <AppleSelect
              placeholder={copy.fields.size_label}
              aria-label={copy.fields.size_label}
              selectedKeys={size ? [size] : []}
              onSelectionChange={(keys) =>
                setSize(Array.from(keys)[0] as string)
              }
              size="md"
            >
              {copy.size_options.map((s) => (
                <SelectItem key={s.key}>{s.label}</SelectItem>
              ))}
            </AppleSelect>

            {error && (
              <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--band-b-bg)] text-[var(--band-b-text)] ts-subhead text-center leading-[1.5]">
                {error}
              </div>
            )}

            <AppleSlideButton
              type="submit"
              isLoading={submitting}
              isDisabled={
                !name.trim() ||
                !userJobTitle.trim() ||
                !industry ||
                !region ||
                !size ||
                submitting
              }
              hint
            >
              {copy.submit_cta}
            </AppleSlideButton>
          </form>
        </motion.div>
      </main>
    </>
  );
}
