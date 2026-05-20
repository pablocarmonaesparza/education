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
  { key: "operations", label: "Operations" },
  { key: "sales", label: "Sales" },
  { key: "customer_success", label: "Customer Success" },
  { key: "engineering", label: "Engineering" },
  { key: "people_hr", label: "People / HR" },
  { key: "otro", label: "Otro" },
];

export default function OnboardingTeamPage() {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("");
  const [name, setName] = useState("Marketing");
  const [department, setDepartment] = useState("marketing");
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
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
          <div className="eyebrow mb-4">
            Paso 2 de 5 · Equipo dentro de {orgName || "tu organización"}
          </div>
          <h1 className="display display-tight text-[var(--text-primary)] text-[32px] sm:text-[40px]">
            ¿Qué equipo vas a diagnosticar primero?
          </h1>
          <p className="mt-5 text-[17px] text-[var(--text-secondary)] leading-[1.55]">
            El caso 1 está calibrado para Marketing / Growth. Si tu equipo es
            otro, sigamos — vamos a crear casos por industria/rol más
            adelante.
          </p>

          <form onSubmit={onSubmit} className="mt-10 space-y-5">
            <Input
              label="Nombre del equipo"
              value={name}
              onValueChange={setName}
              placeholder="Marketing"
              isRequired
              variant="bordered"
              radius="lg"
              size="lg"
              autoFocus
            />

            <Select
              label="Función"
              selectedKeys={[department]}
              onSelectionChange={(keys) =>
                setDepartment(Array.from(keys)[0] as string)
              }
              variant="bordered"
              radius="lg"
              size="lg"
            >
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d.key}>{d.label}</SelectItem>
              ))}
            </Select>

            {error && (
              <div className="text-[13px] text-[var(--band-b-text)] bg-[var(--band-b-bg)] px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <Button
                onPress={() => router.push("/onboarding/org")}
                variant="bordered"
                radius="sm"
                size="lg"
                className="h-12 border-[var(--border-strong)] text-[var(--text-primary)] bg-[var(--surface)]"
              >
                ← Atrás
              </Button>
              <Button
                type="submit"
                isLoading={submitting}
                isDisabled={!name.trim() || submitting}
                radius="sm"
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
