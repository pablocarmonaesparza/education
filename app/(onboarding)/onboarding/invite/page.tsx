"use client";

/**
 * /onboarding/invite — paso 3 del flow buyer B2B.
 *
 * Invita N participantes (por email, hasta 50) al team recién creado.
 * POST /api/orgs/[org_id]/invitations envía emails con tokens únicos.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Textarea } from "@heroui/react";
import { motion } from "framer-motion";
import { OnboardingNav } from "@/components/simulador/OnboardingNav";

export default function OnboardingInvitePage() {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState("");
  const [emailsText, setEmailsText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    sent: number;
    skipped: { email: string; reason: string }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  function parseEmails(text: string): string[] {
    return Array.from(
      new Set(
        text
          .split(/[\s,;\n]+/)
          .map((s) => s.trim().toLowerCase())
          .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)),
      ),
    );
  }

  const emails = parseEmails(emailsText);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId || emails.length === 0) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails,
          team_id: teamId,
          intended_role: "employee",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al enviar invitaciones.");
      setResult({
        sent: data.invitations?.length ?? 0,
        skipped: data.skipped ?? [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  function onFinish() {
    sessionStorage.removeItem("onboarding_org_id");
    sessionStorage.removeItem("onboarding_org_name");
    sessionStorage.removeItem("onboarding_team_id");
    sessionStorage.removeItem("onboarding_team_name");
    router.push("/dashboard");
  }

  function onContinueToBilling() {
    router.push("/onboarding/billing");
  }

  if (!orgId || !teamId) return null;

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
          <div className="eyebrow mb-4">Paso 3 de 5</div>
          <h1 className="display display-tight text-[var(--text-primary)] text-[32px] sm:text-[40px]">
            ¿Quiénes van a hacer el diagnóstico?
          </h1>

          {!result ? (
            <form onSubmit={onSubmit} className="mt-10 space-y-3">
              <Textarea
                placeholder="Emails de los participantes — uno por línea, coma o espacio"
                value={emailsText}
                onValueChange={setEmailsText}
                minRows={6}
                variant="bordered"
                radius="lg"
                size="lg"
                description={`${emails.length} email${emails.length === 1 ? "" : "s"} válido${emails.length === 1 ? "" : "s"} detectado${emails.length === 1 ? "" : "s"}`}
              />

              {error && (
                <div className="text-[13px] text-[var(--band-b-text)] bg-[var(--band-b-bg)] px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <Button
                  onPress={() => router.push("/onboarding/team")}
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
                  isDisabled={emails.length === 0 || submitting}
                  radius="md"
                  size="lg"
                  className="accent-bg text-white px-7 h-12 text-[15px] font-medium shadow-none flex-1 sm:flex-none"
                >
                  Enviar {emails.length || ""} invitación
                  {emails.length === 1 ? "" : "es"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="mt-10 space-y-5">
              <div className="card-apple bg-[var(--surface)] p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-2 w-2 rounded-full bg-[var(--band-a-bar)]" />
                  <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
                    {result.sent} invitación{result.sent === 1 ? "" : "es"}{" "}
                    enviada{result.sent === 1 ? "" : "s"}
                  </h2>
                </div>
                <p className="text-[14px] text-[var(--text-secondary)] leading-[1.55]">
                  Cada participante recibirá un email con su link único. El
                  diagnóstico aparecerá en tu dashboard cuando completen el
                  caso.
                </p>
                {result.skipped.length > 0 && (
                  <div className="mt-4 pt-4">
                    <div className="eyebrow mb-2">No enviadas</div>
                    <ul className="text-[13px] text-[var(--text-secondary)] space-y-1">
                      {result.skipped.map((s, i) => (
                        <li key={i}>
                          · {s.email} — {s.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onPress={() => setResult(null)}
                  variant="bordered"
                  radius="md"
                  size="lg"
                  className="h-12 border-[var(--border-strong)] text-[var(--text-primary)] bg-[var(--surface)]"
                >
                  Invitar más
                </Button>
                <Button
                  onPress={onContinueToBilling}
                  radius="md"
                  size="lg"
                  className="accent-bg text-white px-7 h-12 text-[15px] font-medium shadow-none flex-1 sm:flex-none"
                >
                  Continuar a pago →
                </Button>
                <Button
                  onPress={onFinish}
                  variant="light"
                  radius="md"
                  size="lg"
                  className="h-12 text-[var(--text-secondary)]"
                >
                  Ir al dashboard
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </>
  );
}
