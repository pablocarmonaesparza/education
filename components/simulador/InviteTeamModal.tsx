"use client";

/**
 * InviteTeamModal — el manager invita gente desde el dashboard (/staff).
 *
 * Cumple la promesa del onboarding ("invite later from the dashboard"):
 * filas de email (agregar/quitar) → POST /api/orgs/[org_id]/invitations
 * (endpoint existente, gate org_admin) → resultado por `email_status` REAL:
 * los emails que no salieron ("failed"/"skipped") muestran su invite link
 * para compartir a mano — el token sigue siendo válido aunque el email falle.
 *
 * Registrado en /design/components (espejo del design system).
 */

import { useEffect, useState } from "react";
import {
  AppleButton,
  AppleIcon,
  AppleInput,
  AppleModal,
  AppleModalBody,
  AppleModalContent,
  AppleModalFooter,
  AppleModalHeader,
} from "@/components/simulador/apple";

// Mismo regex que el endpoint (app/api/orgs/[org_id]/invitations/route.ts).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Fila que devuelve el POST por invitación creada. */
interface InvitationResultRow {
  id: string;
  email: string;
  token: string;
  status: string;
  email_status: "sent" | "skipped" | "failed";
  email_reason: string | null;
}

interface InviteResult {
  sentCount: number;
  /** Invitaciones cuyo email no salió: link manual para compartir a mano. */
  manual: Array<{ email: string; link: string }>;
  /** Emails que el API saltó (p. ej. ya tenían invitación pending). */
  skipped: Array<{ email: string; reason: string }>;
}

export function InviteTeamModal({
  isOpen,
  onOpenChange,
  orgId,
  onInvited,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Org destino: el POST existente vive bajo /api/orgs/[org_id]/invitations. */
  orgId: string;
  /** Se dispara tras un POST exitoso (refrescar contadores del dashboard). */
  onInvited?: () => void;
}) {
  const [emails, setEmails] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InviteResult | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Cada apertura arranca el flujo limpio (sin restos del envío anterior).
  useEffect(() => {
    if (isOpen) {
      setEmails([""]);
      setError(null);
      setResult(null);
      setSubmitting(false);
      setCopiedLink(null);
    }
  }, [isOpen]);

  // Dedupe + validación en cliente; el endpoint repite ambas por su cuenta.
  const validEmails = Array.from(
    new Set(
      emails
        .map((e) => e.trim().toLowerCase())
        .filter((e) => EMAIL_RE.test(e)),
    ),
  );
  const canSubmit = validEmails.length > 0 && !submitting;

  function setEmailAt(index: number, value: string) {
    setEmails((prev) => prev.map((e, i) => (i === index ? value : e)));
  }

  function addRow() {
    setEmails((prev) => [...prev, ""]);
  }

  function removeRow(index: number) {
    setEmails((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );
  }

  async function submit() {
    if (validEmails.length === 0 || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitations: validEmails.map((email) => ({
            email,
            intended_role: "employee" as const,
          })),
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
        invitations?: InvitationResultRow[];
        skipped?: Array<{ email: string; reason: string }>;
      } | null;
      if (!res.ok) {
        throw new Error(data?.error ?? "Could not send the invites.");
      }

      const rows = data?.invitations ?? [];
      // email_status !== "sent" (failed o skipped) = el email NO llegó, pero
      // el token es válido: exponemos el link para que el manager lo comparta.
      const manual = rows
        .filter((r) => r.email_status !== "sent")
        .map((r) => ({
          email: r.email,
          link: `${window.location.origin}/auth/invitation/${r.token}`,
        }));
      setResult({
        sentCount: rows.filter((r) => r.email_status === "sent").length,
        manual,
        skipped: data?.skipped ?? [],
      });
      if (rows.length > 0) onInvited?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLink(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(link);
      setTimeout(
        () => setCopiedLink((cur) => (cur === link ? null : cur)),
        1800,
      );
    } catch {
      // Fallback mínimo cuando clipboard está bloqueado: copy manual.
      window.prompt("Copy the link:", link);
    }
  }

  // Headline del resultado según email_status real.
  const resultHeadline = result
    ? result.manual.length > 0
      ? `${result.sentCount} sent · ${result.manual.length} failed — share their invite links manually`
      : result.sentCount > 0
        ? `${result.sentCount === 1 ? "1 invite" : `${result.sentCount} invites`} sent`
        : "No new invites sent"
    : "";

  return (
    <AppleModal isOpen={isOpen} onOpenChange={onOpenChange}>
      <AppleModalContent>
        {result ? (
          <>
            <AppleModalHeader className="flex flex-col gap-1">
              <h3 className="ts-headline font-extrabold text-[var(--text-primary)]">
                {resultHeadline}
              </h3>
              {result.manual.length === 0 && result.sentCount > 0 && (
                <p className="ts-subhead font-medium text-[var(--text-secondary)]">
                  They&apos;ll show up on your dashboard as soon as they
                  accept.
                </p>
              )}
            </AppleModalHeader>
            <AppleModalBody>
              {result.manual.length > 0 && (
                <div className="space-y-2">
                  {result.manual.map((m) => (
                    <div
                      key={m.email}
                      className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <div className="ts-footnote font-bold text-[var(--text-primary)] truncate">
                          {m.email}
                        </div>
                        <div className="mono ts-caption-1 text-[var(--text-tertiary)] truncate">
                          {m.link}
                        </div>
                      </div>
                      <AppleButton
                        tone="secondary"
                        size="sm"
                        className="shrink-0"
                        onPress={() => copyLink(m.link)}
                      >
                        {copiedLink === m.link ? "Copied" : "Copy link"}
                      </AppleButton>
                    </div>
                  ))}
                </div>
              )}
              {result.skipped.length > 0 && (
                <div className="space-y-1">
                  {result.skipped.map((s) => (
                    <p
                      key={s.email}
                      className="ts-footnote font-medium text-[var(--text-tertiary)]"
                    >
                      {s.email} —{" "}
                      {s.reason === "already invited (pending)"
                        ? "already has a pending invite"
                        : s.reason}
                    </p>
                  ))}
                </div>
              )}
            </AppleModalBody>
            <AppleModalFooter>
              <AppleButton tone="primary" onPress={() => onOpenChange(false)}>
                Done
              </AppleButton>
            </AppleModalFooter>
          </>
        ) : (
          <>
            <AppleModalHeader className="flex flex-col gap-1">
              <h3 className="ts-headline font-extrabold text-[var(--text-primary)]">
                Invite your team
              </h3>
              <p className="ts-subhead font-medium text-[var(--text-secondary)]">
                Each person gets an email with a private link. Their first
                assessment starts there.
              </p>
            </AppleModalHeader>
            <AppleModalBody>
              <div className="space-y-2">
                {emails.map((email, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <AppleInput
                      type="email"
                      value={email}
                      onValueChange={(v) => setEmailAt(index, v)}
                      placeholder="name@company.com"
                      label={`Email ${index + 1}`}
                      className="flex-1"
                    />
                    {emails.length > 1 && (
                      <AppleButton
                        tone="ghost"
                        isIconOnly
                        aria-label={`Remove ${email || "this row"}`}
                        onPress={() => removeRow(index)}
                      >
                        <AppleIcon name="x" size="sm" aria-hidden />
                      </AppleButton>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <AppleButton size="inline" tone="primary" onPress={addRow}>
                  + Add another
                </AppleButton>
              </div>
              {error && (
                <p className="ts-footnote font-medium text-[var(--band-b-text)]">
                  {error}
                </p>
              )}
            </AppleModalBody>
            <AppleModalFooter>
              <AppleButton
                tone="ghost"
                onPress={() => onOpenChange(false)}
                isDisabled={submitting}
              >
                Cancel
              </AppleButton>
              <AppleButton
                tone="primary"
                onPress={submit}
                isDisabled={!canSubmit}
                isLoading={submitting}
              >
                {validEmails.length > 1
                  ? `Send ${validEmails.length} invites`
                  : "Send invite"}
              </AppleButton>
            </AppleModalFooter>
          </>
        )}
      </AppleModalContent>
    </AppleModal>
  );
}
