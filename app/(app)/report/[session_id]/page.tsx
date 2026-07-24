"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppleButton, AppleBadge } from "@/components/simulador/apple";
import { motion } from "framer-motion";
import { SurfaceNav } from "@/components/simulador/SurfaceNav";
import { DIMENSIONS } from "@/lib/simulador/config";
import type { BandKey } from "@/lib/simulador/config";
import {
  BAND_DISPLAY,
  bandScore,
  capFirst,
  computeOverall,
  dimensionsById,
  humanRiskType,
  normalizeReportDimensions,
  redactSensitiveEvidence,
  type ReportEnvelope,
  type ReportPayload,
  type ReportPracticeEntry,
} from "@/lib/simulador/reports/model";
import { reportCopy } from "@/lib/simulador/copy/report";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
};

function bandTone(b: BandKey) {
  if (b === "A")
    return {
      bg: "bg-[var(--band-a-bg)]",
      text: "text-[var(--band-a-text)]",
      bar: "var(--band-a-bar)",
    };
  if (b === "M")
    return {
      bg: "bg-[var(--band-m-bg)]",
      text: "text-[var(--band-m-text)]",
      bar: "var(--band-m-bar)",
    };
  return {
    bg: "bg-[var(--band-b-bg)]",
    text: "text-[var(--band-b-text)]",
    bar: "var(--band-b-bar)",
  };
}

function bandBadgeTone(b: BandKey): "success" | "warning" | "danger" {
  return b === "A" ? "success" : b === "M" ? "warning" : "danger";
}

function severityBadgeTone(
  s: "high" | "medium" | "low",
): "danger" | "warning" | "neutral" {
  return s === "high" ? "danger" : s === "medium" ? "warning" : "neutral";
}

function severityTone(s: "high" | "medium" | "low") {
  if (s === "high")
    return {
      bg: "bg-[var(--band-b-bg)]",
      text: "text-[var(--band-b-text)]",
      label: reportCopy.risk_events.severity_labels.high,
    };
  if (s === "medium")
    return {
      bg: "bg-[var(--band-m-bg)]",
      text: "text-[var(--band-m-text)]",
      label: reportCopy.risk_events.severity_labels.medium,
    };
  return {
    bg: "bg-[var(--surface-3)]",
    text: "text-[var(--text-secondary)]",
    label: reportCopy.risk_events.severity_labels.low,
  };
}

// ============================================================================
// PAGE
// ============================================================================

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 30; // ~2 minutos a 4s

export default function ReportePage() {
  const params = useParams<{ session_id: string }>();
  const sessionId = params?.session_id ?? null;

  const [envelope, setEnvelope] = useState<ReportEnvelope | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function fetchOnce() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/report`, {
          cache: "no-store",
        });
        if (cancelled) return;
        if (!res.ok && res.status !== 404) {
          const data = await res.json().catch(() => null);
          throw new Error(
            data?.error ?? `Error ${res.status} while loading the report.`,
          );
        }
        const data = (await res.json()) as ReportEnvelope;
        setEnvelope(data);

        // Si está en estado intermedio, seguimos polleando.
        if (
          data.status === "none" &&
          data.session_status === "submitted" &&
          pollCount < MAX_POLLS
        ) {
          timer = setTimeout(() => {
            if (!cancelled) setPollCount((c) => c + 1);
          }, POLL_INTERVAL_MS);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unexpected error.");
      }
    }

    fetchOnce();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [sessionId, pollCount]);

  // ============ LOADING / WAITING / ERROR ============
  if (error) {
    return (
      <ShellMessage
        eyebrow="Report error"
        title="We could not load your report."
        body={error}
      />
    );
  }

  if (!envelope) {
    return (
      <ShellMessage
        eyebrow="Loading"
        title="Preparing your report…"
        spinner
      />
    );
  }

  if (envelope.status === "none") {
    return (
      <ShellMessage
        eyebrow="Scoring in progress"
        title="We are scoring your session."
        body={
          envelope.message ??
          "The LLM judge compares your answers against the rubric. This usually takes about 30 seconds."
        }
        spinner
      />
    );
  }

  if (!envelope.payload) {
    return (
      <ShellMessage
        eyebrow="No payload"
        title="The report has no content yet."
        body="Check back in a few seconds."
      />
    );
  }

  return (
    <ReportView
      payload={envelope.payload}
      status={envelope.status}
      generatedAt={envelope.generated_at}
      sessionId={sessionId ?? ""}
      practice={envelope.practice ?? []}
    />
  );
}

// ============================================================================
// SHELL MESSAGE (loading / waiting / error)
// ============================================================================

function ShellMessage({
  eyebrow,
  title,
  body,
  spinner,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  spinner?: boolean;
}) {
  return (
    <>
      <SurfaceNav />
      <main className="surface-canvas min-h-[calc(100vh-3.5rem)] grid place-items-center px-6">
        <motion.div {...fadeUp} className="max-w-md text-center">
          {spinner && (
            <div className="mx-auto h-10 w-10 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
          )}
          <div className={`eyebrow ${spinner ? "mt-8" : ""}`}>{eyebrow}</div>
          <h1 className="display mt-3 ts-title-1 text-[var(--text-primary)]">
            {title}
          </h1>
          {body && (
            <p className="mt-4 ts-body text-[var(--text-secondary)] leading-[1.55]">
              {body}
            </p>
          )}
        </motion.div>
      </main>
    </>
  );
}

// ============================================================================
// REPORT VIEW
// ============================================================================

function ReportView({
  payload,
  status,
  generatedAt,
  sessionId,
  practice,
}: {
  payload: ReportPayload;
  status: "pending_review" | "published" | "shared";
  generatedAt?: string;
  sessionId: string;
  practice: ReportPracticeEntry[];
}) {
  const bands = dimensionsById(payload);
  const normalizedDimensions = normalizeReportDimensions(payload);
  const { score: overallScore, band: overallBand } = computeOverall(payload);

  const generatedDate = generatedAt ? new Date(generatedAt) : null;
  const evaluatedAtStr = generatedDate
    ? generatedDate.toISOString().slice(0, 10)
    : "—";

  const isPending = status === "pending_review";

  // R-09 (RULES_LEDGER): el share-link se retiró en v1 — la página pública
  // /shared/report/[token] no existe y FRONT_CONTRACT la declara fuera de esta
  // versión. Si el manager quiere compartir, descarga el PDF.

  return (
    <>
      <SurfaceNav />
      <main className="surface-canvas min-h-screen pb-24">
        {/* Disclaimer */}
        <div className="border-b border-[var(--hairline)] bg-[var(--surface-2)]">
          <div className="reading-col px-6 py-3 flex items-center gap-2 ts-footnote text-[var(--text-secondary)]">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: isPending
                  ? "var(--band-b-bar)"
                  : "var(--band-a-bar)",
              }}
            />
            <span>
              <span className="text-[var(--text-primary)] font-medium">
                {isPending
                  ? "Under human review"
                  : "Report published"}
              </span>{" "}
              · judge {payload.judge_model} · rubric {payload.rubric_version}
              {isPending &&
                " · this report has risk events that the Itera team confirms before it goes to the manager."}
            </span>
          </div>
        </div>

        {/* Header */}
        <section className="reading-col px-6 pt-14">
          <motion.div {...fadeUp}>
            <div className="eyebrow">Executive report · participant</div>
            <h1 className="display display-tight mt-5 ts-display-lg sm:ts-display-xl text-[var(--text-primary)]">
              Assessment
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-3 ts-subhead text-[var(--text-secondary)]">
              <span className="mono">
                {sessionId.slice(0, 8).toUpperCase()}
              </span>
              <span className="text-[var(--border-strong)]">·</span>
              <span>{evaluatedAtStr}</span>
              <span className="text-[var(--border-strong)]">·</span>
              <span>{payload.case_version}</span>
            </div>
          </motion.div>

          {/* Overall pull */}
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.06 }}
            className="mt-12 card-apple bg-[var(--surface)] p-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-8">
              <div className="flex-shrink-0">
                <div className="eyebrow">Overall readiness</div>
                <div className="display mt-3 ts-display-4xl text-[var(--text-primary)] leading-none">
                  {overallScore}
                  <span className="text-[var(--text-tertiary)] ts-title-1 ml-1">
                    /100
                  </span>
                </div>
                <div className="mt-3">
                  <AppleBadge tone={bandBadgeTone(overallBand)} radius="full">
                    {BAND_DISPLAY[overallBand]} band
                  </AppleBadge>
                </div>
              </div>
              <div className="flex-1 pt-1">
                <p className="ts-body text-[var(--text-primary)] leading-[1.65]">
                  {capFirst(payload.recommendation.reason)}
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Dimensiones */}
        <section className="reading-col px-6 mt-20">
          <motion.div {...fadeUp}>
            <div className="eyebrow">Performance by dimension</div>
            <h2 className="display mt-3 ts-title-1 text-[var(--text-primary)]">
              The six dimensions
            </h2>
          </motion.div>

          <div className="mt-8 space-y-5">
            {DIMENSIONS.map((d, i) => {
              const band = (bands[d.id] ?? "M") as BandKey;
              const score = bandScore(band);
              const tone = bandTone(band);
              const dimRationale = normalizedDimensions.find(
                (x) => x.id === d.id,
              )?.rationale;
              return (
                <motion.div
                  key={d.id}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.04 }}
                  className="card-apple bg-[var(--surface)] p-6"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="ts-headline font-semibold text-[var(--text-primary)]">
                          {capFirst(d.label)}
                        </span>
                        <AppleBadge tone={bandBadgeTone(band)} radius="full">
                          {BAND_DISPLAY[band]} band
                        </AppleBadge>
                      </div>
                      <p className="mt-2 ts-callout text-[var(--text-secondary)] leading-[1.6]">
                        {capFirst(dimRationale ?? d.description)}
                      </p>
                    </div>
                    <span className="ts-body-xl mono font-semibold text-[var(--text-primary)] flex-shrink-0">
                      {score}
                    </span>
                  </div>
                  <div className="mt-4 h-[5px] bg-[var(--surface-3)] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: tone.bar }}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{
                        duration: 0.8,
                        delay: 0.15 + i * 0.04,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Gaps */}
        {payload.gaps.length > 0 && (
          <section className="reading-col px-6 mt-20">
            <motion.div {...fadeUp}>
              <div className="eyebrow">Gaps found</div>
              <h2 className="display mt-3 ts-title-1 text-[var(--text-primary)]">
                Where it went wrong
              </h2>
            </motion.div>

            <div className="mt-8 space-y-3">
              {payload.gaps.map((g, i) => {
                const tone = severityTone(g.severity);
                return (
                  <motion.div
                    key={g.id + i}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                    className="card-apple bg-[var(--surface)] p-6"
                  >
                    <div className="flex items-start gap-4">
                      <AppleBadge
                        tone={severityBadgeTone(g.severity)}
                        radius="full"
                        className="flex-shrink-0 mt-1"
                      >
                        {tone.label} severity
                      </AppleBadge>
                      <div className="flex-1 min-w-0">
                        <div className="eyebrow">What we saw</div>
                        <p className="mt-2 ts-body text-[var(--text-primary)] leading-[1.65]">
                          {capFirst(g.observed)}
                        </p>
                        <div className="eyebrow mt-5">Why it matters</div>
                        <p className="mt-2 ts-callout text-[var(--text-secondary)] leading-[1.65]">
                          {capFirst(g.why_matters)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Risk events */}
        {payload.risk_events.length > 0 && (
          <section className="reading-col px-6 mt-20">
            <motion.div {...fadeUp}>
              <div className="eyebrow">Risk events</div>
              <h2 className="display mt-3 ts-title-1 text-[var(--text-primary)]">
                Critical moments in the session
              </h2>
            </motion.div>

            <div className="mt-8 space-y-3">
              {payload.risk_events.map((e, i) => {
                const tone = severityTone(e.severity);
                return (
                  <motion.div
                    key={e.type + i}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                    className="card-apple bg-[var(--surface)] p-6"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="mono ts-footnote text-[var(--text-tertiary)] flex-shrink-0">
                          {reportCopy.risk_events.step_label(e.step_ordinal)}
                        </span>
                        <AppleBadge tone={severityBadgeTone(e.severity)} radius="full">
                          {tone.label}
                        </AppleBadge>
                        <span className="ts-callout text-[var(--text-primary)] truncate">
                          {humanRiskType(e.type)}
                        </span>
                      </div>
                    </div>
                    <blockquote className="mt-4 pl-4 border-l-2 border-[var(--border)] ts-callout text-[var(--text-secondary)] italic leading-[1.65]">
                      “
                      {capFirst(
                        redactSensitiveEvidence(e.evidence_text, e.severity),
                      )}
                      ”
                    </blockquote>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Fortalezas */}
        {payload.strengths.length > 0 && (
          <section className="reading-col px-6 mt-20">
            <motion.div {...fadeUp}>
              <div className="eyebrow">Strengths</div>
              <h2 className="display mt-3 ts-title-1 text-[var(--text-primary)]">
                What went well
              </h2>
            </motion.div>

            <ul className="mt-8 space-y-4">
              {payload.strengths.map((s, i) => (
                <motion.li
                  key={i}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.04 }}
                  className="flex items-start gap-4"
                >
                  <span
                    className="flex-shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: "var(--accent)" }}
                  />
                  <p className="ts-body text-[var(--text-primary)] leading-[1.65]">
                    {capFirst(s)}
                  </p>
                </motion.li>
              ))}
            </ul>
          </section>
        )}

        {/* Práctica sugerida — beats desbloqueados por los gaps de esta sesión */}
        {practice.length > 0 && (
          <section className="reading-col px-6 mt-20">
            <motion.div {...fadeUp}>
              <div className="ts-caption-1 font-medium text-[var(--text-tertiary)]">
                {reportCopy.practice.eyebrow}
              </div>
              <h2 className="display mt-3 ts-title-1 text-[var(--text-primary)]">
                Fix what showed up
              </h2>
              <p className="mt-4 ts-body text-[var(--text-secondary)] leading-[1.65] max-w-2xl">
                {reportCopy.practice.intro}
              </p>
            </motion.div>

            <div className="mt-8 space-y-3">
              {practice.map((p, i) => {
                const dimensionLabel = p.dimension_key
                  ? DIMENSIONS.find((d) => d.id === p.dimension_key)?.label
                  : null;
                const isCompleted = p.status === "completed";
                return (
                  <motion.div
                    key={p.slug}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: i * 0.04 }}
                    className="card-apple bg-[var(--surface)] p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="ts-body font-semibold text-[var(--text-primary)]">
                          {p.title}
                        </div>
                        <div className="mt-1 ts-footnote text-[var(--text-tertiary)]">
                          {p.duration_min} min
                          {dimensionLabel ? ` · ${capFirst(dimensionLabel)}` : ""}
                        </div>
                      </div>
                      {isCompleted ? (
                        <span className="inline-flex shrink-0 items-center rounded-full bg-[var(--band-a-bg)] px-3 py-1 ts-caption-1 font-semibold text-[var(--band-a-text)]">
                          Completed
                        </span>
                      ) : (
                        <AppleButton
                          as={Link}
                          href={`/practica/${p.slug}`}
                          tone="primary"
                          size="sm"
                          className="shrink-0 px-5"
                        >
                          {reportCopy.practice.cta_button}
                        </AppleButton>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Recomendación */}
        <section className="reading-col px-6 mt-20">
          <motion.div
            {...fadeUp}
            className="card-apple p-8"
            style={{
              backgroundColor: "var(--accent-soft)",
              borderColor: "var(--accent)",
              borderWidth: 1,
            }}
          >
            <div className="eyebrow accent-text">
              {reportCopy.recommendation_card.eyebrow}
            </div>
            <h2 className="display mt-3 ts-display text-[var(--text-primary)]">
              {/* El enum de BD no cambia: se traduce en la capa de display. */}
              {reportCopy.header.recommendation_actions[
                payload.recommendation.action
              ]}
            </h2>
            <p className="mt-3 ts-body text-[var(--text-secondary)]">
              {capFirst(payload.recommendation.applies_to)}
            </p>

            <div className="mt-7">
              <div className="eyebrow">{reportCopy.next_actions.eyebrow}</div>
              <ol className="mt-4 space-y-3">
                {payload.recommendation.next_week_actions.map((a, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="mono ts-subhead text-[var(--text-tertiary)] flex-shrink-0 mt-0.5 w-5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="ts-body text-[var(--text-primary)] leading-[1.6]">
                      {capFirst(a)}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="mt-10 flex flex-col sm:flex-row sm:flex-wrap gap-3"
          >
            <AppleButton
              as={Link}
              href={`/api/sessions/${sessionId}/report/pdf`}
              tone="secondary"
              size="lg"
              className="h-12 px-7"
            >
              {reportCopy.share.pdf_download_label}
            </AppleButton>
            <AppleButton
              as={Link}
              href="/staff"
              tone="secondary"
              size="lg"
              className="h-12 px-7"
            >
              Manager view
            </AppleButton>
            <AppleButton
              as={Link}
              href="/"
              tone="secondary"
              size="lg"
              className="h-12 px-7"
            >
              Back to home
            </AppleButton>
          </motion.div>

        </section>

        {/* Meta footer */}
        <section className="reading-col px-6 mt-20">
          <div className="border-t border-[var(--hairline)] pt-6 flex flex-wrap gap-x-6 gap-y-2 ts-footnote text-[var(--text-tertiary)] mono">
            <span>Judge {payload.judge_model}</span>
            <span>·</span>
            <span>Rubric {payload.rubric_version}</span>
            <span>·</span>
            <span>Case {payload.case_version}</span>
            <span>·</span>
            <span>Variant {payload.variant}</span>
            <span>·</span>
            <span>Eval {(payload.duration_ms / 1000).toFixed(1)}s</span>
          </div>
        </section>
      </main>
    </>
  );
}
