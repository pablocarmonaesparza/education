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
import { motion } from "framer-motion";
import { OnboardingNav } from "@/components/simulador/OnboardingNav";
import {
  AppleButton,
  AppleIcon,
  AppleInput,
  AppleSlideButton,
} from "@/components/simulador/apple";
import {
  markInviteCompleted,
  ONBOARDING_ORG_ID_KEY,
  ONBOARDING_TEAM_ID_KEY,
  ONBOARDING_TEAM_NAME_KEY,
} from "@/lib/simulador/onboarding-progress";
import { validateOnboardingInvites } from "@/lib/simulador/onboarding-invitations";

interface InviteRow {
  email: string;
  isAdmin: boolean;
}

const SECONDARY_BUTTON_CLASS =
  "h-12 w-full justify-center border-[var(--border-strong)] bg-[var(--surface)] px-6 ts-body font-medium shadow-none";

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
    const oid = sessionStorage.getItem(ONBOARDING_ORG_ID_KEY);
    const tid = sessionStorage.getItem(ONBOARDING_TEAM_ID_KEY);
    const tn = sessionStorage.getItem(ONBOARDING_TEAM_NAME_KEY);
    if (!oid || !tid) {
      router.push("/onboarding/org");
      return;
    }
    setOrgId(oid);
    setTeamId(tid);
    setTeamName(tn ?? "");
  }, [router]);

  const validation = validateOnboardingInvites(rows);
  const { canSubmit, validCount } = validation;
  const submitLabel =
    validCount === 0
      ? "Enviar invitaciones"
      : `Enviar ${validCount} invitación${validCount === 1 ? "" : "es"}`;

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
    // Estrategia tier:
    //   1. navigator.clipboard.writeText (moderno, requiere user gesture
    //      + secure context). En localhost suele funcionar, pero algunos
    //      navegadores estrictos lo bloquean si el document perdió focus.
    //   2. fallback document.execCommand('copy') con textarea oculto
    //      (deprecated pero más permisivo en contextos donde el moderno falla).
    //   3. prompt como último recurso (usuario hace el copy manual).
    let ok = false;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        ok = true;
      } catch {
        ok = false;
      }
    }
    if (!ok) {
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        ta.style.pointerEvents = "none";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } else {
      window.prompt("Copia el enlace:", url);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId || !canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      const invitations = validation.validRows;
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
      markInviteCompleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  function onContinueToContext() {
    markInviteCompleted();
    router.push("/onboarding/context");
  }

  if (!orgId || !teamId) return null;

  return (
    <>
      <OnboardingNav progress={{ total: 6, current: 2, ariaLabel: "Paso 3 de 6" }} />
      <main className="surface-canvas min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-[440px] w-full"
        >
          <h1 className="display display-tight ts-title-1 sm:ts-display leading-[1.1] text-[var(--text-primary)]">
            ¿Quiénes van a hacer el diagnóstico?
          </h1>

          {!result ? (
            <form onSubmit={onSubmit} className="mt-8">
              <div className="space-y-2">
                {rows.map((row, index) => (
                  <div
                    key={index}
                    className={`grid items-center gap-3 ${
                      rows.length > 1
                        ? "grid-cols-[minmax(0,1fr)_7.5rem_2.75rem]"
                        : "grid-cols-[minmax(0,1fr)_7.5rem]"
                    }`}
                  >
                    <div className="min-w-0">
                      <AppleInput
                        type="email"
                        placeholder="email@empresa.com"
                        value={row.email}
                        onValueChange={(v) => updateRow(index, { email: v })}
                        size="md"
                        autoFocus={index === 0}
                        autoComplete="off"
                        aria-label={`Email del miembro ${index + 1}`}
                      />
                    </div>
                    <label
                      className={`flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] border px-3 ts-body font-medium transition-colors ${
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
                        className="flex h-12 w-11 items-center justify-center rounded-[var(--radius-md)] text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div aria-hidden className="my-4 border-t border-[var(--hairline)]" />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <AppleButton
                  type="button"
                  onPress={addRow}
                  aria-label="Agregar otro miembro"
                  tone="secondary"
                  size="lg"
                  className={SECONDARY_BUTTON_CLASS}
                >
                  <span className="inline-flex items-center gap-2.5 whitespace-nowrap">
                    <AppleIcon name="users" size="sm" />
                    Agregar miembro
                  </span>
                </AppleButton>
                <AppleButton
                  type="button"
                  onPress={copyInviteLink}
                  aria-label="Copiar enlace de invitación"
                  tone="secondary"
                  size="lg"
                  className={SECONDARY_BUTTON_CLASS}
                >
                  {copied ? (
                    <span className="inline-flex items-center gap-2.5 whitespace-nowrap">
                      <AppleIcon name="check" size="sm" />
                      Enlace copiado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2.5 whitespace-nowrap">
                      <AppleIcon name="share" size="sm" />
                      Copiar enlace
                    </span>
                  )}
                </AppleButton>
              </div>

              <p className="mt-3 ts-footnote text-[var(--text-tertiary)]">
                Es posible terminar las invitaciones más tarde desde el dashboard.
              </p>

              {error && (
                <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--band-b-bg)] px-3 py-2 ts-subhead text-[var(--band-b-text)]">
                  {error}
                </div>
              )}

              <div className="mt-8">
                <AppleSlideButton
                  type="submit"
                  isLoading={submitting}
                  isDisabled={!canSubmit || submitting}
                  hint
                >
                  {submitLabel}
                </AppleSlideButton>
              </div>
            </form>
          ) : (
            <div className="mt-8 space-y-5">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-[var(--band-a-bg)] grid place-items-center">
                  <AppleIcon name="check" size="lg" className="text-[var(--band-a-text)]" />
                </div>
                <h2 className="display display-tight mt-7 ts-title-1 text-[var(--text-primary)]">
                  {result.sent} invitación{result.sent === 1 ? "" : "es"}{" "}
                  enviada{result.sent === 1 ? "" : "s"}
                </h2>
                <p className="mt-4 ts-body text-[var(--text-secondary)] leading-[1.55]">
                  Cada participante recibirá un email con su link único. El
                  diagnóstico aparecerá en tu dashboard cuando completen el
                  caso.
                </p>
              </div>
              {result.skipped.length > 0 && (
                <div className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-4 text-left">
                  <div className="eyebrow mb-2">No enviadas</div>
                  <ul className="ts-subhead text-[var(--text-secondary)] space-y-1">
                    {result.skipped.map((s, i) => (
                      <li key={i}>
                        · {s.email}: {s.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-center gap-3">
                <AppleButton
                  onPress={() => {
                    setResult(null);
                    setRows([{ email: "", isAdmin: false }]);
                  }}
                  tone="secondary"
                  size="lg"
                  className="h-12"
                >
                  Invitar más
                </AppleButton>
                <AppleSlideButton onClick={onContinueToContext}>
                  Continuar →
                </AppleSlideButton>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </>
  );
}
