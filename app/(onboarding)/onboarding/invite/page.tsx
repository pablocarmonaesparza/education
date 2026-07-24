"use client";

/**
 * /onboarding/invite — paso 3 del flow buyer B2B (5 pasos).
 *
 * Cada fila del form es un participante: email + checkbox "admin".
 * "admin" marca al participante como admin de la org (puede invitar más
 * gente, ver billing, etc.) — internamente intended_role='manager'.
 * Sin marca → intended_role='employee' (solo hace su assessment).
 *
 * Honestidad del resultado (W2-A):
 *   - El headline "N sent" lee el email_status REAL que devuelve
 *     POST /api/orgs/[org_id]/invitations (sent | skipped | failed).
 *     Cuando un email no salió, se muestra su invite link para compartirlo
 *     manualmente (el token sigue siendo válido aunque el email falle).
 *   - Se eliminó "Copy link" (copiaba /join/{orgId}, que era 404).
 *   - "You can finish the invitations later from the dashboard" se mantiene:
 *     el dashboard ya permite invitar después.
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
import { onboardingCopy } from "@/lib/simulador/copy/onboarding";
import { MARKET_STATS } from "@/lib/simulador/copy/market-stats";

const copy = onboardingCopy.step3_invite;

interface InviteRow {
  email: string;
  isAdmin: boolean;
}

// Shape relevante de la respuesta de POST /api/orgs/[org_id]/invitations.
interface CreatedInvitation {
  id: string;
  email: string;
  token?: string | null;
  email_status?: "sent" | "skipped" | "failed";
}

interface InviteResult {
  sent: number;
  // Invitaciones creadas cuyo email NO salió — se comparten a mano.
  manual: { email: string; link: string | null }[];
  skipped: { email: string; reason: string }[];
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
  const [result, setResult] = useState<InviteResult | null>(null);
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
  const submitLabel = copy.submit_cta_template(validCount);

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
      if (!res.ok) throw new Error(data.error ?? copy.error_send);

      const created: CreatedInvitation[] = Array.isArray(data.invitations)
        ? data.invitations
        : [];
      const sent = created.filter((i) => i.email_status === "sent").length;
      const manual = created
        .filter((i) => i.email_status !== "sent")
        .map((i) => ({
          email: i.email,
          link: i.token
            ? `${window.location.origin}/auth/invitation/${i.token}`
            : null,
        }));
      setResult({ sent, manual, skipped: data.skipped ?? [] });
      markInviteCompleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function onContinueToBilling() {
    markInviteCompleted();
    router.push("/onboarding/billing");
  }

  if (!orgId || !teamId) return null;

  const allSent = result !== null && result.manual.length === 0;

  return (
    <>
      <OnboardingNav progress={{ total: 5, current: 2, ariaLabel: "Step 3 of 5" }} />
      <main className="surface-canvas min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-[440px] w-full"
        >
          <h1 className="display display-tight ts-title-1 sm:ts-display leading-[1.1] text-[var(--text-primary)]">
            {copy.headline}
          </h1>
          {!result && (
            <p
              className="mt-3 ts-body leading-[1.5] text-[var(--text-secondary)] cursor-help"
              /* La stat viaja con su fuente como tooltip — regla de market-stats. */
              title={MARKET_STATS.KPMG_HIDE.source}
            >
              {copy.support_stat}
            </p>
          )}

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
                        placeholder="email@company.com"
                        value={row.email}
                        onValueChange={(v) => updateRow(index, { email: v })}
                        size="md"
                        autoFocus={index === 0}
                        autoComplete="off"
                        aria-label={`Email for member ${index + 1}`}
                      />
                    </div>
                    <label
                      className={`flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] border px-3 ts-body font-medium transition-colors ${
                        row.isAdmin
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "border-[var(--hairline)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                      }`}
                      title="Mark as an organization admin (can invite more people, see billing, and more)"
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
                        aria-label={`Remove member ${index + 1}`}
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

              <AppleButton
                type="button"
                onPress={addRow}
                aria-label="Add another member"
                tone="secondary"
                size="lg"
                className={SECONDARY_BUTTON_CLASS}
              >
                <span className="inline-flex items-center gap-2.5 whitespace-nowrap">
                  <AppleIcon name="users" size="sm" />
                  Add member
                </span>
              </AppleButton>

              <p className="mt-3 ts-footnote text-[var(--text-tertiary)]">
                {copy.invite_later_note}
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
                <div
                  className={`mx-auto h-16 w-16 rounded-full grid place-items-center ${
                    allSent ? "bg-[var(--band-a-bg)]" : "bg-[var(--band-b-bg)]"
                  }`}
                >
                  <AppleIcon
                    name="check"
                    size="lg"
                    className={
                      allSent
                        ? "text-[var(--band-a-text)]"
                        : "text-[var(--band-b-text)]"
                    }
                  />
                </div>
                <h2 className="display display-tight mt-7 ts-title-1 text-[var(--text-primary)]">
                  {copy.sent_headline_template(result.sent, result.manual.length)}
                </h2>
                <p className="mt-4 ts-body text-[var(--text-secondary)] leading-[1.55]">
                  {allSent ? copy.sent_body : copy.manual_share_note}
                </p>
              </div>

              {result.manual.length > 0 && (
                <div className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-4 text-left">
                  <div className="eyebrow mb-2">Share manually</div>
                  <ul className="ts-subhead text-[var(--text-secondary)] space-y-2">
                    {result.manual.map((m, i) => (
                      <li key={i} className="break-all">
                        <span className="font-medium text-[var(--text-primary)]">
                          {m.email}
                        </span>
                        {m.link ? (
                          <span className="block select-all text-[var(--text-tertiary)]">
                            {m.link}
                          </span>
                        ) : (
                          <span className="block text-[var(--text-tertiary)]">
                            Invitation created — resend it from the dashboard.
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.skipped.length > 0 && (
                <div className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-4 text-left">
                  <div className="eyebrow mb-2">{copy.skipped_eyebrow}</div>
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
                  {copy.invite_more_cta}
                </AppleButton>
                <AppleSlideButton onClick={onContinueToBilling}>
                  {copy.finish_cta}
                </AppleSlideButton>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </>
  );
}
