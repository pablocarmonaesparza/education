"use client";

/**
 * /onboarding/context — paso post-pago: el brief que personaliza los casos.
 *
 * El static library ya sembró casos base (al crear el team), así que el team
 * arranca sin esperar. Aquí capturamos el contexto real del trabajo del team
 * y disparamos la generación bespoke ASYNC (no bloquea): el motor corre en el
 * servidor y los casos a la medida aparecen en el dashboard al terminar.
 *
 * NOTA (adelanto): la generación se dispara fire-and-forget (keepalive) contra
 * /api/orgs/[org_id]/cases/generate. Ese endpoint hoy corre inline (hasta 300s);
 * a escala va a una cola/worker. El brief rico (manager_wants_to_know, tools)
 * requiere extender el endpoint + buildBriefFromContext — pendiente.
 */

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SelectItem } from "@heroui/react";
import { motion } from "framer-motion";
import { OnboardingNav } from "@/components/simulador/OnboardingNav";
import {
  AppleButton,
  AppleInput,
  AppleSelect,
  AppleTextarea,
} from "@/components/simulador/apple";
import { onboardingCopy } from "@/lib/simulador/copy/onboarding";

const copy = onboardingCopy.step_context;

/** Pregunta visible + campo (patrón de cuestionario: el label no es placeholder). */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[14px] font-medium text-[var(--text-primary)]">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function OnboardingContextPage() {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [scenario, setScenario] = useState("");
  const [manager, setManager] = useState("");
  const [tools, setTools] = useState("");
  const [phase, setPhase] = useState<"form" | "generating">("form");

  useEffect(() => {
    const oid = sessionStorage.getItem("onboarding_org_id");
    const tid = sessionStorage.getItem("onboarding_team_id");
    if (!oid) {
      router.push("/onboarding/org");
      return;
    }
    // Patrón legítimo: hidratar IDs desde sessionStorage (client-only) en mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrgId(oid);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTeamId(tid);
  }, [router]);

  function fireGeneration() {
    if (!orgId) return;
    // Fire-and-forget con keepalive: sobrevive a la navegación. El motor corre
    // server-side y persiste al terminar. (Robusto = cola/worker, pendiente.)
    try {
      void fetch(`/api/orgs/${orgId}/cases/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          team_id: teamId ?? undefined,
          role: role.trim() || undefined,
          level: level || undefined,
          scenario: scenario.trim() || undefined,
        }),
      }).catch(() => {});
    } catch {
      /* best-effort: el adelanto no bloquea el flow si la red falla */
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) return;
    fireGeneration();
    setPhase("generating");
    setTimeout(() => router.push("/dashboard"), 2400);
  }

  if (!orgId) return null;

  if (phase === "generating") {
    return (
      <>
        <OnboardingNav />
        <main className="surface-canvas min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-[440px] w-full text-center flex flex-col items-center gap-6"
          >
            <div className="h-12 w-12 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
            <div className="flex flex-col gap-3">
              <h1 className="display display-tight text-[28px] sm:text-[32px] leading-[1.1] text-[var(--text-primary)]">
                {copy.generating_headline}
              </h1>
              <p className="text-[15px] leading-[1.55] text-[var(--text-secondary)]">
                {copy.generating_body}
              </p>
            </div>
          </motion.div>
        </main>
      </>
    );
  }

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
          <div className="eyebrow mb-3">{copy.eyebrow_context}</div>
          <h1 className="display display-tight text-[28px] sm:text-[32px] leading-[1.1] text-[var(--text-primary)]">
            {copy.headline}
          </h1>
          <p className="mt-3 text-[15px] leading-[1.55] text-[var(--text-secondary)]">
            {copy.body}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <Field label={copy.fields.role_label}>
              <AppleInput
                placeholder={copy.fields.role_placeholder}
                value={role}
                onValueChange={setRole}
                aria-label={copy.fields.role_label}
                size="md"
                autoFocus
              />
            </Field>

            <Field label={copy.fields.level_label}>
              <AppleSelect
                placeholder="Selecciona el nivel"
                aria-label={copy.fields.level_label}
                selectedKeys={level ? [level] : []}
                onSelectionChange={(keys) =>
                  setLevel(Array.from(keys)[0] as string)
                }
                size="md"
              >
                {copy.fields.level_options.map((o) => (
                  <SelectItem key={o.key}>{o.label}</SelectItem>
                ))}
              </AppleSelect>
            </Field>

            <Field label={copy.fields.scenario_label}>
              <AppleTextarea
                placeholder={copy.fields.scenario_placeholder}
                value={scenario}
                onValueChange={setScenario}
                aria-label={copy.fields.scenario_label}
                minRows={3}
              />
            </Field>

            <Field label={copy.fields.manager_label}>
              <AppleTextarea
                placeholder={copy.fields.manager_placeholder}
                value={manager}
                onValueChange={setManager}
                aria-label={copy.fields.manager_label}
                minRows={2}
              />
            </Field>

            <Field label={copy.fields.tools_label}>
              <AppleInput
                placeholder={copy.fields.tools_placeholder}
                value={tools}
                onValueChange={setTools}
                aria-label={copy.fields.tools_label}
                size="md"
              />
            </Field>

            <div className="flex flex-col items-center gap-3 pt-2">
              <AppleButton
                type="submit"
                isDisabled={!role.trim() || !level || !scenario.trim()}
                size="lg"
                className="w-full h-12 accent-bg text-white text-[15px] font-medium shadow-none"
              >
                {copy.submit_cta}
              </AppleButton>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="text-[13.5px] text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-secondary)]"
              >
                {copy.skip_cta}
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </>
  );
}
