"use client";

/**
 * /onboarding/invite — paso 3 del flow buyer B2B.
 *
 * Cada fila del form es un participante: email + checkbox "admin".
 * "admin" marca al participante como admin de la org (puede invitar más
 * gente, ver billing, etc.) — internamente intended_role='manager'.
 * Sin marca → intended_role='employee' (solo hace su diagnóstico).
 *
 * Botones:
 *   - "Agregar otro miembro" → añade fila vacía
 *   - "Copiar enlace de invitación" → copia un URL genérico que el admin
 *     puede compartir externamente (Slack, WhatsApp, etc).
 *   - Helper: "Es posible terminar las invitaciones más tarde" — el flow
 *     no obliga a invitar a todos ahora; se pueden invitar más desde el
 *     dashboard.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@heroui/react";
import { motion } from "framer-motion";
import { OnboardingNav } from "@/components/simulador/OnboardingNav";

interface InviteRow {
  email: string;
  isAdmin: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function OnboardingInvitePage() {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [, setTeamName] = useState("");
  const [rows, setRows] = useState<InviteRow[]>([{ email: "", isAdmin: false }]);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const validRows = rows.filter((r) => EMAIL_RE.test(r.email.trim()));
  const validCount = validRows.length;

  function updateRow(index: number, patch: Partial<InviteRow>) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  }

  function addRow() {
    setRows((prev) => [...prev, { email: "", isAdmin: false }]);
  }

  function removeRow(index: number) {
    setRows((prev) =>
      prev.length === 1 ? [{ email: "", isAdmin: false }] : prev.filter((_, i) => i !== index),
    );
  }

  async function copyInviteLink() {
    if (!orgId) return;
    const url = `${window.location.origin}/join/${orgId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback: prompt
      window.prompt("Copia el enlace:", url);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId || validCount === 0) return;
    setError(null);
    setSubmitting(true);
    try {
      const invitations = validRows.map((r) => ({
        email: r.email.trim().toLowerCase(),
        intended_role: r.isAdmin ? "manager" : "employee",
      }));
      const res = await fetch(`/api/orgs/${orgId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitations,
          team_id: teamId,
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
            <form onSubmit={onSubmit} className="mt-10">
              <div className="space-y-2">
                {rows.map((row, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        type="email"
                        placeholder="email@empresa.com"
                        value={row.email}
                        onValueChange={(v) => updateRow(index, { email: v })}
                        variant="bordered"
                        radius="lg"
                        size="lg"
                        autoFocus={index === 0}
                        autoComplete="off"
                        aria-label={`Email del miembro ${index + 1}`}
                      />
                    </div>
                    <label
                      className={`flex h-12 flex-none cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border px-3 text-[12px] font-medium transition-colors ${
                        row.isAdmin
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "border-[var(--hairline)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                      }`}
                      title="Marcar como admin de la organización (puede invitar más gente, ver billing, etc)"
                    >
                      <input
                        type="checkbox"
                        checked={row.isAdmin}
                        onChange={(e) =>
                          updateRow(index, { isAdmin: e.target.checked })
                        }
                        className="h-3.5 w-3.5 accent-[var(--accent)]"
                      />
                      <span>Admin</span>
                    </label>
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        aria-label={`Quitar miembro ${index + 1}`}
                        className="flex h-12 w-10 flex-none items-center justify-center rounded-[var(--radius-md)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={addRow}
                  className="inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface)] px-3 text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Agregar otro miembro
                </button>
                <button
                  type="button"
                  onClick={copyInviteLink}
                  className="inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface)] px-3 text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors"
                >
                  {copied ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Enlace copiado
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copiar enlace de invitación
                    </>
                  )}
                </button>
              </div>

              <p className="mt-3 text-[12px] text-[var(--text-tertiary)]">
                Es posible terminar las invitaciones más tarde desde el dashboard.
              </p>

              {error && (
                <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--band-b-bg)] px-3 py-2 text-[13px] text-[var(--band-b-text)]">
                  {error}
                </div>
              )}

              <div className="mt-8 flex gap-3">
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
                  isDisabled={validCount === 0 || submitting}
                  radius="md"
                  size="lg"
                  className="accent-bg text-white px-7 h-12 text-[15px] font-medium shadow-none flex-1 sm:flex-none"
                >
                  Enviar {validCount || ""} invitación
                  {validCount === 1 ? "" : "es"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="mt-10 space-y-5">
              <div className="rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-6">
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
                  <div className="mt-4 pt-4 border-t border-[var(--hairline)]">
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
                  onPress={() => {
                    setResult(null);
                    setRows([{ email: "", isAdmin: false }]);
                  }}
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
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </>
  );
}
