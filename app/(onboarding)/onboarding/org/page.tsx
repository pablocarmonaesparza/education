"use client";

/**
 * /onboarding/org — paso 1 del flow buyer B2B.
 *
 * Captura nombre de la organización, industria, región y tamaño. Crea la
 * row en simulador.organizations + asigna al user actual como org_admin
 * via POST /api/orgs.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, SelectItem } from "@heroui/react";
import { motion } from "framer-motion";
import { OnboardingNav } from "@/components/simulador/OnboardingNav";

const INDUSTRIES = [
  { key: "saas_b2b", label: "SaaS B2B" },
  { key: "ecommerce", label: "Ecommerce" },
  { key: "servicios_profesionales", label: "Servicios profesionales" },
  { key: "fintech", label: "Fintech" },
  { key: "retail", label: "Retail" },
  { key: "otro", label: "Otro" },
];

const REGIONS = [
  { key: "MX", label: "México" },
  { key: "CO", label: "Colombia" },
  { key: "AR", label: "Argentina" },
  { key: "CL", label: "Chile" },
  { key: "BR", label: "Brasil" },
  { key: "PE", label: "Perú" },
  { key: "other_latam", label: "Otro LATAM" },
  { key: "us", label: "EE.UU." },
];

const SIZES = [
  { key: "1-10", label: "1–10 empleados" },
  { key: "11-50", label: "11–50 empleados" },
  { key: "51-100", label: "51–100 empleados" },
  { key: "101-300", label: "101–300 empleados" },
  { key: "301-500", label: "301–500 empleados" },
  { key: "501+", label: "501+ empleados" },
];

export default function OnboardingOrgPage() {
  const router = useRouter();
  const [name, setName] = useState("");
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
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al crear organización.");
      // Guardar org_id en sessionStorage para los siguientes steps del onboarding.
      sessionStorage.setItem("onboarding_org_id", data.id);
      sessionStorage.setItem("onboarding_org_name", data.name);
      router.push("/onboarding/team");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <OnboardingNav />
      <main className="surface-canvas min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-xl w-full"
        >
          <div className="eyebrow mb-4">Paso 1 de 5</div>
          <h1 className="display display-tight text-[var(--text-primary)] text-[32px] sm:text-[40px]">
            Cuéntanos sobre tu equipo
          </h1>

          <form onSubmit={onSubmit} className="mt-10 space-y-3">
            <Input
              value={name}
              onValueChange={setName}
              placeholder="Nombre de la organización"
              variant="bordered"
              radius="lg"
              size="lg"
              autoFocus
            />

            <Select
              placeholder="Industria"
              aria-label="Industria"
              selectedKeys={industry ? [industry] : []}
              onSelectionChange={(keys) =>
                setIndustry(Array.from(keys)[0] as string)
              }
              variant="bordered"
              radius="lg"
              size="lg"
            >
              {INDUSTRIES.map((i) => (
                <SelectItem key={i.key}>{i.label}</SelectItem>
              ))}
            </Select>

            <Select
              placeholder="Región principal"
              aria-label="Región principal"
              selectedKeys={region ? [region] : []}
              onSelectionChange={(keys) =>
                setRegion(Array.from(keys)[0] as string)
              }
              variant="bordered"
              radius="lg"
              size="lg"
            >
              {REGIONS.map((r) => (
                <SelectItem key={r.key}>{r.label}</SelectItem>
              ))}
            </Select>

            <Select
              placeholder="Tamaño del equipo"
              aria-label="Tamaño del equipo"
              selectedKeys={size ? [size] : []}
              onSelectionChange={(keys) =>
                setSize(Array.from(keys)[0] as string)
              }
              variant="bordered"
              radius="lg"
              size="lg"
            >
              {SIZES.map((s) => (
                <SelectItem key={s.key}>{s.label}</SelectItem>
              ))}
            </Select>

            {error && (
              <div className="text-[13px] text-[var(--band-b-text)] bg-[var(--band-b-bg)] px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                isLoading={submitting}
                isDisabled={!name.trim() || !industry || !region || !size || submitting}
                radius="md"
                size="lg"
                className="accent-bg text-white px-7 h-12 text-[15px] font-medium shadow-none w-full sm:w-auto"
              >
                Continuar →
              </Button>
            </div>
          </form>
        </motion.div>
      </main>
    </>
  );
}
