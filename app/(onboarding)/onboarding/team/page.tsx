"use client";

/**
 * /onboarding/team — paso 2 del flow buyer B2B.
 *
 * Define el primer equipo dentro de la organización (Marketing, Growth, Ops).
 * Crea row en simulador.teams.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SelectItem } from "@heroui/react";
import { motion } from "framer-motion";
import { OnboardingNav } from "@/components/simulador/OnboardingNav";
import { AppleInput, AppleSelect, AppleSlideButton } from "@/components/simulador/apple";
import {
  markOnboardingStepUnlocked,
  ONBOARDING_ORG_ID_KEY,
  ONBOARDING_ORG_NAME_KEY,
  ONBOARDING_TEAM_ID_KEY,
  ONBOARDING_TEAM_NAME_KEY,
} from "@/lib/simulador/onboarding-progress";

const DEPARTMENTS = [
  { key: "marketing", label: "Marketing / Growth" },
  { key: "operations", label: "Operaciones" },
  { key: "sales", label: "Ventas" },
  { key: "customer_success", label: "Customer Success" },
  { key: "engineering", label: "Ingeniería" },
  { key: "people_hr", label: "People / HR" },
  { key: "otro", label: "Otro" },
];

const DEPARTMENT_LABELS: Record<string, string> = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.key, d.label]),
);

export default function OnboardingTeamPage() {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [, setOrgName] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem(ONBOARDING_ORG_ID_KEY);
    const n = sessionStorage.getItem(ONBOARDING_ORG_NAME_KEY);
    if (!id) {
      router.push("/onboarding/org");
      return;
    }
    setOrgId(id);
    setOrgName(n ?? "");
  }, [router]);

  // El nombre del team se deriva del Select salvo cuando es "otro",
  // que pide nombre custom al user. Evita el doble-tipeo del patrón viejo
  // (Input + Select que decían la misma info).
  const computedTeamName =
    department === "otro" ? name.trim() : DEPARTMENT_LABELS[department] ?? "";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) return;
    if (!department) return;
    if (department === "otro" && !name.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: computedTeamName,
          department_key: department,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al crear equipo.");
      sessionStorage.setItem(ONBOARDING_TEAM_ID_KEY, data.id);
      sessionStorage.setItem(ONBOARDING_TEAM_NAME_KEY, data.name);
      markOnboardingStepUnlocked(2);
      router.push("/onboarding/invite");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!orgId) return null;

  return (
    <>
      <OnboardingNav progress={{ total: 6, current: 1, ariaLabel: "Paso 2 de 6" }} />
      <main className="surface-canvas min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-[440px] w-full"
        >
          <h1 className="display display-tight ts-title-1 sm:ts-display leading-[1.1] text-[var(--text-primary)]">
            ¿Qué equipo vas a diagnosticar primero?
          </h1>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <AppleSelect
              placeholder="Función"
              aria-label="Función del equipo"
              selectedKeys={department ? [department] : []}
              onSelectionChange={(keys) =>
                setDepartment(Array.from(keys)[0] as string)
              }
              size="md"
            >
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d.key}>{d.label}</SelectItem>
              ))}
            </AppleSelect>

            {department === "otro" && (
              <AppleInput
                value={name}
                onValueChange={setName}
                placeholder="Nombre del equipo"
                size="md"
                autoFocus
              />
            )}

            {error && (
              <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--band-b-bg)] text-[var(--band-b-text)] ts-subhead text-center leading-[1.5]">
                {error}
              </div>
            )}

            <AppleSlideButton
              type="submit"
              isLoading={submitting}
              isDisabled={
                !department ||
                (department === "otro" && !name.trim()) ||
                submitting
              }
              hint
            >
              Continuar →
            </AppleSlideButton>
          </form>
        </motion.div>
      </main>
    </>
  );
}
