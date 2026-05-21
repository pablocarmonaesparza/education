"use client";

/**
 * /onboarding/team — paso 2 del flow buyer B2B.
 *
 * Define el primer equipo dentro de la organización (Marketing, Growth, Ops).
 * Crea row en simulador.teams.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, SelectItem } from "@heroui/react";
import { motion } from "framer-motion";
import { SurfaceNav } from "@/components/simulador/SurfaceNav";

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
  const [orgName, setOrgName] = useState("");
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
      <SurfaceNav />
      <main className="surface-canvas min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-xl w-full"
        >
          <div className="eyebrow mb-4">Paso 2 de 5</div>
          <h1 className="display display-tight text-[var(--text-primary)] text-[32px] sm:text-[40px]">
            ¿Qué equipo vas a diagnosticar primero?
          </h1>

          <form onSubmit={onSubmit} className="mt-10 space-y-3">
            <Select
              placeholder="Función"
              aria-label="Función del equipo"
              selectedKeys={department ? [department] : []}
              onSelectionChange={(keys) =>
                setDepartment(Array.from(keys)[0] as string)
              }
              variant="bordered"
              radius="lg"
              size="lg"
              autoFocus
            >
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d.key}>{d.label}</SelectItem>
              ))}
            </Select>

            {department === "otro" && (
              <Input
                value={name}
                onValueChange={setName}
                placeholder="Nombre del equipo"
                variant="bordered"
                radius="lg"
                size="lg"
                autoFocus
              />
            )}

            {error && (
              <div className="text-[13px] text-[var(--band-b-text)] bg-[var(--band-b-bg)] px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <Button
                onPress={() => router.push("/onboarding/org")}
                variant="bordered"
                radius="md"
                size="lg"
                className="h-12 border-[var(--border-strong)] text-[var(--text-primary)] bg-[var(--surface)]"
              >
                ← Atrás
              </Button>
              <Button
                type="submit"
                isLoading={submitting}
                isDisabled={
                  !department ||
                  (department === "otro" && !name.trim()) ||
                  submitting
                }
                radius="md"
                size="lg"
                className="accent-bg text-white px-7 h-12 text-[15px] font-medium shadow-none flex-1 sm:flex-none"
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
