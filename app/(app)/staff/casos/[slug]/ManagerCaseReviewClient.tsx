"use client";

/**
 * Cliente de "Caso revisión" (manager): quién de su equipo lo completó (con su
 * banda + link al reporte), fortalezas observadas en el equipo, y el recorrido
 * read-only de las slides. El caso jugable llega del server; los datos del
 * equipo de GET /api/cases/[slug]/team-review.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AppleErrorState,
  AppleIcon,
  AppleSkeleton,
} from "@/components/simulador/apple";
import { CaseReviewWalkthrough } from "@/components/simulador/CaseReviewWalkthrough";
import { BAND_LABEL, type Band } from "@/lib/simulador/case-catalog";
import type { PlayableCase } from "@/lib/simulador/load-assembled-case";

interface Completion {
  session_id: string;
  user_name: string;
  band: Band | null;
  completed_at: string | null;
  has_report: boolean;
}

interface TeamReview {
  case: { base_case_id: string; title: string | null };
  completions: Completion[];
  strengths: Array<{ text: string; count: number }>;
}

const BAND_TONE: Record<Band, { bg: string; text: string }> = {
  A: { bg: "var(--band-a-bg)", text: "var(--band-a-text)" },
  M: { bg: "var(--band-m-bg)", text: "var(--band-m-text)" },
  B: { bg: "var(--band-b-bg)", text: "var(--band-b-text)" },
};

function BandPill({ band }: { band: Band | null }) {
  if (!band) {
    return (
      <span className="ts-caption-1 text-[var(--text-tertiary)]">no band</span>
    );
  }
  return (
    <span
      className="inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 ts-caption-1 font-semibold"
      style={{ backgroundColor: BAND_TONE[band].bg, color: BAND_TONE[band].text }}
    >
      {BAND_LABEL[band]}
    </span>
  );
}

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

export function ManagerCaseReviewClient({
  slug,
  fallbackTitle,
  playableCase,
}: {
  slug: string;
  fallbackTitle: string;
  playableCase: PlayableCase | null;
}) {
  const [data, setData] = useState<TeamReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/cases/${encodeURIComponent(slug)}/team-review`,
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? `Error ${res.status}`);
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const title = data?.case.title ?? fallbackTitle;

  return (
    <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-8 py-12 sm:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-[900px]">
        <Link
          href="/staff/casos"
          className="inline-flex items-center gap-1 ts-caption-1 text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <AppleIcon name="chevronLeft" className="h-3.5 w-3.5" />
          Team cases
        </Link>

        <h1 className="mt-4 ts-title-1 font-semibold tracking-tight text-[var(--text-primary)]">
          {title}
        </h1>
        <p className="mt-2 ts-body text-[var(--text-secondary)]">
          Review the case and how your team did.
        </p>

        {loading ? (
          <div className="mt-8 space-y-3">
            <AppleSkeleton className="h-20 w-full" />
            <AppleSkeleton className="h-40 w-full" />
          </div>
        ) : error ? (
          <div className="mt-8">
            <AppleErrorState
              title="We couldn't load the case"
              body={error}
              actionLabel="Try again"
              onAction={load}
            />
          </div>
        ) : (
          <>
            {/* quién lo completó */}
            <section className="mt-8">
              <h2 className="ts-caption-2 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                Who completed it
              </h2>
              {data && data.completions.length > 0 ? (
                <div className="mt-3 divide-y divide-[var(--hairline)] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--surface-2)]">
                  {data.completions.map((c) => (
                    <div
                      key={c.session_id}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate ts-callout font-medium text-[var(--text-primary)]">
                          {c.user_name}
                        </div>
                        {c.completed_at && (
                          <div className="ts-caption-1 text-[var(--text-tertiary)]">
                            {fmtDate(c.completed_at)}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-none items-center gap-3">
                        <BandPill band={c.band} />
                        {c.has_report && (
                          <Link
                            href={`/report/${c.session_id}`}
                            className="ts-caption-1 font-medium text-[var(--accent)] hover:underline"
                          >
                            View report
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-5 ts-subhead text-[var(--text-secondary)]">
                  No one on your team has completed this case yet.
                </p>
              )}
            </section>

            {/* fortalezas observadas */}
            {data && data.strengths.length > 0 && (
              <section className="mt-8">
                <h2 className="ts-caption-2 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                  Strengths observed across the team
                </h2>
                <ul className="mt-3 space-y-2">
                  {data.strengths.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 rounded-[var(--radius-md)] bg-[var(--surface-2)] px-4 py-3"
                    >
                      <span className="mt-0.5 flex-none text-[var(--band-a-text)]">
                        <AppleIcon name="check" className="h-4 w-4" />
                      </span>
                      <span className="ts-subhead leading-relaxed text-[var(--text-secondary)]">
                        {s.text}
                        {s.count > 1 && (
                          <span className="ml-1.5 ts-caption-1 text-[var(--text-tertiary)]">
                            ×{s.count}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* recorrido de slides */}
            <section className="mt-10">
              <h2 className="ts-caption-2 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                Case content
              </h2>
              <div className="mt-3">
                {playableCase ? (
                  <CaseReviewWalkthrough playableCase={playableCase} />
                ) : (
                  <div className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-8 text-center ts-subhead text-[var(--text-secondary)]">
                    The slide walkthrough isn&apos;t available for this case.
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
