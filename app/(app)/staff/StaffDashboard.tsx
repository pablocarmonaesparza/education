"use client";

/**
 * Dashboard compartido por /staff y /staff/equipo.
 *
 * Lee /api/dashboard que agrega:
 *   - team del user
 *   - sprint activo
 *   - members + sus sessions/reports
 *   - aggregate (bands, dim averages, risk count)
 *
 * Si el user es un employee sin manager scope, vera la vista limitada
 * (sólo su propia session). Para una UI separada de "employee home" en
 * el futuro, se puede router-split.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AppleBadge,
  AppleButton,
  AppleButtonLink,
  AppleCard,
  AppleCardBody,
  AppleEmptyState,
  AppleErrorState,
  AppleEyebrowChip,
  AppleIcon,
  AppleProgress,
  AppleSkeleton,
  cn,
} from "@/components/simulador/apple";
import { motion } from "framer-motion";
import { InviteTeamModal } from "@/components/simulador/InviteTeamModal";
import {
  BAND_REPRESENTATIVE_SCORE,
  bandFromScore100,
  DIMENSIONS,
  MANAGER_ACTIONS,
} from "@/lib/simulador/config";
import type { BandKey } from "@/lib/simulador/config";
import { MARKET_STATS } from "@/lib/simulador/copy/market-stats";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

function bandTone(b: BandKey | null) {
  if (b === "A")
    return {
      bg: "bg-[var(--band-a-bg)]",
      text: "text-[var(--band-a-text)]",
    };
  if (b === "M")
    return {
      bg: "bg-[var(--band-m-bg)]",
      text: "text-[var(--band-m-text)]",
    };
  if (b === "B")
    return {
      bg: "bg-[var(--band-b-bg)]",
      text: "text-[var(--band-b-text)]",
    };
  return {
    bg: "bg-[var(--surface-3)]",
    text: "text-[var(--text-tertiary)]",
  };
}

/** Token de barra por banda: stroke del anillo de progreso en member cards. */
const BAND_BAR: Record<BandKey, string> = {
  A: "var(--band-a-bar)",
  M: "var(--band-m-bar)",
  B: "var(--band-b-bar)",
};

/** Tono de AppleBadge para cada acción recomendada (espejo de `color`). */
const REC_BADGE_TONE: Record<
  (typeof MANAGER_ACTIONS)[number]["color"],
  "success" | "accent" | "warning" | "danger"
> = {
  success: "success",
  primary: "accent",
  warning: "warning",
  danger: "danger",
};

const BAND_ROWS: Array<{
  band: BandKey;
  label: string;
  description: string;
}> = [
  {
    band: "A",
    label: "High band",
    description: "Can run AI solo or take on wider scope.",
  },
  {
    band: "M",
    label: "Medium band",
    description: "Needs practice before working autonomously.",
  },
  {
    band: "B",
    label: "Low band",
    description: "Pause sensitive flows and remediate.",
  },
];

interface DashboardMember {
  user_id: string;
  full_name: string | null;
  email: string;
  session_id: string | null;
  session_status:
    | "not_started"
    | "in_progress"
    | "paused"
    | "submitted"
    | "evaluated"
    | "completed";
  session_duration_min: number | null;
  readiness_band: BandKey | null;
  dimension_bands: Record<string, BandKey> | null;
  recommendation_action: "pilotar" | "entrenar" | "pausar" | "escalar" | null;
  risk_events_count: number;
  high_risk_events_count: number;
  report_id: string | null;
  report_status: string | null;
  /* Contrato extendido (/api/dashboard). Opcionales a propósito: la UI
     consume con ?? fallback para funcionar aun si el API viejo no los manda. */
  readiness_score?: number | null;
  practice_completed_total?: number;
  practice_completed_week?: number;
  last_active_at?: string | null;
}

interface DashboardData {
  viewer_role?: string;
  team: { id: string; name: string } | null;
  sprint: {
    id: string;
    name: string;
    status: string;
    start_date: string | null;
    end_date: string | null;
  } | null;
  available_cases: Array<{
    slug: string;
    title: string;
    difficulty: string | null;
    duration_estimate_min: number | null;
  }>;
  members: DashboardMember[];
  aggregate: {
    total: number;
    completed: number;
    in_progress: number;
    not_started: number;
    completion_pct: number;
    readiness_by_band: Record<"A" | "M" | "B", number>;
    dimensions_avg: Record<string, number>;
    dimension_band_matrix: Record<string, Record<"A" | "M" | "B", number>>;
    risk_events_total: number;
    high_risk_events_total: number;
    pending_review_count: number;
    recommendation_counts: Record<"pilotar" | "entrenar" | "pausar" | "escalar", number>;
    days_left: number | null;
    /* Contrato extendido (/api/dashboard). Opcionales a propósito: la UI
       consume con ?? fallback para funcionar aun si el API viejo no los manda. */
    activity_by_week?: Array<{
      week_start: string;
      assessments: number;
      practice: number;
    }>;
    practice_completed_total?: number;
    practice_completed_week?: number;
    active_this_week?: number;
  };
}

function initialsFrom(name: string | null, email: string): string {
  if (name) {
    return name
      .split(/\s+/)
      .map((p) => p[0] ?? "")
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function statusLabel(status: DashboardMember["session_status"]): {
  label: string;
  classNames: string;
  dot?: boolean;
} {
  if (
    status === "submitted" ||
    status === "evaluated" ||
    status === "completed"
  ) {
    return {
      label: "Completed",
      classNames: "text-[var(--band-a-text)]",
    };
  }
  if (status === "in_progress" || status === "paused") {
    return {
      label: "In progress",
      classNames: "text-[var(--band-m-text)] flex items-center gap-1",
      dot: true,
    };
  }
  return {
    label: "Not started",
    classNames: "text-[var(--text-tertiary)]",
  };
}

/** Circunferencia de los anillos de progreso (r=30: hero viewBox 72,
 *  member cards viewBox 68). */
const RING_CIRCUMFERENCE = 2 * Math.PI * 30;

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "YYYY-MM-DD" → "Jun 2" (parse manual: nada de new Date(), cero TZ drift). */
function weekLabel(weekStart: string): string {
  const [, m, d] = weekStart.split("-").map(Number);
  if (!m || !d || !MONTHS_SHORT[m - 1]) return weekStart;
  return `${MONTHS_SHORT[m - 1]} ${d}`;
}

/** Días completos desde un ISO timestamp; null si no hay dato o no parsea. */
function daysSinceIso(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((Date.now() - t) / 86_400_000));
}

/** Sesión abierta sin actividad hace más de 7 días. */
function isStalledOpen(m: DashboardMember): boolean {
  return (
    (m.session_status === "in_progress" || m.session_status === "paused") &&
    (daysSinceIso(m.last_active_at) ?? 0) > 7
  );
}

/** Regla del hero y del filtro: quién necesita atención del manager. */
function needsAttention(m: DashboardMember): boolean {
  return (
    m.recommendation_action === "pausar" ||
    m.recommendation_action === "escalar" ||
    m.session_status === "not_started" ||
    isStalledOpen(m)
  );
}

/** Dimensión más débil del member: primera con banda B, si no la primera M. */
function focusDimension(m: DashboardMember) {
  const bands = m.dimension_bands;
  if (!bands) return null;
  return (
    DIMENSIONS.find((d) => bands[d.id] === "B") ??
    DIMENSIONS.find((d) => bands[d.id] === "M") ??
    null
  );
}

/** Label de la dimensión más débil (tabla del home + member cards). */
function focusDimensionLabel(m: DashboardMember): string | null {
  return focusDimension(m)?.label ?? null;
}

/** Línea de estado de la fila individual. */
function memberStatusLine(m: DashboardMember): string {
  if (m.session_status === "in_progress" || m.session_status === "paused") {
    return m.session_duration_min
      ? `In progress · ${m.session_duration_min} min`
      : "In progress";
  }
  if (m.session_status === "not_started") return "Not started";
  const days = daysSinceIso(m.last_active_at);
  if (days === null) return "Completed";
  if (days === 0) return "Active today";
  return `Last active ${days}d ago`;
}

/** Throttle del recordatorio: 24h por persona, en localStorage (sin BD). */
const REMIND_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const remindStorageKey = (userId: string) => `itera_remind_${userId}`;

function wasRemindedRecently(userId: string): boolean {
  try {
    const raw = window.localStorage.getItem(remindStorageKey(userId));
    if (!raw) return false;
    const sentAt = Number(raw);
    return !Number.isNaN(sentAt) && Date.now() - sentAt < REMIND_COOLDOWN_MS;
  } catch {
    return false;
  }
}

/**
 * Botón "Remind" real: POST /api/notifications/remind → email al empleado con
 * el transporte AgentMail existente. Estados: idle → loading → sent (queda
 * "Reminded ✓" deshabilitado 24h vía localStorage) o error (permite retry).
 * Local a este dashboard a propósito: compone AppleButton, no es primitivo
 * nuevo del design system.
 */
function RemindButton({
  userId,
  className,
}: {
  userId: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );

  // localStorage solo post-mount (SSR-safe).
  useEffect(() => {
    if (wasRemindedRecently(userId)) setState("sent");
  }, [userId]);

  const send = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch("/api/notifications/remind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const d = await res.json().catch(() => null);
      if (!res.ok || !d?.sent) {
        throw new Error(d?.error ?? "send failed");
      }
      try {
        window.localStorage.setItem(
          remindStorageKey(userId),
          String(Date.now()),
        );
      } catch {
        // localStorage puede fallar (private mode); el email ya salió igual.
      }
      setState("sent");
    } catch {
      setState("error");
    }
  }, [userId]);

  return (
    <AppleButton
      tone="danger"
      size="sm"
      className={className}
      isDisabled={state === "sent"}
      isLoading={state === "loading"}
      onPress={send}
      title={
        state === "error"
          ? "The reminder didn't send. Tap to try again."
          : state === "sent"
            ? "Reminder sent. You can send another one in 24 hours."
            : "Email this person a reminder to complete their assessment"
      }
    >
      {state === "sent"
        ? "Reminded ✓"
        : state === "error"
          ? "Retry"
          : "Remind"}
    </AppleButton>
  );
}

function EmployeeDashboard({ data }: { data: DashboardData }) {
  const member = data.members[0] ?? null;
  const status = member ? statusLabel(member.session_status) : null;
  const hasStarted = !!member?.session_id;
  const hasReport = !!member?.session_id && !!member?.report_id;
  const availableCases = data.available_cases ?? [];

  return (
    <>
      
      <main className="surface-canvas min-h-screen pb-24">
        <section className="border-b border-[var(--hairline)] surface-canvas">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <motion.div {...fadeUp}>
              <h1 className="display display-tight ts-display sm:ts-display-lg text-[var(--text-primary)]">
                Available cases
              </h1>
            </motion.div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 mt-10">
          {availableCases.length === 0 ? (
            <motion.div
              {...fadeUp}
              className="card-apple bg-[var(--surface)] p-8 ts-body text-[var(--text-secondary)]"
            >
              You don&apos;t have any cases assigned yet.
            </motion.div>
          ) : (
            <div className="space-y-3">
              {availableCases.map((caseItem, index) => {
                const currentStatus = index === 0 ? status : null;
                const showReport = index === 0 && hasReport;
                return (
                  <motion.div
                    key={caseItem.slug}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: index * 0.04 }}
                  >
                    <AppleCard>
                      <AppleCardBody className="p-7 sm:p-8">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                          <div className="min-w-0">
                            <div className="eyebrow">
                              Case {String(index + 1).padStart(2, "0")}
                              {caseItem.difficulty
                                ? ` · ${caseItem.difficulty}`
                                : ""}
                            </div>
                            <h2 className="display mt-3 ts-title-1 text-[var(--text-primary)]">
                              {caseItem.title}
                            </h2>
                            <p className="mt-3 ts-body text-[var(--text-secondary)] leading-[1.55]">
                              {caseItem.duration_estimate_min ?? 18} minutes ·
                              Context, Data, AI, Review, Decision, and
                              Response.
                            </p>
                            {currentStatus && (
                              <div
                                className={`mt-4 ts-subhead ${currentStatus.classNames}`}
                              >
                                {currentStatus.label}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 md:flex-shrink-0">
                            {showReport && (
                              <AppleButtonLink
                                href={`/report/${member.session_id}`}
                                tone="secondary"
                                className="h-12"
                              >
                                View report
                              </AppleButtonLink>
                            )}
                            <AppleButtonLink
                              href={`/case/${caseItem.slug}`}
                              tone="primary"
                              className="h-12 px-7"
                            >
                              {currentStatus && hasStarted
                                ? "Continue case"
                                : "Start case"}
                            </AppleButtonLink>
                          </div>
                        </div>
                      </AppleCardBody>
                    </AppleCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default function StaffDashboard({
  section = "inicio",
}: {
  section?: "inicio" | "equipo" | "matriz" | "recomendaciones" | "reportes";
}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Filtro de la tabla "Individual performance" (sección inicio). Vive aquí
  // arriba porque los hooks no pueden ir después de los early returns.
  const [rosterFilter, setRosterFilter] = useState<"all" | "attention">("all");

  // W2-D — UI de invitar desde el dashboard. Sondeo de permisos: el GET de
  // /api/orgs/current/settings resuelve 200 SOLO para org_admin (mismo gate
  // que POST/GET de invitaciones), así que decide si mostramos el botón
  // "Invite people" y la checklist de arranque. Nota: /api/dashboard no
  // devuelve viewer_role cuando team/sprint son null, por eso el empty state
  // no puede apoyarse en él y usa este sondeo.
  const [inviteGate, setInviteGate] = useState<"loading" | "admin" | "none">(
    "loading",
  );
  const [inviteOrgId, setInviteOrgId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteCounts, setInviteCounts] = useState({
    accepted: 0,
    pending: 0,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/orgs/current/settings", {
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) setInviteGate("none");
          return;
        }
        const d = await res.json().catch(() => null);
        const orgId: string | null = d?.organization?.id ?? null;
        if (cancelled) return;
        setInviteOrgId(orgId);
        setInviteGate(orgId ? "admin" : "none");
      } catch {
        if (!cancelled) setInviteGate("none");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Contadores reales de invitaciones (GET nuevo). Arrancan en 0/0 y se
  // refrescan al resolver la org y después de cada envío del modal.
  const refreshInviteCounts = useCallback(async () => {
    if (!inviteOrgId) return;
    try {
      const res = await fetch(`/api/orgs/${inviteOrgId}/invitations`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const d = await res.json().catch(() => null);
      setInviteCounts({
        accepted: d?.counts?.accepted ?? 0,
        pending: d?.counts?.pending ?? 0,
      });
    } catch {
      // Silencioso: los contadores se quedan como estén (0/0 al inicio).
    }
  }, [inviteOrgId]);

  useEffect(() => {
    refreshInviteCounts();
  }, [refreshInviteCounts]);

  const load = useCallback(async () => {
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? `Error ${res.status}`);
      }
      const d = (await res.json()) as DashboardData;
      setData(d);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <>
        
        <main className="surface-canvas min-h-screen grid place-items-center px-6">
          <div className="w-full max-w-md">
            <AppleErrorState
              title="We couldn't load the dashboard"
              body={error}
              onAction={load}
            />
          </div>
        </main>
      </>
    );
  }

  if (!data) {
    return (
      <>
        
        <main className="surface-canvas min-h-screen pb-24">
          <section className="max-w-6xl mx-auto px-6 py-12">
            <AppleSkeleton className="h-10 w-72" />
            <AppleSkeleton className="mt-4 h-4 w-96" />
          </section>
          <section className="max-w-6xl mx-auto px-6 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-8"
                >
                  <AppleSkeleton className="h-3 w-28" />
                  <AppleSkeleton className="mt-4 h-9 w-24" />
                  <AppleSkeleton className="mt-4 h-1 w-full" />
                  <AppleSkeleton className="mt-4 h-3 w-40" />
                </div>
              ))}
            </div>
          </section>
          <section className="max-w-6xl mx-auto px-6 mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-5 rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-5"
                >
                  <AppleSkeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <AppleSkeleton className="h-4 w-40" />
                    <AppleSkeleton className="mt-2 h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </>
    );
  }

  // Empty state si no hay team/sprint. /api/dashboard NO manda viewer_role en
  // este caso, así que la variante (manager vs employee) sale del sondeo de
  // org_admin (inviteGate) — el mismo permiso que gobierna invitar.
  if (!data.team || !data.sprint) {
    // Sondeo en vuelo: esqueleto breve para no parpadear entre variantes.
    if (inviteGate === "loading") {
      return (
        <>

          <main className="surface-canvas min-h-screen grid place-items-center px-6 py-20">
            <div className="w-full max-w-2xl">
              <AppleSkeleton className="h-10 w-72" />
              <AppleSkeleton className="mt-4 h-4 w-96" />
              <AppleSkeleton className="mt-8 h-64 w-full rounded-[var(--radius-lg)]" />
            </div>
          </main>
        </>
      );
    }

    // Manager (org_admin) sin gente todavía: checklist de arranque con estado
    // real de invitaciones — la promesa del onboarding ("invite later from
    // the dashboard") se cumple aquí.
    if (inviteGate === "admin") {
      return (
        <>

          <main className="surface-canvas min-h-screen px-6 py-16">
            <motion.div {...fadeUp} className="mx-auto w-full max-w-2xl">
              <AppleEyebrowChip className="mb-5">
                Getting started
              </AppleEyebrowChip>
              <h1 className="display display-tight ts-title-1 sm:ts-display text-[var(--text-primary)]">
                Your dashboard is ready — your team is next
              </h1>
              <p className="mt-3 ts-body text-[var(--text-secondary)] leading-[1.55]">
                Reports land here as soon as people take their first case.
                Three steps to get there.
              </p>

              <div className="mt-8 card-apple bg-[var(--surface)] p-6 sm:p-8">
                <ol className="space-y-7">
                  <li className="flex items-start gap-4">
                    <span
                      aria-hidden
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-strong)] ts-callout font-extrabold text-white"
                    >
                      1
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="ts-callout font-extrabold text-[var(--text-primary)]">
                        Invite your team
                      </div>
                      <p className="mt-1 ts-footnote font-medium leading-[1.5] text-[var(--text-secondary)]">
                        Each person gets an email with a private link. Their
                        first assessment starts there.
                      </p>
                      <AppleButton
                        tone="primary"
                        size="sm"
                        className="mt-3"
                        onPress={() => setInviteOpen(true)}
                      >
                        Invite people
                      </AppleButton>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span
                      aria-hidden
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-3)] ts-callout font-extrabold text-[var(--text-secondary)]"
                    >
                      2
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="ts-callout font-extrabold text-[var(--text-primary)]">
                        They accept and take a case
                      </div>
                      <p className="mt-1 ts-footnote font-medium leading-[1.5] text-[var(--text-secondary)]">
                        Track acceptance here — no chasing over email.
                      </p>
                      <div className="mt-3 inline-flex rounded-full bg-[var(--surface-2)] px-3 py-1 ts-footnote font-bold text-[var(--text-secondary)]">
                        {inviteCounts.accepted} accepted ·{" "}
                        {inviteCounts.pending} pending
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span
                      aria-hidden
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-3)] ts-callout font-extrabold text-[var(--text-secondary)]"
                    >
                      3
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="ts-callout font-extrabold text-[var(--text-primary)]">
                        First reports land here
                      </div>
                      <p className="mt-1 ts-footnote font-medium leading-[1.5] text-[var(--text-secondary)]">
                        Readiness bands, risk events, and who needs practice —
                        per person, with no extra setup.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              {/* Stat de mercado: figura+fuente SIEMPRE desde market-stats.ts
                  (fuente única) — nunca hardcodear la cifra en el JSX. */}
              <p className="mt-6 ts-footnote font-medium leading-[1.5] text-[var(--text-tertiary)]">
                <span
                  title={MARKET_STATS.MCKINSEY_3X.source}
                  className="cursor-help underline decoration-dotted underline-offset-4"
                >
                  Teams use AI about 3x more than their managers estimate.
                </span>{" "}
                Your first round shows you where you actually stand.
              </p>
            </motion.div>
          </main>
          {inviteOrgId && (
            <InviteTeamModal
              isOpen={inviteOpen}
              onOpenChange={setInviteOpen}
              orgId={inviteOrgId}
              onInvited={refreshInviteCounts}
            />
          )}
        </>
      );
    }

    // Employee sin team: pedir el invite al admin. Nunca mandarlo a
    // /onboarding/org — acabaría creando una org propia por accidente.
    return (
      <>

        <main className="surface-canvas min-h-screen grid place-items-center px-6 py-20">
          <motion.div {...fadeUp} className="w-full max-w-md">
            <AppleEmptyState
              title={
                data.team ? "No active round yet" : "You're not on a team yet"
              }
              description={
                data.team
                  ? "Your team exists but has no assessment round yet. Ask your admin to start one."
                  : "Ask your admin for an invite. Your cases and reports will show up here once you join a team."
              }
            />
          </motion.div>
        </main>
      </>
    );
  }

  const canManage = ["manager", "admin", "org_admin"].includes(
    data.viewer_role ?? "employee",
  );

  if (!canManage) {
    return <EmployeeDashboard data={data} />;
  }

  const agg = data.aggregate;
  const completionPct = agg.completion_pct;
  const dimsAvg = agg.dimensions_avg;
  const avgReadiness = Math.round(
    DIMENSIONS.reduce((acc, d) => acc + (dimsAvg[d.id] ?? 0), 0) /
      DIMENSIONS.length,
  );
  const reportsAvailable = data.members.filter(
    (member) => member.session_id && member.report_id,
  );

  /* ——— Derivados de la sección inicio (todo dato real del API, con fallback) ——— */
  const activityByWeek = agg.activity_by_week ?? [];
  const activeThisWeek = agg.active_this_week ?? 0;
  const adoptionPct =
    agg.total > 0 ? Math.round((activeThisWeek / agg.total) * 100) : 0;
  const teamPracticeTotal = agg.practice_completed_total ?? 0;
  const teamPracticeWeek = agg.practice_completed_week ?? 0;

  const attentionMembers = data.members.filter(needsAttention);
  const attentionCount = attentionMembers.length;

  const weakestDim =
    agg.completed > 0
      ? DIMENSIONS.reduce(
          (worst, d) =>
            (dimsAvg[d.id] ?? 0) < (dimsAvg[worst.id] ?? 0) ? d : worst,
          DIMENSIONS[0],
        )
      : null;
  const weakestAvg = weakestDim ? (dimsAvg[weakestDim.id] ?? 0) : 0;
  const weakestBelowHigh = weakestDim
    ? (agg.dimension_band_matrix?.[weakestDim.id]?.B ?? 0) +
      (agg.dimension_band_matrix?.[weakestDim.id]?.M ?? 0)
    : 0;

  // Chart "Team activity": alturas proporcionales al máximo de ambas series.
  const hasActivity = activityByWeek.some(
    (w) => (w.assessments ?? 0) > 0 || (w.practice ?? 0) > 0,
  );
  const maxActivity = Math.max(
    1,
    ...activityByWeek.map((w) => Math.max(w.assessments ?? 0, w.practice ?? 0)),
  );
  const activityBarHeight = (value: number) =>
    value > 0 ? Math.max(4, Math.round((value / maxActivity) * 144)) : 2;

  // Sparkline del KPI de práctica (8 barras, h-8 = 32px).
  const sparkValues =
    activityByWeek.length > 0
      ? activityByWeek.map((w) => w.practice ?? 0)
      : Array.from({ length: 8 }, () => 0);
  const sparkMax = Math.max(1, ...sparkValues);

  const rosterMembers =
    rosterFilter === "attention" ? attentionMembers : data.members;

  // "Needs a push": hasta 4 filas priorizadas, sin duplicar persona.
  const pushRows: Array<{
    member: DashboardMember;
    subtext: string;
    action: "report" | "remind" | "pilot";
  }> = [];
  const pushSeen = new Set<string>();
  const pushAdd = (
    member: DashboardMember,
    subtext: string,
    action: "report" | "remind" | "pilot",
  ) => {
    if (pushRows.length >= 4 || pushSeen.has(member.user_id)) return;
    pushSeen.add(member.user_id);
    pushRows.push({ member, subtext, action });
  };
  for (const m of data.members) {
    if (
      (m.recommendation_action === "pausar" ||
        m.recommendation_action === "escalar") &&
      m.session_id
    ) {
      pushAdd(
        m,
        m.high_risk_events_count > 0
          ? `${m.high_risk_events_count} high-risk events · pause AI on sensitive flows`
          : "Pause AI on sensitive flows",
        "report",
      );
    }
  }
  for (const m of data.members) {
    if (m.session_status === "not_started") {
      pushAdd(m, "Hasn't started their assessment", "remind");
    }
  }
  for (const m of data.members) {
    if (isStalledOpen(m)) {
      pushAdd(
        m,
        `No activity in ${daysSinceIso(m.last_active_at) ?? 0} days`,
        "remind",
      );
    }
  }
  for (const m of data.members) {
    if (m.readiness_band === "A" && m.session_id && m.report_id) {
      pushAdd(m, "Ready to pilot solo", "pilot");
    }
  }

  return (
    <>
      
      <main className="surface-canvas min-h-screen pb-24">
        {/* Header */}
        <section className="border-b border-[var(--hairline)] surface-canvas">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <motion.div
              {...fadeUp}
              className="flex flex-wrap items-start justify-between gap-6"
            >
              {/* El h1 es el EQUIPO, no la ronda: el modelo es continuo.
                  La ronda de assessment (data.sprint en BD) se demueve a un
                  chip discreto en la meta line. */}
              <div className="min-w-0">
                <AppleEyebrowChip className="mb-5">Team pulse</AppleEyebrowChip>
                <h1 className="display display-tight ts-display sm:ts-display-lg font-extrabold text-[var(--text-primary)]">
                  {data.team.name}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-3 ts-subhead font-medium text-[var(--text-secondary)]">
                  <span>
                    <span className="text-[var(--text-primary)] font-bold">
                      {agg.total}
                    </span>{" "}
                    members
                  </span>
                  <span className="text-[var(--border-strong)]">·</span>
                  <span>
                    <span className="text-[var(--text-primary)] font-bold">
                      {agg.active_this_week ?? 0}
                    </span>{" "}
                    active this week
                  </span>
                  <span className="text-[var(--border-strong)]">·</span>
                  <span>
                    <span className="text-[var(--text-primary)] font-bold">
                      {agg.completed}
                    </span>{" "}
                    assessed
                  </span>
                  {data.sprint && (
                    <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 ts-caption-1 font-bold text-[var(--text-tertiary)]">
                      Round: {data.sprint.name}
                    </span>
                  )}
                </div>
              </div>
              {/* W2-D: invitar desde el dashboard. Secondary a propósito —
                  el CTA fuerte del hero sigue siendo "Review reports". Solo
                  aparece si el sondeo confirmó permisos de org_admin. */}
              {inviteGate === "admin" && (
                <AppleButton
                  tone="secondary"
                  className="shrink-0"
                  onPress={() => setInviteOpen(true)}
                >
                  <AppleIcon name="users" size="sm" aria-hidden />
                  Invite people
                </AppleButton>
              )}
            </motion.div>
          </div>
        </section>

        {section === "inicio" && (
        <>
        {/* 1) Hero band — evolución de la banda de stats: anillo de progreso,
            headline con el estado de la ronda de assessment, chips de contexto
            y CTA blanco con labio hacia los reportes. Mismo gradiente v2. */}
        <section className="max-w-6xl mx-auto px-6 mt-8">
          <motion.div
            {...fadeUp}
            className="overflow-hidden rounded-[var(--radius-2xl)] text-white shadow-card"
            style={{
              background:
                "linear-gradient(135deg, var(--accent-deep), var(--accent-strong))",
            }}
          >
            <div className="flex flex-col gap-8 px-8 py-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                {/* Anillo de progreso: stroke blanco sobre track white/25 */}
                <div
                  role="img"
                  aria-label={`${completionPct}% of assessments completed`}
                  className="relative h-[72px] w-[72px] shrink-0"
                >
                  <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
                    <circle
                      cx="36"
                      cy="36"
                      r="30"
                      fill="none"
                      strokeWidth="8"
                      className="stroke-white/25"
                    />
                    {completionPct > 0 && (
                      <circle
                        cx="36"
                        cy="36"
                        r="30"
                        fill="none"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={RING_CIRCUMFERENCE}
                        strokeDashoffset={
                          RING_CIRCUMFERENCE *
                          (1 - Math.min(100, completionPct) / 100)
                        }
                        className="stroke-white"
                      />
                    )}
                  </svg>
                  <span className="absolute inset-0 grid place-items-center ts-footnote font-extrabold">
                    {completionPct}%
                  </span>
                </div>
                <div className="min-w-0">
                  <h2 className="display ts-title-1 font-extrabold">
                    {agg.completed} of {agg.total} assessed
                  </h2>
                  <p className="mt-1 ts-callout font-medium text-white/75">
                    {attentionCount === 0
                      ? "Everyone is on track"
                      : attentionCount === 1
                        ? "1 person needs your attention"
                        : `${attentionCount} need your attention`}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {agg.completed > 0 && (
                      <span className="rounded-full bg-white/15 px-3 py-1 ts-footnote font-bold text-white">
                        {avgReadiness}/100 avg readiness
                      </span>
                    )}
                    <span className="rounded-full bg-white/15 px-3 py-1 ts-footnote font-bold text-white">
                      {agg.risk_events_total} risk events
                    </span>
                    {agg.days_left !== null && (
                      <span className="rounded-full bg-white/15 px-3 py-1 ts-footnote font-bold text-white">
                        {agg.days_left} days left in round
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {/* CTA blanco con labio 3D (press hundido, mismo gesto que
                  AppleButton primary pero invertido para vivir sobre accent) */}
              <Link
                href="/staff/reportes"
                className="inline-flex shrink-0 items-center justify-center self-start rounded-[var(--radius-md)] bg-white px-5 py-3 ts-body font-extrabold text-[var(--accent-strong)] shadow-[0_4px_0_var(--accent-deep)] transition-[transform,box-shadow] duration-[var(--motion-fast)] ease-[var(--motion-ease)] hover:brightness-95 active:translate-y-[4px] active:shadow-none lg:self-center"
              >
                Review reports →
              </Link>
            </div>
          </motion.div>
        </section>

        {/* 2) KPI row — adopción semanal, práctica, readiness y riesgo */}
        <section className="max-w-6xl mx-auto px-6 mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.05 }}
              className="card-apple bg-[var(--surface)] p-5"
            >
              <div className="ts-footnote font-bold text-[var(--text-tertiary)]">
                Weekly adoption
              </div>
              <div className="display mt-2 ts-title-1 font-extrabold text-[var(--text-primary)]">
                {adoptionPct}%
              </div>
              <AppleProgress
                aria-label="Weekly adoption"
                value={adoptionPct}
                className="mt-3"
              />
              <div className="mt-3 ts-footnote font-medium text-[var(--text-tertiary)]">
                {activeThisWeek} of {agg.total} active this week
              </div>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="card-apple bg-[var(--surface)] p-5"
            >
              <div className="ts-footnote font-bold text-[var(--text-tertiary)]">
                Practice completed
              </div>
              <div className="mt-2 flex items-end justify-between gap-3">
                <div className="display ts-title-1 font-extrabold text-[var(--text-primary)]">
                  {teamPracticeTotal}
                </div>
                {/* Sparkline: práctica por semana (8 barras) */}
                <div aria-hidden className="flex h-8 items-end gap-1">
                  {sparkValues.map((value, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1.5 rounded-t-full",
                        i === sparkValues.length - 1
                          ? "accent-bg"
                          : "bg-[var(--accent-soft)]",
                      )}
                      style={{
                        height:
                          value > 0
                            ? Math.max(4, Math.round((value / sparkMax) * 32))
                            : 2,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div
                className={cn(
                  "mt-3 ts-footnote",
                  teamPracticeWeek > 0
                    ? "font-bold text-[var(--band-a-text)]"
                    : "font-medium text-[var(--text-tertiary)]",
                )}
              >
                {teamPracticeWeek > 0
                  ? `▲ ${teamPracticeWeek} this week`
                  : "No practice this week"}
              </div>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.15 }}
              className="card-apple bg-[var(--surface)] p-5"
            >
              <div className="ts-footnote font-bold text-[var(--text-tertiary)]">
                Average readiness
              </div>
              <div className="display mt-2 ts-title-1 font-extrabold text-[var(--text-primary)]">
                {avgReadiness}
                <span className="ts-callout font-bold text-[var(--text-tertiary)]">
                  /100
                </span>
              </div>
              <AppleProgress
                aria-label="Average readiness"
                value={avgReadiness}
                className="mt-3"
              />
              <div
                className={cn(
                  "mt-3 ts-footnote font-medium",
                  weakestDim && weakestAvg < 65
                    ? "text-[var(--band-b-text)]"
                    : "text-[var(--text-tertiary)]",
                )}
              >
                {weakestDim
                  ? `Lowest: ${weakestDim.label.charAt(0).toUpperCase()}${weakestDim.label.slice(1)}`
                  : "No completed sessions yet"}
              </div>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.2 }}
              className="card-apple bg-[var(--surface)] p-5"
            >
              <div className="ts-footnote font-bold text-[var(--text-tertiary)]">
                Risk events
              </div>
              <div
                className={cn(
                  "display mt-2 ts-title-1 font-extrabold",
                  agg.risk_events_total > 0
                    ? "text-[var(--band-b-text)]"
                    : "text-[var(--text-primary)]",
                )}
              >
                {agg.risk_events_total}
              </div>
              {/* Con 0 completadas el verde "positivo" sería prematuro:
                  neutro hasta que exista evidencia. */}
              <div
                className={cn(
                  "mt-3 ts-footnote",
                  agg.high_risk_events_total > 0
                    ? "font-bold text-[var(--band-b-text)]"
                    : agg.completed > 0
                      ? "font-medium text-[var(--band-a-text)]"
                      : "font-medium text-[var(--text-tertiary)]",
                )}
              >
                {agg.high_risk_events_total > 0
                  ? `${agg.high_risk_events_total} high severity`
                  : agg.risk_events_total > 0
                    ? "No high severity events"
                    : agg.completed > 0
                      ? "None detected in completed sessions"
                      : "No completed sessions yet"}
              </div>
            </motion.div>
          </div>
        </section>

        {/* 3) Grid principal: actividad + tabla individual | skills + push */}
        <section className="max-w-6xl mx-auto px-6 mt-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px] xl:items-start">
            <div className="min-w-0 space-y-4">
              {/* a) Team activity — chart de barras CSS puro, 8 semanas */}
              <motion.div
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.1 }}
                className="card-apple bg-[var(--surface)] p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="ts-headline font-extrabold text-[var(--text-primary)]">
                    Team activity
                  </h3>
                  <div className="flex items-center gap-4 ts-footnote font-medium text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1.5">
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-full accent-bg"
                      />
                      Assessments
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)]"
                      />
                      Practice
                    </span>
                  </div>
                </div>
                {hasActivity ? (
                  <div className="mt-6 flex items-end gap-2 sm:gap-3">
                    {activityByWeek.map((week, i) => {
                      const isCurrent = i === activityByWeek.length - 1;
                      return (
                        <div
                          key={week.week_start || i}
                          className="flex min-w-0 flex-1 flex-col items-center gap-2"
                        >
                          <div className="flex h-36 w-full items-end justify-center gap-1">
                            <div
                              className={cn(
                                "w-2.5 rounded-t-full accent-bg sm:w-3",
                                !isCurrent && "opacity-80",
                              )}
                              style={{
                                height: activityBarHeight(
                                  week.assessments ?? 0,
                                ),
                              }}
                            />
                            <div
                              className="w-2.5 rounded-t-full bg-[var(--accent-soft)] sm:w-3"
                              style={{
                                height: activityBarHeight(week.practice ?? 0),
                              }}
                            />
                          </div>
                          <span className="ts-caption-2 font-medium text-[var(--text-tertiary)]">
                            {weekLabel(week.week_start)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-6 ts-footnote text-[var(--text-tertiary)]">
                    Activity shows up here as your team practices.
                  </p>
                )}
              </motion.div>

              {/* b) Individual performance — tabla con filtro All / Needs attention */}
              <motion.div
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.15 }}
                className="card-apple bg-[var(--surface)] p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="ts-headline font-extrabold text-[var(--text-primary)]">
                    Individual performance
                  </h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRosterFilter("all")}
                      className={cn(
                        "rounded-full border px-3 py-1.5 ts-footnote font-bold transition-colors duration-[var(--motion-fast)]",
                        rosterFilter === "all"
                          ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "border-transparent bg-[var(--surface-2)] text-[var(--text-secondary)]",
                      )}
                    >
                      All · {data.members.length}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRosterFilter("attention")}
                      className={cn(
                        "rounded-full border px-3 py-1.5 ts-footnote font-bold transition-colors duration-[var(--motion-fast)]",
                        rosterFilter === "attention"
                          ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "border-transparent bg-[var(--surface-2)] text-[var(--text-secondary)]",
                      )}
                    >
                      Needs attention · {attentionCount}
                    </button>
                  </div>
                </div>

                {data.members.length === 0 ? (
                  <p className="mt-5 ts-footnote text-[var(--text-tertiary)]">
                    No team members yet.
                  </p>
                ) : rosterMembers.length === 0 ? (
                  <p className="mt-5 ts-footnote text-[var(--text-tertiary)]">
                    No one needs attention right now.
                  </p>
                ) : (
                  <div className="mt-4">
                    {/* Header solo en md+: en mobile cada fila apila sus labels */}
                    <div className="hidden pb-3 ts-footnote font-bold text-[var(--text-tertiary)] lg:grid lg:grid-cols-[minmax(0,1fr)_130px_84px_84px_minmax(104px,auto)] lg:items-center lg:gap-4">
                      <span>Member</span>
                      <span>Focus</span>
                      <span>Practice</span>
                      <span className="text-right">Readiness</span>
                      <span aria-hidden />
                    </div>
                    <div className="divide-y divide-[var(--hairline)]">
                      {rosterMembers.map((m) => {
                        const attention = needsAttention(m);
                        const initials = initialsFrom(m.full_name, m.email);
                        const displayName =
                          m.full_name ?? m.email.split("@")[0];
                        const focusLabel = focusDimensionLabel(m);
                        const tone = bandTone(m.readiness_band);
                        const stalled = isStalledOpen(m);
                        return (
                          <div
                            key={m.user_id}
                            className="-mx-3 flex flex-col gap-3 rounded-[var(--radius-md)] px-3 py-4 lg:mx-0 lg:grid lg:grid-cols-[minmax(0,1fr)_130px_84px_84px_minmax(104px,auto)] lg:items-center lg:gap-4 lg:rounded-none lg:px-0"
                            style={
                              attention
                                ? {
                                    backgroundColor:
                                      "color-mix(in srgb, var(--band-b-bg) 40%, transparent)",
                                  }
                                : undefined
                            }
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                aria-hidden
                                className={cn(
                                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full ts-footnote font-extrabold",
                                  attention
                                    ? "bg-[var(--band-b-bg)] text-[var(--band-b-text)]"
                                    : "bg-[var(--accent-soft)] text-[var(--accent)]",
                                )}
                              >
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <div className="ts-callout font-extrabold text-[var(--text-primary)] truncate">
                                  {displayName}
                                </div>
                                <div className="mt-0.5 ts-footnote font-medium text-[var(--text-tertiary)]">
                                  {memberStatusLine(m)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-3 md:block">
                              <span className="ts-footnote font-bold text-[var(--text-tertiary)] md:hidden">
                                Focus
                              </span>
                              <span className="ts-footnote font-bold text-[var(--text-secondary)]">
                                {focusLabel
                                  ? focusLabel.charAt(0).toUpperCase() +
                                    focusLabel.slice(1)
                                  : "—"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3 md:block">
                              <span className="ts-footnote font-bold text-[var(--text-tertiary)] md:hidden">
                                Practice
                              </span>
                              <span className="ts-footnote font-medium text-[var(--text-secondary)]">
                                {m.practice_completed_total ?? 0} drills
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3 md:justify-end">
                              <span className="ts-footnote font-bold text-[var(--text-tertiary)] md:hidden">
                                Readiness
                              </span>
                              <span
                                className={cn(
                                  "ts-callout font-extrabold",
                                  tone.text,
                                )}
                              >
                                {m.readiness_score != null
                                  ? m.readiness_score
                                  : "—"}
                              </span>
                            </div>
                            <div className="md:justify-self-end">
                              {m.session_id && m.report_id ? (
                                <AppleButton
                                  as={Link}
                                  href={`/report/${m.session_id}`}
                                  tone="secondary"
                                  size="sm"
                                >
                                  Open report
                                </AppleButton>
                              ) : m.session_status === "not_started" ||
                                stalled ? (
                                <RemindButton userId={m.user_id} />
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            <div className="space-y-4">
              {/* c) Team skills — promedios por dimensión con la más débil en foco */}
              <motion.div
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.2 }}
                className="card-apple bg-[var(--surface)] p-6"
              >
                <h3 className="ts-headline font-extrabold text-[var(--text-primary)]">
                  Team skills
                </h3>
                <div className="mt-5 space-y-4">
                  {DIMENSIONS.map((dimension) => {
                    const score = dimsAvg[dimension.id] ?? 0;
                    const isWeakest = weakestDim?.id === dimension.id;
                    const label =
                      dimension.label.charAt(0).toUpperCase() +
                      dimension.label.slice(1);
                    return (
                      <div key={dimension.id}>
                        <div className="flex items-baseline justify-between gap-3">
                          <span
                            className={cn(
                              "ts-callout font-bold",
                              isWeakest
                                ? "text-[var(--band-b-text)]"
                                : "text-[var(--text-primary)]",
                            )}
                          >
                            {label}
                            {isWeakest && " · focus"}
                          </span>
                          <span
                            className={cn(
                              "mono ts-footnote font-bold",
                              isWeakest
                                ? "text-[var(--band-b-text)]"
                                : "text-[var(--text-secondary)]",
                            )}
                          >
                            {score}/100
                          </span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface-3)]">
                          <motion.div
                            className={cn(
                              "h-full rounded-full",
                              isWeakest
                                ? "bg-[var(--band-b-bar)]"
                                : "accent-bg",
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{
                              duration: 0.7,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {weakestDim && weakestBelowHigh > 0 && (
                  <div className="mt-5 rounded-[var(--radius-md)] bg-[var(--band-b-bg)] p-4">
                    <div className="flex items-start gap-3">
                      <AppleIcon
                        name="alert"
                        size="sm"
                        className="mt-0.5 shrink-0 text-[var(--band-b-text)]"
                      />
                      {/* Acción honesta: el link va a los reportes del manager
                          (la evidencia del gap), no a la vista de práctica del
                          empleado — no existe workflow de "asignar práctica". */}
                      <div className="ts-footnote font-medium leading-[1.5] text-[var(--band-b-text)]">
                        {weakestBelowHigh === 1
                          ? "1 person is"
                          : `${weakestBelowHigh} people are`}{" "}
                        below High in{" "}
                        {weakestDim.label.charAt(0).toUpperCase() +
                          weakestDim.label.slice(1)}
                        . Their reports show the specific gap.
                        <Link
                          href="/staff/reportes"
                          className="mt-1 block ts-footnote font-bold text-[var(--accent)]"
                        >
                          Review reports →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* d) Needs a push — hasta 4 personas priorizadas con su acción */}
              <motion.div
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.25 }}
                className="card-apple bg-[var(--surface)] p-6"
              >
                <h3 className="ts-headline font-extrabold text-[var(--text-primary)]">
                  Needs a push
                </h3>
                {pushRows.length === 0 ? (
                  <div className="mt-4 flex items-center gap-2.5 ts-footnote font-medium text-[var(--text-secondary)]">
                    <span
                      aria-hidden
                      className="h-2 w-2 shrink-0 rounded-full bg-[var(--v2-green)]"
                    />
                    Everyone is moving. Check back after the next sessions.
                  </div>
                ) : (
                  <div className="mt-2 divide-y divide-[var(--hairline)]">
                    {pushRows.map(({ member: m, subtext, action }) => {
                      const initials = initialsFrom(m.full_name, m.email);
                      const displayName = m.full_name ?? m.email.split("@")[0];
                      return (
                        <div
                          key={m.user_id}
                          className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              aria-hidden
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full ts-caption-1 font-extrabold",
                                action === "pilot"
                                  ? "bg-[var(--band-a-bg)] text-[var(--band-a-text)]"
                                  : "bg-[var(--band-b-bg)] text-[var(--band-b-text)]",
                              )}
                            >
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="ts-callout font-bold text-[var(--text-primary)] truncate">
                                {displayName}
                              </div>
                              <div className="mt-0.5 ts-footnote font-medium text-[var(--text-tertiary)]">
                                {subtext}
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0 sm:pl-3">
                            {action === "report" && (
                              <AppleButton
                                as={Link}
                                href={`/report/${m.session_id}`}
                                tone="secondary"
                                size="sm"
                              >
                                Open report
                              </AppleButton>
                            )}
                            {action === "remind" && (
                              <RemindButton userId={m.user_id} />
                            )}
                            {action === "pilot" && (
                              <Link
                                href={`/report/${m.session_id}`}
                                className="inline-flex items-center rounded-[var(--radius-md)] border-2 border-[var(--v2-green)] px-4 py-2 ts-footnote font-extrabold text-[var(--band-a-text)] transition-colors duration-[var(--motion-fast)] hover:bg-[var(--band-a-bg)]"
                              >
                                View report
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        </>
        )}

        {section === "equipo" && (
        <>
        {/* Equipo — tarjetas de jugador: anillo de progreso por banda alrededor
            del avatar, chips con dato real del API, foco remedial y acción.
            Sin barras laterales de color (feedback Pablo 2026-07-16) y sin
            framing de ronda one-shot: el modelo es continuo. */}
        <section className="max-w-6xl mx-auto px-6 mt-8">
          <motion.div
            {...fadeUp}
            className="flex items-end justify-between mb-8"
          >
            <h2 className="display ts-title-1 text-[var(--text-primary)]">
              Team{" "}
              <span className="font-bold text-[var(--text-tertiary)]">
                · {agg.total}
              </span>
            </h2>
          </motion.div>

          {data.members.length === 0 ? (
            <p className="ts-body text-[var(--text-secondary)]">
              No team members yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {data.members.map((m, i) => {
                const initials = initialsFrom(m.full_name, m.email);
                const displayName = m.full_name ?? m.email.split("@")[0];
                const attention = needsAttention(m);
                const stalled = isStalledOpen(m);
                const score = m.readiness_score ?? null;
                // Banda del anillo: la del report, o derivada del score.
                const ringBand =
                  m.readiness_band ??
                  (score != null ? bandFromScore100(score) : null);
                const tone = bandTone(ringBand);
                const lastActiveDays = daysSinceIso(m.last_active_at);
                const focusDim = focusDimension(m);
                const focusBand = focusDim
                  ? (m.dimension_bands?.[focusDim.id] ?? null)
                  : null;
                const recAction = m.recommendation_action
                  ? MANAGER_ACTIONS.find(
                      (a) => a.id === m.recommendation_action,
                    )
                  : null;
                const actionNode =
                  m.session_id && m.report_id ? (
                    <AppleButton
                      as={Link}
                      href={`/report/${m.session_id}`}
                      tone="secondary"
                      size="sm"
                      className="w-full"
                    >
                      Open report
                    </AppleButton>
                  ) : m.session_status === "not_started" || stalled ? (
                    <RemindButton userId={m.user_id} className="w-full" />
                  ) : null;
                return (
                  <motion.div
                    key={m.user_id}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: i * 0.04 }}
                    className="h-full"
                  >
                    <div
                      className="card-apple flex h-full flex-col items-center bg-[var(--surface)] p-5 text-center"
                      // border-color inline: .card-apple gana por especificidad
                      // a la utility (mismo patrón que CaseCard, ver simulador.css)
                      style={
                        attention
                          ? { borderColor: "var(--band-b-bar)" }
                          : undefined
                      }
                    >
                      {/* Anillo de progreso: readiness_score/100, stroke con el
                          token de banda; solo track si aún no hay score. */}
                      <div
                        role="img"
                        aria-label={
                          score != null
                            ? `Readiness ${score} of 100`
                            : "No readiness score yet"
                        }
                        className="relative h-[68px] w-[68px]"
                      >
                        <svg
                          viewBox="0 0 68 68"
                          className="h-full w-full -rotate-90"
                        >
                          <circle
                            cx="34"
                            cy="34"
                            r="30"
                            fill="none"
                            strokeWidth="5"
                            className="stroke-[var(--surface-3)]"
                          />
                          {score != null && ringBand && (
                            <circle
                              cx="34"
                              cy="34"
                              r="30"
                              fill="none"
                              strokeWidth="5"
                              strokeLinecap="round"
                              strokeDasharray={RING_CIRCUMFERENCE}
                              strokeDashoffset={
                                RING_CIRCUMFERENCE *
                                (1 -
                                  Math.min(100, Math.max(0, score)) / 100)
                              }
                              style={{ stroke: BAND_BAR[ringBand] }}
                            />
                          )}
                        </svg>
                        <div className="absolute inset-0 grid place-items-center">
                          <div
                            aria-hidden
                            className={cn(
                              "flex h-12 w-12 items-center justify-center rounded-full ts-callout font-extrabold",
                              ringBand
                                ? `${tone.bg} ${tone.text}`
                                : "bg-[var(--accent-soft)] text-[var(--accent)]",
                            )}
                          >
                            {initials}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 w-full min-w-0">
                        <div className="ts-callout font-extrabold text-[var(--text-primary)] truncate">
                          {displayName}
                        </div>
                        <div className="mt-0.5 ts-footnote font-medium text-[var(--text-tertiary)]">
                          {memberStatusLine(m)}
                        </div>
                      </div>

                      {/* Chips de dato real: score, drills, última actividad */}
                      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                        {score != null && (
                          <span
                            className={cn(
                              "rounded-full bg-[var(--surface-2)] px-2.5 py-1 ts-caption-1 font-bold",
                              tone.text,
                            )}
                          >
                            {score}/100
                          </span>
                        )}
                        <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 ts-caption-1 font-bold text-[var(--text-secondary)]">
                          {m.practice_completed_total ?? 0} drills
                        </span>
                        {lastActiveDays !== null && (
                          <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 ts-caption-1 font-bold text-[var(--text-secondary)]">
                            {lastActiveDays === 0
                              ? "active today"
                              : `last active ${lastActiveDays}d`}
                          </span>
                        )}
                      </div>

                      {/* Foco remedial: dimensión más débil + barra por banda.
                          Sin scores por dimensión en el payload, el ancho usa
                          el score representativo canónico de la banda. */}
                      <div className="mt-4 w-full">
                        {focusDim && focusBand ? (
                          <>
                            <div className="flex items-center justify-between gap-2">
                              <span className="ts-caption-1 font-bold text-[var(--text-tertiary)]">
                                Focus
                              </span>
                              <span className="ts-caption-1 font-bold text-[var(--text-secondary)]">
                                {focusDim.label.charAt(0).toUpperCase() +
                                  focusDim.label.slice(1)}
                              </span>
                            </div>
                            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--surface-3)]">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  focusBand === "B"
                                    ? "bg-[var(--band-b-bar)]"
                                    : "accent-bg",
                                )}
                                style={{
                                  width: `${BAND_REPRESENTATIVE_SCORE[focusBand]}%`,
                                }}
                              />
                            </div>
                          </>
                        ) : m.dimension_bands ? (
                          <p className="ts-footnote font-medium text-[var(--text-tertiary)]">
                            All dimensions high
                          </p>
                        ) : (
                          <p className="ts-footnote font-medium text-[var(--text-tertiary)]">
                            No assessment yet
                          </p>
                        )}
                      </div>

                      {recAction && (
                        <AppleBadge
                          pill
                          tone={REC_BADGE_TONE[recAction.color]}
                          className="mt-4"
                        >
                          {recAction.label}
                        </AppleBadge>
                      )}

                      {actionNode && (
                        <div className="mt-auto w-full pt-5">{actionNode}</div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        </>
        )}

        {section === "reportes" && (
        <>
        {/* Reportes */}
        <section className="max-w-6xl mx-auto px-6 mt-8">
          <motion.div
            {...fadeUp}
            className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <h2 className="display ts-title-1 text-[var(--text-primary)]">
                Evidence ready to review
              </h2>
              <p className="mt-3 ts-body text-[var(--text-secondary)] max-w-2xl">
                Open the individual reports already generated. The team report
                turns on once enough sessions are completed.
              </p>
            </div>
            {/* Contador como chip pill v2; self-start para no estirarse en flex-col */}
            <AppleBadge pill tone="accent" className="shrink-0 self-start md:self-auto">
              {reportsAvailable.length} available
            </AppleBadge>
          </motion.div>

          <div className="mt-8 card-apple bg-[var(--surface)] p-2 sm:p-5">
            {reportsAvailable.length === 0 ? (
              <div className="px-3 py-8 ts-callout text-[var(--text-secondary)]">
                No reports to pull yet. They show up here once participants
                complete the case and the report is published.
              </div>
            ) : (
              <div className="divide-y divide-[var(--hairline)]">
                {reportsAvailable.map((member) => {
                  const displayName =
                    member.full_name ?? member.email.split("@")[0];
                  return (
                    <div
                      key={`${member.user_id}-report`}
                      className="flex flex-col gap-3 px-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="ts-body font-bold text-[var(--text-primary)] truncate">
                          {displayName}
                        </div>
                        <div className="mt-1 ts-footnote text-[var(--text-tertiary)] mono">
                          {member.report_status ?? "report generated"}
                        </div>
                      </div>
                      <AppleButton
                        as={Link}
                        href={`/report/${member.session_id}`}
                        tone="primary"
                        size="sm"
                        className="shrink-0 px-5"
                      >
                        Open report
                      </AppleButton>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        </>
        )}

        {section === "matriz" && (
        <>
        {/* Matriz agregada */}
        <section className="max-w-6xl mx-auto px-6 mt-8">
          <motion.div {...fadeUp} className="mb-8">
            <h2 className="display ts-title-1 text-[var(--text-primary)]">
              Dimension × band matrix
            </h2>
            <p className="mt-3 ts-body text-[var(--text-secondary)] max-w-2xl">
              Counts how many people landed in each band per dimension. The
              matrix keeps a serious gap from hiding behind the overall average.
            </p>
          </motion.div>

          {/* Heatmap v2: celdas como tiles radius-md tintados con los tokens
              de banda cuando hay gente (count>0) y surface-2 cuando no.
              gap-2 entre celdas para que la matriz respire. */}
          <div className="card-apple bg-[var(--surface)] p-4 sm:p-6">
            <div className="hidden md:grid grid-cols-[200px_repeat(6,minmax(0,1fr))] gap-2 mb-2">
              <div className="px-3 py-2 ts-footnote font-bold text-[var(--text-tertiary)]">
                Band
              </div>
              {DIMENSIONS.map((dimension) => (
                <div
                  key={dimension.id}
                  className="px-3 py-2 ts-footnote font-bold text-[var(--text-secondary)]"
                >
                  {dimension.label.charAt(0).toUpperCase() +
                    dimension.label.slice(1)}
                </div>
              ))}
            </div>

            <div className="space-y-4 md:space-y-2">
              {BAND_ROWS.map((row, rowIndex) => {
                const tone = bandTone(row.band);
                return (
                  <motion.div
                    key={row.band}
                    {...fadeUp}
                    transition={{
                      ...fadeUp.transition,
                      delay: rowIndex * 0.04,
                    }}
                    className="grid grid-cols-1 gap-2 md:grid-cols-[200px_repeat(6,minmax(0,1fr))]"
                  >
                    <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 ts-caption-1 font-bold ${tone.bg} ${tone.text}`}
                      >
                        {row.label}
                      </span>
                      <p className="mt-2 ts-footnote font-medium leading-[1.45] text-[var(--text-secondary)]">
                        {row.description}
                      </p>
                    </div>
                    {DIMENSIONS.map((dimension) => {
                      const count =
                        agg.dimension_band_matrix?.[dimension.id]?.[
                          row.band
                        ] ?? 0;
                      const filled = count > 0;
                      return (
                        <div
                          key={`${row.band}-${dimension.id}`}
                          className={`flex items-center justify-between gap-3 rounded-[var(--radius-md)] p-4 md:flex-col md:items-start md:justify-center ${
                            filled ? tone.bg : "bg-[var(--surface-2)]"
                          }`}
                        >
                          <span className="md:hidden ts-subhead font-bold text-[var(--text-secondary)]">
                            {dimension.label.charAt(0).toUpperCase() +
                              dimension.label.slice(1)}
                          </span>
                          <span className="flex items-baseline gap-1.5">
                            <span
                              className={`mono ts-title-2 font-extrabold ${
                                filled
                                  ? tone.text
                                  : "text-[var(--text-tertiary)]"
                              }`}
                            >
                              {count}
                            </span>
                            <span
                              className={`ts-caption-1 font-bold ${
                                filled
                                  ? tone.text
                                  : "text-[var(--text-tertiary)]"
                              } ${filled ? "opacity-75" : ""}`}
                            >
                              {count === 1 ? "person" : "people"}
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-4 px-1 ts-footnote text-[var(--text-tertiary)]">
              Absolute counts from completed sessions. Participants in progress
              are not included until their report is published.
            </div>
          </div>
        </section>

        {/* Promedios por dimensión */}
        <section className="max-w-6xl mx-auto px-6 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            {DIMENSIONS.map((dimension, index) => {
              const score = dimsAvg[dimension.id] ?? 0;
              return (
                <motion.div
                  key={dimension.id}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: index * 0.04 }}
                  className="card-apple bg-[var(--surface)] p-5"
                >
                  <div className="ts-subhead font-bold text-[var(--text-primary)]">
                    {dimension.label.charAt(0).toUpperCase() +
                      dimension.label.slice(1)}
                  </div>
                  <div className="mt-3 mono ts-title-2 font-extrabold text-[var(--text-primary)]">
                    {score}
                    <span className="ts-callout font-bold text-[var(--text-tertiary)]">
                      /100
                    </span>
                  </div>
                  {/* Barra chunky v2 (h-2 redondeada), animada con framer */}
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-3)]">
                    <motion.div
                      className="h-full rounded-full accent-bg"
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        </>
        )}

        {section === "recomendaciones" && (
        <>
        {/* Acciones recomendadas */}
        <section className="max-w-6xl mx-auto px-6 mt-8">
          <motion.div {...fadeUp} className="mb-8">
            <h2 className="display ts-title-1 text-[var(--text-primary)]">
              Four paths per person
            </h2>
          </motion.div>

          {/* Cards v2: chip pill con la acción + count real como stat
              extrabold + la descripción como evidencia. Debajo, las personas
              con esa recomendación y su reporte: el reporte ES la acción hoy
              (no hay workflow de aplicar Pilot/Coach/Pause en producto). */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MANAGER_ACTIONS.map((a, i) => {
              const count =
                agg.recommendation_counts?.[
                  a.id as keyof typeof agg.recommendation_counts
                ] ?? 0;
              const people = data.members.filter(
                (m) => m.recommendation_action === a.id && m.session_id,
              );
              return (
                <motion.div
                  key={a.id}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.04 }}
                >
                  <AppleCard className="h-full">
                    <AppleCardBody className="p-7">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="display ts-display text-[var(--text-primary)] leading-none">
                            {count}
                          </div>
                          <div className="mt-2 ts-footnote font-bold text-[var(--text-tertiary)]">
                            people
                          </div>
                        </div>
                        <AppleBadge pill tone={REC_BADGE_TONE[a.color]}>
                          {a.label}
                        </AppleBadge>
                      </div>
                      <p className="mt-5 ts-callout font-medium text-[var(--text-secondary)] leading-[1.55]">
                        {a.description}
                      </p>
                      {people.length > 0 && (
                        <div className="mt-5 divide-y divide-[var(--hairline)] border-t border-[var(--hairline)]">
                          {people.map((m) => (
                            <div
                              key={m.user_id}
                              className="flex items-center justify-between gap-3 py-3"
                            >
                              <span className="min-w-0 truncate ts-callout font-bold text-[var(--text-primary)]">
                                {m.full_name ?? m.email.split("@")[0]}
                              </span>
                              <AppleButton
                                as={Link}
                                href={`/report/${m.session_id}`}
                                tone="secondary"
                                size="sm"
                                className="shrink-0"
                              >
                                Open report
                              </AppleButton>
                            </div>
                          ))}
                        </div>
                      )}
                    </AppleCardBody>
                  </AppleCard>
                </motion.div>
              );
            })}
          </div>
        </section>
        </>
        )}
      </main>
      {/* Modal de invitación (W2-D): montado una vez para todo el dashboard
          del manager; el botón del header lo abre. */}
      {inviteGate === "admin" && inviteOrgId && (
        <InviteTeamModal
          isOpen={inviteOpen}
          onOpenChange={setInviteOpen}
          orgId={inviteOrgId}
          onInvited={refreshInviteCounts}
        />
      )}
    </>
  );
}
