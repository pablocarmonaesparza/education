"use client";

/**
 * Cliente de "Caso revisión" (staff/admin): efectividad del caso across orgs
 * + recorrido read-only de todas las slides. El caso jugable llega del server
 * (registry estático); la efectividad se agrega vía GET /api/admin/cases/[slug].
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AppleErrorState,
  AppleIcon,
  AppleSkeleton,
} from "@/components/simulador/apple";
import { CaseReviewWalkthrough } from "@/components/simulador/CaseReviewWalkthrough";
import { departmentLabel, BAND_LABEL, type Band } from "@/lib/simulador/case-catalog";
import type { PlayableCase } from "@/lib/simulador/load-assembled-case";

interface Effectiveness {
  orgs_using: Array<{ id: string; name: string; bespoke: boolean }>;
  orgs_count: number;
  sessions_total: number;
  sessions_completed: number;
  unique_completers: number;
  band_distribution: Record<Band, number>;
}

interface CaseMeta {
  base_case_id: string;
  slug: string;
  title: string;
  status: string;
  version: number;
  level_primary: string | null;
  career_key: string | null;
  difficulty: string | null;
  duration_estimate_min: number | null;
  variants_count: number;
}

const BAND_TONE: Record<Band, { bg: string; text: string; bar: string }> = {
  A: { bg: "var(--band-a-bg)", text: "var(--band-a-text)", bar: "var(--band-a-bar)" },
  M: { bg: "var(--band-m-bg)", text: "var(--band-m-text)", bar: "var(--band-m-bar)" },
  B: { bg: "var(--band-b-bg)", text: "var(--band-b-text)", bar: "var(--band-b-bar)" },
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
      <div className="ts-title-2 font-semibold tabular-nums text-[var(--text-primary)]">
        {value}
      </div>
      <div className="mt-1 ts-caption-1 text-[var(--text-tertiary)]">{label}</div>
    </div>
  );
}

export function AdminCaseReviewClient({
  slug,
  playableCase,
}: {
  slug: string;
  playableCase: PlayableCase | null;
}) {
  const [meta, setMeta] = useState<CaseMeta | null>(null);
  const [eff, setEff] = useState<Effectiveness | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/cases/${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `Error ${res.status}`);
      setMeta(data.case);
      setEff(data.effectiveness);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const bandTotal = eff
    ? eff.band_distribution.A + eff.band_distribution.M + eff.band_distribution.B
    : 0;

  return (
    <main className="surface-canvas min-h-screen pb-24">
      <section className="mx-auto w-full max-w-4xl px-6 pt-14">
        <Link
          href="/admin/cases"
          className="inline-flex items-center gap-1 ts-caption-1 text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <AppleIcon name="chevronLeft" className="h-3.5 w-3.5" />
          Casos
        </Link>

        {loading ? (
          <div className="mt-6 space-y-4">
            <AppleSkeleton className="h-10 w-2/3" />
            <AppleSkeleton className="h-24 w-full" />
          </div>
        ) : error ? (
          <div className="mt-6">
            <AppleErrorState
              title="No pudimos cargar el caso"
              body={error}
              actionLabel="Reintentar"
              onAction={load}
            />
          </div>
        ) : meta ? (
          <>
            {/* header */}
            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-2 ts-caption-1 text-[var(--text-tertiary)]">
                <span>{departmentLabel(meta.career_key)}</span>
                {meta.difficulty && (
                  <>
                    <span aria-hidden>·</span>
                    <span className="capitalize">{meta.difficulty}</span>
                  </>
                )}
                {meta.duration_estimate_min && (
                  <>
                    <span aria-hidden>·</span>
                    <span>{meta.duration_estimate_min} min</span>
                  </>
                )}
                <span aria-hidden>·</span>
                <span className="mono">{meta.slug}</span>
              </div>
              <h1 className="mt-2 ts-title-1 font-semibold tracking-tight text-[var(--text-primary)]">
                {meta.title}
              </h1>
            </div>

            {/* efectividad */}
            {eff && (
              <div className="mt-8">
                <h2 className="ts-caption-2 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                  Efectividad
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat label="Organizaciones" value={eff.orgs_count} />
                  <Stat label="Lo completaron" value={eff.unique_completers} />
                  <Stat label="Sesiones" value={eff.sessions_total} />
                  <Stat label="Completadas" value={eff.sessions_completed} />
                </div>

                {/* distribución de bandas */}
                {bandTotal > 0 && (
                  <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
                    <div className="ts-caption-1 text-[var(--text-tertiary)]">
                      Distribución de bandas ({bandTotal} evaluaciones)
                    </div>
                    <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full">
                      {(["A", "M", "B"] as Band[]).map((b) =>
                        eff.band_distribution[b] > 0 ? (
                          <div
                            key={b}
                            style={{
                              width: `${(eff.band_distribution[b] / bandTotal) * 100}%`,
                              backgroundColor: BAND_TONE[b].bar,
                            }}
                          />
                        ) : null,
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                      {(["A", "M", "B"] as Band[]).map((b) => (
                        <span
                          key={b}
                          className="inline-flex items-center gap-1.5 ts-caption-1"
                          style={{ color: BAND_TONE[b].text }}
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: BAND_TONE[b].bar }}
                          />
                          {BAND_LABEL[b]}: {eff.band_distribution[b]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* orgs que lo usan */}
                {eff.orgs_using.length > 0 && (
                  <div className="mt-4">
                    <div className="ts-caption-1 text-[var(--text-tertiary)]">
                      Organizaciones que lo usan
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {eff.orgs_using.map((o) => (
                        <span
                          key={o.id}
                          className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--surface-2)] px-2.5 py-1 ts-caption-1 text-[var(--text-secondary)]"
                        >
                          {o.name}
                          {o.bespoke && (
                            <span className="ts-caption-2 text-[var(--accent)]">
                              bespoke
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* recorrido de slides */}
            <div className="mt-10">
              <h2 className="ts-caption-2 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                Contenido del caso
              </h2>
              <div className="mt-3">
                {playableCase ? (
                  <CaseReviewWalkthrough playableCase={playableCase} />
                ) : (
                  <div className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-8 text-center ts-subhead text-[var(--text-secondary)]">
                    Este caso no está en el registro estático de contenido, así que
                    no hay recorrido de slides disponible.
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
