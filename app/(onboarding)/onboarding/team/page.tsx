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
import { AppleButton, AppleInput, AppleSelect } from "@/components/simulador/apple";

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
    const id = sessionStorage.getItem("onboarding_org_id");
    const n = sessionStorage.getItem("onboarding_org_name");
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
      sessionStorage.setItem("onboarding_team_id", data.id);
      sessionStorage.setItem("onboarding_team_name", data.name);
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
      <OnboardingNav />
      <main className="surface-canvas min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-[440px] w-full"
        >
          <div className="eyebrow mb-3">Paso 2 de 5</div>
          <h1 className="display display-tight text-[28px] sm:text-[32px] leading-[1.1] text-[var(--text-primary)]">
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
              autoFocus
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
              <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--band-b-bg)] text-[var(--band-b-text)] text-[13.5px] text-center leading-[1.5]">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <AppleButton
                onPress={() => router.push("/onboarding/org")}
                tone="secondary"
                size="lg"
                className="h-12 border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-primary)] text-[15px] font-medium shadow-none"
              >
                ← Atrás
              </AppleButton>
              <AppleButton
                type="submit"
                isLoading={submitting}
                isDisabled={
                  !department ||
                  (department === "otro" && !name.trim()) ||
                  submitting
                }
                size="lg"
                className="accent-bg text-white px-7 h-12 text-[15px] font-medium shadow-none flex-1 sm:flex-none"
              >
                Continuar →
              </AppleButton>
            </div>
          </form>
        </motion.div>
      </main>
    </>
  );
}
